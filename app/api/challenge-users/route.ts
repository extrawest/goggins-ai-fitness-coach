import { supabase } from '@/lib/supabasedb';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  const body = await request.json();

  const { challengeId, secret } = body;

  if (!challengeId || !secret) {
    return NextResponse.json(
      { success: false, message: 'Missing required fields' },
      {
        status: 400,
      }
    );
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
        Generate an ultra-intense, hard-hitting motivational message, followed by a concise, bullet-pointed, no-equipment-needed workout plan. The time of day provided should be taken into account. This output should strictly contain two parts: first, a motivational message in the style of David Goggins, as depicted in Jesse Itzler's 'Living with a SEAL', but even more extreme. The message must be direct, confrontational, and incorporate Goggins' known phrases like 'poopy pants', 'stay hard', and 'taking souls'. The second part should be a workout list: intense, high-impact exercises that can be done anywhere, designed to be completed within 10 minutes. The output must only include these two components, nothing else.
        
        Here's an example output that you should follow:
        
        Time to get hard! No more excuses, no more poopy pants attitude. You're stronger than you think. Stay hard, take souls, and crush this morning with everything you've got. You have 10 minutes to obliterate this workout. This is your battlefield, and you're the warrior. Let's make every second count!
        
        - 30 Burpees – explode with every jump
        - 40 Jumping Jacks – faster, push your limits
        - 50 Mountain Climbers – relentless pace
        - 60 High Knees – drive them up with fury
        - 2 Minute Plank – solid and unyielding
        `,
    },
    {
      role: 'user',
      content: `Generate a new David Goggins workout. Remember, only respond in the format specifed earlier. Nothing else`,
    },
  ];

  const challengePreferences = await supabase
    .from('challange_prefereces')
    .select()
    .eq('challange_id', challengeId);

  console.log('challengePreferences', challengePreferences);

  const userIds = challengePreferences.data?.map((cp) => cp.user_id);

  console.log('userIds', userIds);

  const userThreads = await supabase
    .from('user_thread')
    .select()
    .overlaps('user_id', userIds as string[]);

  console.log('userThreads', userThreads);
}
