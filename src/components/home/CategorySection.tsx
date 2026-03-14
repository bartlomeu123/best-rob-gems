import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryCounts } from '@/lib/supabaseData';
import { ALL_CATEGORIES } from '@/lib/categories';

const CategorySection = () => {
  const { data: counts = {} } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: fetchCategoryCounts,
  });

  const categoriesWithGames = ALL_CATEGORIES
    .map(cat => ({ ...cat, count: counts[cat.slug] || 0 }))
    .filter(cat => cat.count > 0);

  if (categoriesWithGames.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold mb-4">Explore by Category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categoriesWithGames.map(cat => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="card-hover group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-all hover:border-primary/50"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-display text-sm font-semibold">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.count} games</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
