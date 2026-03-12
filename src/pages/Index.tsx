import HeroCarousel from '@/components/home/HeroCarousel';
import CategorySection from '@/components/home/CategorySection';
import GameSection from '@/components/home/GameSection';
import { getTopGames, getTrendingGames, getRisingGames, getNewGames, getRandomGame } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const topGames = getTopGames();
  const trending = getTrendingGames();
  const rising = getRisingGames();
  const newGames = getNewGames();

  return (
    <div className="container mx-auto space-y-10 px-4 py-6">
      <HeroCarousel games={topGames} />
      <CategorySection />
      <GameSection title="🏆 Top Roblox Games" games={topGames} linkTo="/top-games" showRank />
      <GameSection title="🔥 Trending Games" games={trending} linkTo="/trending" />
      <GameSection title="📈 Rising in Rankings" games={rising} showRankChange />
      <GameSection title="🆕 New Roblox Games" games={newGames} linkTo="/new-games" />

      {/* Recommended placeholder */}
      <section className="rounded-xl border border-border bg-card/50 p-8 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">🎯 Recommended for You</h2>
        <p className="text-muted-foreground text-sm mb-4">Sign in to get personalized game recommendations based on your favorites and likes.</p>
        <Button variant="default" onClick={() => navigate('/login')}>Sign In for Recommendations</Button>
      </section>

      {/* Random Game */}
      <section className="flex justify-center">
        <Button
          variant="secondary"
          size="lg"
          className="gap-2 font-display text-lg"
          onClick={() => {
            const rg = getRandomGame();
            navigate(`/game/${rg.slug}`);
          }}
        >
          <Shuffle className="h-5 w-5" /> Random Roblox Game
        </Button>
      </section>
    </div>
  );
};

export default Index;
