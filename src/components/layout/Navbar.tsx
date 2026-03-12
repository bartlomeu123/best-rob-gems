import { Link } from 'react-router-dom';
import { Search, Menu, X, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span>Best Roblox <span className="text-primary">Games</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/top-games" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Top Games</Link>
          <Link to="/trending" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Trending</Link>
          <Link to="/new-games" className="text-sm text-muted-foreground transition-colors hover:text-foreground">New Games</Link>
          <Link to="/add-game" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Add Game</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search games..."
                className="h-9 w-48 bg-secondary"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Link to="/login">
            <Button variant="default" size="sm">Sign In</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden animate-slide-in">
          <form onSubmit={handleSearch} className="mb-4">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search games..." className="bg-secondary" />
          </form>
          <div className="flex flex-col gap-3">
            <Link to="/top-games" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Top Games</Link>
            <Link to="/trending" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Trending</Link>
            <Link to="/new-games" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>New Games</Link>
            <Link to="/add-game" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Add Game</Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="default" size="sm" className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
