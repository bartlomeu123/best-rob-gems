import { Link } from 'react-router-dom';
import { Game, getScore, getScoreColor } from '@/lib/types';
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gameImages } from '@/lib/gameImages';

interface GameCardProps {
  game: Game;
  rank?: number;
  showRankChange?: boolean;
}

const GameCard = ({ game, rank, showRankChange }: GameCardProps) => {
  const score = getScore(game.likes, game.dislikes);
  const scoreClass = getScoreColor(score);
  const imgSrc = gameImages[game.slug] || '/placeholder.svg';

  return (
    <div className="group card-hover rounded-lg border border-border bg-card overflow-hidden">
      <Link to={`/game/${game.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imgSrc}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className={`absolute top-2 right-2 rounded-md px-2 py-1 text-sm font-bold text-foreground ${scoreClass}`}>
            {score}%
          </div>
          {rank && (
            <div className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-md bg-card/90 font-display text-sm font-bold">
              #{rank}
            </div>
          )}
          {showRankChange && game.rankChange > 0 && (
            <div className="absolute bottom-2 left-2 rounded-md bg-success/90 px-2 py-0.5 text-xs font-semibold text-foreground">
              ↑ {game.rankChange}
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/game/${game.slug}`}>
          <h3 className="font-display text-base font-semibold truncate hover:text-primary transition-colors">{game.title}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {game.likes.toLocaleString()}</span>
          <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> {game.dislikes.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <Link to={`/game/${game.slug}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full text-xs">View</Button>
          </Link>
          {game.robloxLink && (
            <a href={game.robloxLink} target="_blank" rel="noopener noreferrer">
              <Button variant="default" size="sm" className="text-xs">
                <ExternalLink className="mr-1 h-3 w-3" /> Play
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
