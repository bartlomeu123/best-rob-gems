import HeroCarousel from '@/components/home/HeroCarousel';
import CategorySection from '@/components/home/CategorySection';
import GameSection from '@/components/home/GameSection';
import { Button } from '@/components/ui/button';
import { Shuffle, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchApprovedGames, fetchTrendingGames, fetchRisingGames, fetchNewGames } from '@/lib/supabaseData';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data: topGames = [] } = useQuery({ queryKey: ['topGames'], queryFn: fetchApprovedGames });
  const { data: trending = [] } = useQuery({ queryKey: ['trendingGames'], queryFn: fetchTrendingGames });
  const { data: rising = [] } = useQuery({ queryKey: ['risingGames'], queryFn: fetchRisingGames });
  const { data: newGames = [] } = useQuery({ queryKey: ['newGames'], queryFn: fetchNewGames });

  return (
    <div className="container mx-auto space-y-10 px-4 py-6">
      {isAdmin && (
        <Link to="/admin">
          <Button variant="default" className="gap-2">
            <Shield className="h-4 w-4" /> Admin Panel
          </Button>
        </Link>
      )}
      {topGames.length > 0 && <HeroCarousel games={topGames} />}
      <CategorySection />
      {topGames.length > 0 && <GameSection title="🏆 Top Roblox Games" games={topGames} linkTo="/top-games" showRank />}
      {trending.length > 0 && <GameSection title="🔥 Trending Games" games={trending} linkTo="/trending" />}
      {rising.length > 0 && <GameSection title="📈 Rising in Rankings" games={rising} showRankChange />}
      {newGames.length > 0 && <GameSection title="🆕 New Roblox Games" games={newGames} linkTo="/new-games" />}

      {!user && (
        <section className="rounded-xl border border-border bg-card/50 p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-2">🎯 Recommended for You</h2>
          <p className="text-muted-foreground text-sm mb-4">Sign in to get personalized game recommendations based on your favorites and likes.</p>
          <Button variant="default" onClick={() => navigate('/login')}>Sign In for Recommendations</Button>
        </section>
      )}

      <section className="flex justify-center">
        <Button
          variant="secondary"
          size="lg"
          className="gap-2 font-display text-lg"
          onClick={() => {
            if (topGames.length > 0) {
              const rg = topGames[Math.floor(Math.random() * topGames.length)];
              navigate(`/game/${rg.slug}`);
            }
          }}
        >
          <Shuffle className="h-5 w-5" /> Random Roblox Game
        </Button>
      </section>
    </div>
  );
};

export default Index;
