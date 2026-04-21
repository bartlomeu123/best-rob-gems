import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCategoryCounts } from '@/lib/supabaseData';
import { ALL_CATEGORIES } from '@/lib/categories';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const CategorySection = () => {
  const { data: counts = {} } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: fetchCategoryCounts,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const categoriesWithGames = ALL_CATEGORIES
    .map((cat) => ({ ...cat, count: counts[cat.slug] || 0 }))
    .filter((cat) => cat.count > 0);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, categoriesWithGames.length]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 240);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (categoriesWithGames.length === 0) return null;

  return (
    <section aria-label="Browse by category">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">Explore by Category</h2>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollBy('left')}
            disabled={!canScrollLeft}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition-all',
              'hover:bg-card hover:border-primary/40',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollBy('right')}
            disabled={!canScrollRight}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur transition-all',
              'hover:bg-card hover:border-primary/40',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Mobile arrows */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollBy('left')}
            className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur transition-all hover:bg-card sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollBy('right')}
            className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur transition-all hover:bg-card sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <TooltipProvider delayDuration={200}>
          <div
            ref={scrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {categoriesWithGames.map((cat) => (
              <Tooltip key={cat.slug}>
                <TooltipTrigger asChild>
                  <Link
                    to={`/category/${cat.slug}`}
                    className={cn(
                      'group relative shrink-0 snap-start cursor-pointer',
                      // ~4-6 visible: card width + gap
                      'w-[150px] sm:w-[170px] md:w-[180px]',
                      'rounded-xl border border-border/70',
                      'bg-gradient-to-br from-card via-card to-secondary/40',
                      'p-4 transition-transform duration-200 ease-out',
                      'hover:scale-[1.03] hover:border-primary/40',
                    )}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-3xl leading-none" aria-hidden>
                        {cat.icon}
                      </span>
                      <span className="font-display text-sm font-semibold">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat.count} {cat.count === 1 ? 'game' : 'games'}
                      </span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  Explore {cat.name} games
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
};

export default CategorySection;
