'use client';
import { userThreadAtom } from "@/atoms";
import axios from "axios";
import { useAtom } from "jotai";
import { Message } from "openai/resources/beta/threads/index";
import { useCallback, useEffect, useState } from "react";

const POLLING_FREQUENCY_MS = 1000;

function ChatPage() {
    const [userThread] = useAtom(userThreadAtom);

    const [fetching, setFetching] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    console.log(messages, 'MESSAGES')

    const fetchMessages = useCallback(async () => {
        if (!userThread) {
            return;
        }
        setFetching(true);

        try {
            const response = await axios.post<{
                success: boolean,
                error?: string,
                messages: Message[]
            }>('/api/messages/list', {threadId: userThread.thread_id});

            if (!response.data.success || !response.data.messages) {
                console.error(response.data.error ?? 'unknown error')
                setFetching(false);
                return;
            }
          let newMessages = response.data?.messages;
          newMessages = newMessages
            .sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
            .filter(message => message.content[0].type === 'text' &&
                message.content[0].text.value.trim() !== ''
            )
            
            console.log(newMessages);

            setMessages(newMessages);
            setFetching(false);        
        } catch(e) {
            console.error(e)
        }
    }, [userThread]) 

    useEffect(() => {
        const intervalId = setInterval(fetchMessages, POLLING_FREQUENCY_MS);
        return () => clearInterval(intervalId);
    }, [fetchMessages])

    return (
        <div className="w-full h-screen flex flex-col bg-black text-white">
            sdsd
            <div className="owerflow-y-hidden p-8 space-y-2">sd
              {fetching && (<div className="text-center font-bold">...Fetching</div>)}
            </div>sddsd
            {messages.length === 0 && !fetching && 
              <div className="text-center font-bold text-white">
                No messages
              </div>
            }
        </div>
    ) 
}

export default ChatPage;