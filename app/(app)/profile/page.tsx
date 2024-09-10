import ProfileContainer from '@/components/ProfileContainer';
import { ChallanePreferances, supabase } from '@/lib/supabasedb';
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  console.log('PROFILE');
  const user = await currentUser();

  console.log('user', user);

  if (!user || !user.id) {
    throw new Error('No user!');
  }

  const challengePreferancesReq = await supabase
    .from('challange_prefereces')
    .select()
    .eq('user_id', user.id);

  console.log('challengePreferancesReq', challengePreferancesReq);

  let challengePreferances: ChallanePreferances | undefined = challengePreferancesReq.data?.[0];

  console.log(challengePreferancesReq);
  if (!challengePreferances) {
    await supabase.from('challange_prefereces').insert({
      challange_id: 'EASY',
      user_id: user.id,
    });

    const challengePreferancesReq = await supabase
      .from('challange_prefereces')
      .select()
      .eq('user_id', user.id);

    challengePreferances = challengePreferancesReq.data?.[0];
  }

  return (
    <div className="msx-w-screen-lg lg:mx-auto bg-white p-10">
      {challengePreferances && <ProfileContainer challengePreferances={challengePreferances} />}
    </div>
  );
}
