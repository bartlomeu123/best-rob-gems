import { useParams } from 'react-router-dom';
import { categories } from '@/lib/mockData';
import { useQuery } from '@tanstack/react-query';
import { fetchGamesByCategory } from '@/lib/supabaseData';
import GameCard from '@/components/GameCard';

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const cat = categories.find(c => c.slug === name);
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['category', name],
    queryFn: () => fetchGamesByCategory(name || ''),
    enabled: !!name,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">
        {cat?.icon} {cat?.name || name} Games
      </h1>
      <p className="text-muted-foreground text-sm mb-6">{games.length} games in this category</p>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((g, i) => <GameCard key={g.id} game={g} rank={i + 1} />)}
        </div>
      )}
      {!isLoading && games.length === 0 && <p className="text-center text-muted-foreground py-12">No games found in this category.</p>}
    </div>
  );
};

export default CategoryPage;
