import { supabase } from '@/lib/supabasedb';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userInfo } from 'os';

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await request.json();

  console.log(response);

  const { id, sendNotifications, challengeId } = response;

  if (!id || sendNotifications === undefined || !challengeId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updatedChallengePreferences = await supabase
      .from('challange_prefereces')
      .update({
        challange_id: challengeId,
        send_notification: sendNotifications,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: updatedChallengePreferences,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 });
  }
}
