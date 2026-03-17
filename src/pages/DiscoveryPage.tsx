import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dbGameToGame, DbGame } from '@/lib/supabaseData';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DISCOVERY_ROUTES, getDiscoveryMeta } from '@/lib/discoveryRoutes';

const PER_PAGE = 20;

async function fetchDiscoveryGames(type: string, key: string) {
  let query = supabase.from('games').select('*').eq('status', 'approved');

  switch (type) {
    case 'feature': {
      // Get game IDs that have this feature
      const { data: featureRow } = await supabase
        .from('features')
        .select('id')
        .ilike('name', key.replace(/-/g, ' '))
        .maybeSingle();
      if (!featureRow) return [];
      const { data: gfRows } = await supabase
        .from('game_features')
        .select('game_id')
        .eq('feature_id', featureRow.id);
      if (!gfRows || gfRows.length === 0) return [];
      const ids = gfRows.map(r => r.game_id);
      const { data } = await supabase.from('games').select('*').eq('status', 'approved').in('id', ids).order('likes', { ascending: false });
      return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
    }
    case 'category': {
      const slug = key.replace(/^best-roblox-/, '').replace(/-games$/, '');
      const { data } = await supabase.from('games').select('*').eq('status', 'approved')
        .or(`category.ilike.${slug},category.ilike.${slug.replace(/-/g, ' ')}`)
        .order('likes', { ascending: false });
      return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
    }
    case 'ranking': {
      if (key === 'most-liked') {
        const { data } = await query.order('likes', { ascending: false });
        return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
      }
      if (key === 'trending') {
        const { data } = await query.order('votes_last_24h', { ascending: false });
        return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
      }
      if (key === 'fastest-growing') {
        const { data } = await query.gt('rank_change', 0).order('rank_change', { ascending: false });
        return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
      }
      if (key === 'new') {
        const { data } = await query.order('created_at', { ascending: false });
        return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
      }
      return [];
    }
    case 'platform': {
      // Platform = feature matching (e.g. "mobile" → "Mobile Support")
      const featureMap: Record<string, string> = {
        mobile: 'Mobile Support',
        console: 'Console Support',
        'cross-platform': 'Cross-platform Play',
      };
      const featureName = featureMap[key];
      if (!featureName) return [];
      const { data: feat } = await supabase.from('features').select('id').ilike('name', featureName).maybeSingle();
      if (!feat) return [];
      const { data: gf } = await supabase.from('game_features').select('game_id').eq('feature_id', feat.id);
      if (!gf || gf.length === 0) return [];
      const { data } = await supabase.from('games').select('*').eq('status', 'approved').in('id', gf.map(r => r.game_id)).order('likes', { ascending: false });
      return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
    }
    case 'tag': {
      const { data } = await supabase.from('games').select('*').eq('status', 'approved');
      if (!data) return [];
      const lowerKey = key.toLowerCase().replace(/-/g, ' ');
      return (data as unknown as DbGame[])
        .filter(g => (g.tags || []).some(t => t.toLowerCase() === lowerKey))
        .map(dbGameToGame);
    }
    default:
      return [];
  }
}

const DiscoveryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const meta = getDiscoveryMeta(slug || '');

  const { data: allGames = [], isLoading } = useQuery({
    queryKey: ['discovery', meta.type, meta.key],
    queryFn: () => fetchDiscoveryGames(meta.type, meta.key),
    enabled: !!slug,
  });

  const totalPages = Math.ceil(allGames.length / PER_PAGE);
  const games = allGames.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToPage = (p: number) => {
    setSearchParams(p > 1 ? { page: String(p) } : {});
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">{meta.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {isLoading ? 'Loading...' : `${allGames.length} games found`}
      </p>

      {!isLoading && games.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((g, i) => (
            <GameCard key={g.id} game={g} rank={(page - 1) * PER_PAGE + i + 1} />
          ))}
        </div>
      )}

      {!isLoading && allGames.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No games found for this category.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline" size="sm" disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
