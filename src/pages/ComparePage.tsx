import { useParams } from 'react-router-dom';
import { getGameBySlug } from '@/lib/mockData';
import { getScore, getScoreColor, getScoreTextClass } from '@/lib/types';
import { gameImages } from '@/lib/gameImages';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ComparePage = () => {
  const { slugs } = useParams<{ slugs: string }>();
  const parts = (slugs || '').split('-vs-');
  const game1 = getGameBySlug(parts[0] || '');
  const game2 = getGameBySlug(parts[1] || '');

  if (!game1 || !game2) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">One or both games not found.</div>;
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
      <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="font-display text-lg font-bold mb-4">Which game do you prefer?</h3>
        <div className="flex justify-center gap-4">
          <Button variant="default">{game1.title}</Button>
          <Button variant="secondary">{game2.title}</Button>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
