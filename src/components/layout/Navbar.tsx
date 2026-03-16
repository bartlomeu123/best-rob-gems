import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Gamepad2, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryCounts } from '@/lib/supabaseData';
import { ALL_CATEGORIES } from '@/lib/categories';
import SearchAutocomplete from '@/components/SearchAutocomplete';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const { data: counts = {} } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: fetchCategoryCounts,
  });

  const categoriesWithGames = ALL_CATEGORIES
    .map(cat => ({ ...cat, count: counts[cat.slug] || 0 }))
    .filter(cat => cat.count > 0);

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
          
          {/* Categories dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
              <div className="w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-xl p-3 grid grid-cols-2 gap-1">
                {(categoriesWithGames.length > 0 ? categoriesWithGames : ALL_CATEGORIES).map(cat => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    {'count' in cat && (cat as any).count > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground/60">{(cat as any).count}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

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
          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Link to={`/user/${profile?.username || 'me'}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.username || 'Profile'}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          )}
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
            <p className="text-xs font-semibold uppercase text-muted-foreground/60 mt-2">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {(categoriesWithGames.length > 0 ? categoriesWithGames : ALL_CATEGORIES.slice(0, 12)).map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link to={`/user/${profile?.username || 'me'}`} className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="default" size="sm" className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
