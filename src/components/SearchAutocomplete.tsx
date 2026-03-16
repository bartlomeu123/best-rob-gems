import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getScore, getScoreColor } from '@/lib/types';
import { gameImages } from '@/lib/gameImages';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  likes: number;
  dislikes: number;
  category: string;
}

const SearchAutocomplete = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();
      const { data } = await supabase
        .from('games')
        .select('id, slug, title, image, likes, dislikes, category, tags')
        .eq('status', 'approved')
        .or(`title.ilike.%${q}%,category.ilike.%${q}%,tags.cs.{${q}}`)
        .limit(8);
      setResults((data as SearchResult[]) || []);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery('');
    onClose();
    navigate(`/game/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-fade-in">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search games..."
            className="h-9 w-56 bg-secondary pl-8"
            autoFocus
          />
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </form>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-80 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
          {loading && <p className="p-3 text-sm text-muted-foreground">Searching...</p>}
          {!loading && results.length === 0 && query.trim() && (
            <p className="p-4 text-sm text-muted-foreground text-center">No games found.</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-96 overflow-y-auto">
              {results.map(game => {
                const score = getScore(game.likes, game.dislikes);
                const scoreClass = getScoreColor(score);
                const imgSrc = game.image || gameImages[game.slug] || '/placeholder.svg';
                return (
                  <li key={game.id}>
                    <button
                      className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
                      onClick={() => handleSelect(game.slug)}
                    >
                      <img
                        src={imgSrc}
                        alt={game.title}
                        className="h-10 w-14 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{game.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{game.category}</p>
                      </div>
                      <span className={`text-sm font-bold ${scoreClass}`}>{score}%</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
