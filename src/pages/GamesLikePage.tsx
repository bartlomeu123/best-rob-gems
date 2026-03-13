import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGameBySlug, fetchApprovedGames } from '@/lib/supabaseData';
import GameCard from '@/components/GameCard';

const GamesLikePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: game } = useQuery({
    queryKey: ['game', slug],
    queryFn: () => fetchGameBySlug(slug || ''),
    enabled: !!slug,
  });
  const { data: allGames = [] } = useQuery({ queryKey: ['topGames'], queryFn: fetchApprovedGames });

  if (!game) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;

  const similar = allGames
    .filter(g => g.id !== game.id)
    .map(g => ({
      game: g,
      score: g.tags.filter(t => game.tags.includes(t)).length * 2 + (g.category === game.category ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(g => g.game);

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
