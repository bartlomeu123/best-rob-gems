import { useParams, Link } from 'react-router-dom';
import { getScore, getScoreTextClass } from '@/lib/types';
import { gameImages } from '@/lib/gameImages';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchGameBySlug } from '@/lib/supabaseData';

const ComparePage = () => {
  const { slugs } = useParams<{ slugs: string }>();
  const parts = (slugs || '').split('-vs-');

  const { data: game1 } = useQuery({ queryKey: ['game', parts[0]], queryFn: () => fetchGameBySlug(parts[0] || '') });
  const { data: game2 } = useQuery({ queryKey: ['game', parts[1]], queryFn: () => fetchGameBySlug(parts[1] || '') });

  if (!game1 || !game2) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading or games not found...</div>;
  }

  const score1 = getScore(game1.likes, game1.dislikes);
  const score2 = getScore(game2.likes, game2.dislikes);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-8 text-center">{game1.title} vs {game2.title}</h1>
      <div className="grid grid-cols-2 gap-6">
        {[{ game: game1, score: score1 }, { game: game2, score: score2 }].map(({ game, score }) => (
          <div key={game.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <img src={gameImages[game.slug] || '/placeholder.svg'} alt={game.title} className="aspect-video w-full object-cover" />
            <div className="p-4 text-center">
              <h2 className="font-display text-xl font-bold">{game.title}</h2>
              <p className={`font-display text-3xl font-bold mt-2 ${getScoreTextClass(score)}`}>{score}%</p>
              <p className="text-sm text-muted-foreground">{(game.likes + game.dislikes).toLocaleString()} votes</p>
              <Link to={`/game/${game.slug}`}>
                <Button variant="secondary" size="sm" className="mt-3">View Game</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparePage;
