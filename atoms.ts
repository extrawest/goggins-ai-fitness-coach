import { atom } from "jotai";
import { Message } from "openai/src/resources/beta/threads/messages.js";

export const userThreadAtom = atom<Message | null>(null);