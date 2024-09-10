import { supabase } from '@/lib/supabasedb';
import { NextResponse } from 'next/server';

export async function GET() {
  const assistants = await supabase.from('assistant').select();
  if (assistants.data?.length === 0) {
    return NextResponse.json({ error: 'No assistants found', success: false }, { status: 500 });
  }
  console.log(assistants?.data?.[0]);

  return NextResponse.json({ assistant: assistants?.data?.[0], success: true }, { status: 200 });
}
