import { getTopGames } from '@/lib/mockData';
import GameCard from '@/components/GameCard';

const TopGamesPage = () => {
  const games = getTopGames();
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-6">🏆 Top Roblox Games</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((g, i) => <GameCard key={g.id} game={g} rank={i + 1} />)}
      </div>
    </div>
  );
};

export default TopGamesPage;
