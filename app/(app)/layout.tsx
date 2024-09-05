'use client';
import { userThreadAtom } from "@/atoms";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useAtom } from "jotai";
import { Thread } from "openai/resources/beta/index.mjs";
import { useEffect } from "react";

export default function AppLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [, setUserThread] = useAtom<Thread | null>(userThreadAtom);
    const getUserThread = async () => {
        try {
            const response = await axios.get<{
                success: boolean;
                message?: string;
                userThread: Thread;
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

    return (
      <div className="flex flex-col w-full h-full">
        <Navbar/>
        {children}
      </div>
    );
  }
  