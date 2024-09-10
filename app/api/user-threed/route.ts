import { supabase } from '@/lib/supabasedb';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  const user = await currentUser();

  console.log('userid', user?.id);

  if (!user) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }

  const userThread = await supabase.from('user_thread').select().eq('user_id', user.id);

  console.log('us thr', userThread);
  if (userThread.data?.[0]) {
    return NextResponse.json({ userThread: userThread.data?.[0], success: true }, { status: 200 });
  }

  try {
    const openai = new OpenAI();
    const thread = await openai.beta.threads.create();

    console.log('thread', thread);

    const newUserThread = await supabase.from('user_thread').insert({
      thread_id: thread.id,
      user_id: user.id,
    });
    console.log('newUserThread', newUserThread);
    return NextResponse.json({ userThread: newUserThread, success: true }, { status: 200 });
  } catch (e) {
    console.error('ERROR', e);
    return NextResponse.json({ error: e, success: false }, { status: 500 });
  }
}
