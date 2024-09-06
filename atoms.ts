import { atom } from "jotai";
import { Assistant } from "openai/resources/beta/assistants.mjs";
import { Message } from "openai/src/resources/beta/threads/messages.js";

export interface AssistantDto  {
    assistant_id: string | null
    created_at: string | null
    id: string
}

export const userThreadAtom = atom<Message | null>(null);
export const assistantAtom = atom<AssistantDto | null>(null)