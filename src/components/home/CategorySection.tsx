import { Link } from 'react-router-dom';
import { categories } from '@/lib/mockData';

const CategorySection = () => (
  <section>
    <h2 className="font-display text-2xl font-bold mb-4">Explore by Category</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map(cat => (
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

export default CategorySection;
