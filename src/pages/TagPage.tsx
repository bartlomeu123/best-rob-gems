import { useParams } from 'react-router-dom';
import { getGamesByTag } from '@/lib/mockData';
import GameCard from '@/components/GameCard';

const TagPage = () => {
  const { name } = useParams<{ name: string }>();
  const games = getGamesByTag(name || '');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">🏷️ {name}</h1>
      <p className="text-muted-foreground text-sm mb-6">{games.length} games with this tag</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((g, i) => <GameCard key={g.id} game={g} rank={i + 1} />)}
      </div>
      {games.length === 0 && <p className="text-center text-muted-foreground py-12">No games found with this tag.</p>}
    </div>
  );
};

export default TagPage;
