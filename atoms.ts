import { atom } from 'jotai';
import { Message } from 'openai/resources/beta/threads/index.mjs';

export interface AssistantDto {
  assistant_id: string | null;
  created_at: string | null;
  id: string;
}

export const userThreadAtom = atom<Message | null>(null);
export const assistantAtom = atom<AssistantDto | null>(null);
