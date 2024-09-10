'use client';
import { assistantAtom, userThreadAtom } from '@/atoms';
import axios from 'axios';
import { useAtom } from 'jotai';
import { Message, Run } from 'openai/resources/beta/threads/index';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const POLLING_FREQUENCY_MS = 1000;

function ChatPage() {
  const [userThread] = useAtom(userThreadAtom);
  const [assistant] = useAtom(assistantAtom);

  const [fetching, setFetching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);

  const startRun = async (threadId: string, assistantId: string): Promise<string> => {
    try {
      const {
        data: { success, run },
      } = await axios.post<{
        success: boolean;
        error?: string;
        run?: Run;
      }>('/api/run/create', {
        threadId,
        assistantId,
      });

      console.log('CREATED RUN', run, threadId, assistantId);

      if (!success || !run) {
        console.error('ERR');
        toast.error('Failed to start run');
        return '';
      }

      return run.id;
    } catch (e) {
      console.error(e);
      return '';
    }
  };

  const scrollPage = () => {
    const chatContainer = document.getElementById('chatContainer') as HTMLDivElement;
    if (chatContainer) {
      window.scrollTo({
        top: chatContainer.clientHeight * 2,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollPage();
  }, [sending, polling]);

  const pollRunStatus = async (threadId: string, runId: string) => {
    setPolling(true);

    const intervalId = setInterval(async () => {
      try {
        const {
          data: { run, success },
        } = await axios.post<{ success: boolean; error?: string; run?: Run }>('/api/run/retrieve', {
          threadId,
          runId,
        });

        if (!success || !run) {
          console.error('ERR');
          toast.error('Failed to start run');
          return '';
        }

        if (run.status === 'completed') {
          clearInterval(intervalId);
          setPolling(false);
          await fetchMessages();
          return;
        } else if (run.status === 'failed') {
          clearInterval(intervalId);
          setPolling(false);
          toast.error('Run failed');
          return;
        }
      } catch (e) {
        console.error(e);
        setPolling(false);
        clearInterval(intervalId);
        toast.error('Run failed');
      }
    }, POLLING_FREQUENCY_MS);

    return () => clearInterval(intervalId);
  };

  const sendMessage = async () => {
    if (!userThread || sending) return;

    try {
      setSending(true);
      const {
        data: { message: newMessages },
      } = await axios.post<{
        seccess: boolean;
        message?: Message;
        error?: string;
      }>('/api/message/create', {
        message,
        threadId: userThread.thread_id,
        fromUser: 'true',
      });

      if (!newMessages) {
        toast.error('Failed to send message');
        return;
      }
      setMessages([...messages, newMessages]);
      setMessage('');
      toast.success('Message sent');

      if (!assistant?.assistant_id) return;
      const runId = await startRun(userThread.thread_id, assistant?.assistant_id);
      console.log(runId, 'RUN ID');
      pollRunStatus(userThread.thread_id, runId);
    } catch (e) {
      console.error('Failed to send a message');
    } finally {
      setSending(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!userThread) {
      return;
    }

    setFetching(true);

    try {
      const response = await axios.post<{
        success: boolean;
        error?: string;
        messages: Message[];
      }>('/api/message/list', { threadId: userThread.thread_id });

      if (!response.data.success || !response.data.messages) {
        console.error(response.data.error ?? 'unknown error');
        setFetching(false);
        return;
      }
      let newMessages = response.data?.messages;
      newMessages = newMessages
        .sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        })
        .filter(
          (message) =>
            message.content[0].type === 'text' && message.content[0].text.value.trim() !== ''
        );
      setMessages(newMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  }, [userThread]);

  useEffect(() => {
    const intervalId = setInterval(fetchMessages, POLLING_FREQUENCY_MS);
    return () => clearInterval(intervalId);
  }, [polling, userThread]);

  return (
    <div
      className="w-full flex flex-col text-white pb-20"
      id="chatContainer"
    >
      <div className="flex-grow owerflow-y-scroll p-8 space-y-2">
        {fetching && messages.length === 0 && (
          <div className="text-center font-bold">...Fetching</div>
        )}
        {messages.length === 0 && !fetching && (
          <div className="text-center font-bold text-white">No messages</div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`px-4 py-2 mb-3 rounded-lg w-fit text-lg ${
              ['true', 'True'].includes((message.metadata as { fromUser?: string }).fromUser ?? '')
                ? 'bg-yellow-500 ml-auto'
                : 'bg-gray-700'
            }`}
          >
            {message.content[0].type === 'text'
              ? message.content[0].text.value
                  .split('\n')
                  .map((text, index) => <p key={index}>{text}</p>)
              : null}
          </div>
        ))}
      </div>
      <div className="mt-auto p-4 bg-gray-800 fixed bottom-0 right-0 left-0 w-full">
        <div className="flex items-center bg-white p-2">
          <input
            type="text"
            className="flex-grow bg-transparent text-black focus:outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === 'Enter') {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!userThread?.thread_id || !assistant || sending || !message.trim()}
            className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded-full focus:outline-none disabled:bg-yellow-700"
          >
            {sending ? 'Sending' : polling ? 'Polling Run...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
