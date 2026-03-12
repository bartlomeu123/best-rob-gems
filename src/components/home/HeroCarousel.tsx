import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Game, getScore, getScoreColor } from '@/lib/types';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gameImages } from '@/lib/gameImages';

interface HeroCarouselProps {
  games: Game[];
}

const HeroCarousel = ({ games }: HeroCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const featured = games.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const game = featured[current];
  const score = getScore(game.likes, game.dislikes);
  const scoreClass = getScoreColor(score);
  const imgSrc = gameImages[game.slug] || '/placeholder.svg';

  return (
    <section className="relative overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-[21/9] md:aspect-[3/1]">
        <img
          src={imgSrc}
          alt={game.title}
          className="h-full w-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12">
          <div className={`mb-2 w-fit rounded-md px-3 py-1 text-sm font-bold ${scoreClass}`}>
            {score}% Rating
          </div>
          <h1 className="font-display text-3xl font-bold md:text-5xl text-glow">{game.title}</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground line-clamp-2">{game.description}</p>
          <div className="mt-4 flex gap-3">
            <Link to={`/game/${game.slug}`}>
              <Button variant="default" size="lg">View Game</Button>
            </Link>
            {game.robloxLink && (
              <a href={game.robloxLink} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" /> Play on Roblox
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/50 hover:bg-card/80"
          onClick={() => setCurrent(prev => (prev - 1 + featured.length) % featured.length)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/50 hover:bg-card/80"
          onClick={() => setCurrent(prev => (prev + 1) % featured.length)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/50'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
