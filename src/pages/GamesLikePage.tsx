import { useParams } from 'react-router-dom';
import { getGameBySlug, getSimilarGames } from '@/lib/mockData';
import GameCard from '@/components/GameCard';

const GamesLikePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const game = getGameBySlug(slug || '');

  if (!game) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Game not found.</div>;

  const similar = getSimilarGames(game);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">Games Like {game.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">Games similar to {game.title} based on tags and category</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {similar.map((g, i) => <GameCard key={g.id} game={g} rank={i + 1} />)}
      </div>
    </div>
  );
};

export default GamesLikePage;
