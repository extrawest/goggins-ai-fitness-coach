import { createClient } from '@supabase/supabase-js';
import { Database } from './generated/db';

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? ''
);

export interface ChallanePreferances {
  challange_id: string | null;
  created_at: string | null;
  id: string;
  send_notification: boolean | null;
  user_id: string | null;
}

export interface UserThread {
  created_at: string | null;
  id: string;
  thread_id: string | null;
  user_id: string | null;
}
