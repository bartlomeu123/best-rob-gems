import { Game } from '@/lib/types';
import GameCard from '@/components/GameCard';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface GameSectionProps {
  title: string;
  games: Game[];
  linkTo?: string;
  showRank?: boolean;
  showRankChange?: boolean;
}

const GameSection = ({ title, games, linkTo, showRank, showRankChange }: GameSectionProps) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-1 text-sm text-primary hover:underline">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {games.slice(0, 6).map((game, i) => (
        <GameCard key={game.id} game={game} rank={showRank ? i + 1 : undefined} showRankChange={showRankChange} />
      ))}
    </div>
  </section>
);

export default GameSection;
