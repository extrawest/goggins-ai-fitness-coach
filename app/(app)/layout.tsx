'use client';
import { assistantAtom, AssistantDto, userThreadAtom } from "@/atoms";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useAtom } from "jotai";
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function AppLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [, setUserThread] = useAtom(userThreadAtom);
    const [assistant, setAssistant] = useAtom(assistantAtom);

    const getUserThread = async () => {
        try {
            const response = await axios.get<{
                success: boolean;
                message?: string;
                userThread: Message;
            }>("/api/user-threed");
    
            console.log('getUserThread', response);
    
            if (!response.data.success || !response.data.userThread) {
                console.error(response.data?.message ?? 'ERROR');
                return;
            }
            setUserThread(response.data.userThread);
        } catch(e) {
            console.error('ERROR', e);
            setUserThread(null);
        }
    }

    useEffect(() => {
        getUserThread();
    }, [setUserThread]);

    useEffect(() => {
      if (assistant) return;
      async function getAssistant() {
        try {
          const response = await axios.get<{
            success: boolean;
            message?: string;
            assistant: AssistantDto;
          }>('/api/assistant');

          if (!response.data?.success || !response.data?.assistant) {
            console.error(response.data, 'ERROR');
            setAssistant(null);
            toast.error('Failed to fetch assistant');
            return;
          }

          setAssistant(response?.data?.assistant)

        } catch(e) {
          console.error(e, 'ASSISTANT NOT FOUND');
          setAssistant(null);
        }
      }

      getAssistant();
    }, [assistant, setAssistant])

    return (
      <div className="flex flex-col w-full h-full bg-black min-h-screen">
        <Navbar/>
        {children}
      </div>
    );
  }
  