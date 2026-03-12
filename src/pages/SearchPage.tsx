import { useSearchParams } from 'react-router-dom';
import { searchGames } from '@/lib/mockData';
import GameCard from '@/components/GameCard';

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const results = searchGames(q);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {results.length} results for "{q}"
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map(g => <GameCard key={g.id} game={g} />)}
      </div>
      {results.length === 0 && <p className="text-center text-muted-foreground py-12">No games found matching your search.</p>}
    </div>
  );
};

export default SearchPage;
