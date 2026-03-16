import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dbGameToGame, DbGame } from '@/lib/supabaseData';
import GameCard from '@/components/GameCard';

async function searchGamesFromDb(q: string) {
  if (!q.trim()) return [];
  const term = q.trim().toLowerCase();
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .or(`title.ilike.%${term}%,category.ilike.%${term}%,tags.cs.{${term}}`)
    .limit(50);
  return ((data as unknown as DbGame[]) || []).map(dbGameToGame);
}

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchGamesFromDb(q),
    enabled: !!q.trim(),
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {isLoading ? 'Searching...' : `${results.length} results for "${q}"`}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map(g => <GameCard key={g.id} game={g} />)}
      </div>
      {!isLoading && results.length === 0 && <p className="text-center text-muted-foreground py-12">No games found matching your search.</p>}
    </div>
  );
};

export default SearchPage;
