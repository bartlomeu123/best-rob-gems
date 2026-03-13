import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { dbGameToGame, DbGame } from '@/lib/supabaseData';
import GameCard from '@/components/GameCard';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile } = useAuth();

  // Fetch profile by username
  const { data: viewedProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      return data;
    },
    enabled: !!username,
  });

  const targetUserId = viewedProfile?.user_id;

  // Fetch games submitted by this user
  const { data: submittedGames = [] } = useQuery({
    queryKey: ['userGames', targetUserId],
    queryFn: async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('submitted_by', targetUserId!)
        .eq('status', 'approved');
      if (!data) return [];
      return (data as unknown as DbGame[]).map(dbGameToGame);
    },
    enabled: !!targetUserId,
  });

  const displayName = viewedProfile?.username || username;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center font-display text-2xl font-bold text-primary">
            {viewedProfile?.avatar_url ? (
              <img src={viewedProfile.avatar_url} alt={displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              (displayName || 'U')[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              Member since {viewedProfile ? new Date(viewedProfile.created_at).toLocaleDateString() : '...'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold mb-3">Games Submitted</h2>
        {submittedGames.length === 0 ? (
          <p className="text-muted-foreground text-sm">No games submitted yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {submittedGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
