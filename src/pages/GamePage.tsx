import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGameBySlug, getSimilarGames, mockComments } from '@/lib/mockData';
import { getScore, getScoreColor, getScoreTextClass, PROS_OPTIONS, CONS_OPTIONS } from '@/lib/types';
import { ThumbsUp, ThumbsDown, ExternalLink, Heart, Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import GameCard from '@/components/GameCard';
import { gameImages } from '@/lib/gameImages';
import { useState } from 'react';

const GamePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const game = getGameBySlug(slug || '');
  const [sortBy, setSortBy] = useState<'likes' | 'newest' | 'oldest'>('likes');

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Game Not Found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const score = getScore(game.likes, game.dislikes);
  const scoreClass = getScoreColor(score);
  const scoreText = getScoreTextClass(score);
  const similar = getSimilarGames(game);
  const comments = mockComments.filter(c => c.gameId === game.id);
  const imgSrc = gameImages[game.slug] || '/placeholder.svg';

  // Aggregate pros/cons from comments
  const prosCount: Record<string, number> = {};
  const consCount: Record<string, number> = {};
  comments.forEach(c => {
    c.pros.forEach(p => { prosCount[p] = (prosCount[p] || 0) + 1; });
    c.cons.forEach(cn => { consCount[cn] = (consCount[cn] || 0) + 1; });
  });
  const topPros = Object.entries(prosCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topCons = Object.entries(consCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border">
        <div className="aspect-video md:aspect-[3/1]">
          <img src={imgSrc} alt={game.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-glow">{game.title}</h1>
              <div className="mt-2 flex items-center gap-4">
                <span className={`font-display text-3xl font-bold ${scoreText}`}>{score}%</span>
                <span className="text-sm text-muted-foreground">
                  {(game.likes + game.dislikes).toLocaleString()} votes
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" className="gap-2">
                <ThumbsUp className="h-4 w-4" /> Like ({game.likes.toLocaleString()})
              </Button>
              <Button variant="secondary" className="gap-2">
                <ThumbsDown className="h-4 w-4" /> Dislike ({game.dislikes.toLocaleString()})
              </Button>
              <Button variant="secondary" className="gap-2">
                <Heart className="h-4 w-4" /> Favorite
              </Button>
              {game.robloxLink && (
                <a href={game.robloxLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="gap-2 accent-gradient border-0">
                    <ExternalLink className="h-4 w-4" /> Play on Roblox
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Community Evaluation */}
          {(topPros.length > 0 || topCons.length > 0) && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Community Evaluation</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">Pros</h3>
                  <div className="space-y-2">
                    {topPros.map(([pro]) => (
                      <div key={pro} className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-sm">
                        <span className="text-green-400">✓</span> {pro}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Cons</h3>
                  <div className="space-y-2">
                    {topCons.map(([con]) => (
                      <div key={con} className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm">
                        <span className="text-red-400">✗</span> {con}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Description */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold mb-3">About This Game</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
          </section>

          {/* Comments */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Comments ({comments.length})</h2>
              <div className="flex gap-1">
                {(['likes', 'newest', 'oldest'] as const).map(s => (
                  <Button key={s} variant={sortBy === s ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy(s)} className="text-xs capitalize">
                    {s === 'likes' ? 'Most Liked' : s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comment form */}
            <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-4 space-y-4">
              <Textarea placeholder="Write your review..." className="bg-card resize-none" rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-400 uppercase mb-2">Select Pros</p>
                  <div className="space-y-1.5">
                    {PROS_OPTIONS.slice(0, 5).map(pro => (
                      <label key={pro} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox /> {pro}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase mb-2">Select Cons</p>
                  <div className="space-y-1.5">
                    {CONS_OPTIONS.slice(0, 5).map(con => (
                      <label key={con} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox /> {con}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="default" size="sm">Submit Review</Button>
            </div>

            {/* Comment list */}
            <div className="space-y-4">
              {sortedComments.map(comment => (
                <div key={comment.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {comment.username[0]}
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{comment.username}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{comment.createdAt}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <Flag className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{comment.text}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" /> {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                      Reply
                    </Button>
                  </div>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="ml-8 mt-3 rounded-lg border border-border bg-card/50 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {reply.username[0]}
                        </div>
                        <span className="text-sm font-semibold">{reply.username}</span>
                        <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{reply.text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.map(tag => (
                <Link key={tag} to={`/tag/${tag.toLowerCase()}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Link to={`/games-like/${game.slug}`}>
              <Button variant="secondary" size="sm" className="w-full justify-start text-xs">
                Games like {game.title}
              </Button>
            </Link>
            <Link to={`/category/${game.category}`}>
              <Button variant="secondary" size="sm" className="w-full justify-start text-xs capitalize">
                More {game.category} games
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-1 text-muted-foreground">
              <Flag className="h-3 w-3" /> Report Game
            </Button>
          </section>

          {/* Similar Games */}
          <section>
            <h3 className="font-display text-lg font-bold mb-3">Similar Games</h3>
            <div className="space-y-3">
              {similar.slice(0, 4).map(g => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
