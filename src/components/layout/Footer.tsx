import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-card/50 py-8 mt-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Topblox
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground/70">Best Roblox Games</p>
          <p className="mt-2 text-sm text-muted-foreground">Community-driven rankings for the best Roblox games.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Explore</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/top-games" className="text-sm text-muted-foreground hover:text-foreground">Top Games</Link>
            <Link to="/trending" className="text-sm text-muted-foreground hover:text-foreground">Trending</Link>
            <Link to="/new-games" className="text-sm text-muted-foreground hover:text-foreground">New Games</Link>
            <Link to="/random" className="text-sm text-muted-foreground hover:text-foreground">Random Game</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Anime', 'Horror', 'Simulator', 'Tycoon', 'Adventure', 'PvP'].map(cat => (
              <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Best Roblox Games. Not affiliated with Roblox Corporation.
      </div>
    </div>
  </footer>
);

export default Footer;
