import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { fetchFavoritedGames, fetchGamesBySubmitter } from '@/lib/supabaseData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile } = useAuth();

  const isOwnShortcut = username === 'me';

  const { data: viewedProfile } = useQuery({
    queryKey: ['profile', username, user?.id],
    queryFn: async () => {
      if (!username) return null;
      if (isOwnShortcut) {
        if (!user?.id) return null;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        return data;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      return data;
    },
    enabled: !!username && (!isOwnShortcut || !!user?.id),
  });

  const effectiveProfile = viewedProfile ?? (isOwnShortcut ? profile : null);

  const targetUserId = isOwnShortcut ? user?.id : effectiveProfile?.user_id;
  const isOwnProfile = !!user?.id && user.id === targetUserId;

  const { data: submittedGames = [] } = useQuery({
    queryKey: ['submittedGames', targetUserId],
    queryFn: () => fetchGamesBySubmitter(targetUserId!),
    enabled: !!targetUserId,
  });

  const { data: favoriteGames = [] } = useQuery({
    queryKey: ['favoritedGames', targetUserId],
    queryFn: () => fetchFavoritedGames(targetUserId!),
    enabled: !!targetUserId && isOwnProfile,
  });

  const displayName =
    effectiveProfile?.username ||
    (isOwnShortcut ? user?.email?.split('@')[0] : username) ||
    'User';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 font-display text-2xl font-bold text-primary">
            {effectiveProfile?.avatar_url ? (
              <img src={effectiveProfile.avatar_url} alt={displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              (displayName || 'U')[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              Member since {effectiveProfile ? new Date(effectiveProfile.created_at).toLocaleDateString() : '...'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="submitted" className="mt-8 space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="submitted">Games Submitted</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="favorites">Favorited Games</TabsTrigger>}
        </TabsList>

        <TabsContent value="submitted" className="space-y-3">
          {submittedGames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No games submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {submittedGames.map((game) => (
                <Link key={game.id} to={`/game/${game.slug}`} className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{game.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">{game.category}</p>
                    </div>
                    <Badge
                      variant={game.status === 'approved' ? 'default' : game.status === 'pending' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {game.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="favorites" className="space-y-3">
            {favoriteGames.length === 0 ? (
              <p className="text-sm text-muted-foreground">No favorites yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {favoriteGames.map((game) => (
                  <Link key={game.id} to={`/game/${game.slug}`} className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-secondary/40">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/40">
                      <img src={game.image || '/placeholder.svg'} alt={game.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-1 text-sm font-medium">{game.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
