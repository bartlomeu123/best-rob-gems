import { useParams, Link, useNavigate } from 'react-router-dom';
import { getScore, getScoreColor, getScoreTextClass, PROS_OPTIONS, CONS_OPTIONS } from '@/lib/types';
import { ThumbsUp, ThumbsDown, ExternalLink, Heart, Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import GameCard from '@/components/GameCard';
import { gameImages } from '@/lib/gameImages';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGameBySlug, fetchApprovedGames, fetchComments, addComment, castVote, getUserVote, toggleFavorite, isFavorited } from '@/lib/supabaseData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const GamePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'likes' | 'newest' | 'oldest'>('newest');
  const [commentText, setCommentText] = useState('');
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [selectedCons, setSelectedCons] = useState<string[]>([]);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isFav, setIsFav] = useState(false);

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', slug],
    queryFn: () => fetchGameBySlug(slug || ''),
    enabled: !!slug,
  });

  const { data: allGames = [] } = useQuery({ queryKey: ['topGames'], queryFn: fetchApprovedGames });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', game?.id],
    queryFn: () => fetchComments(game!.id),
    enabled: !!game?.id,
  });

  useEffect(() => {
    if (user && game?.id) {
      getUserVote(game.id, user.id).then(setUserVote);
      isFavorited(game.id, user.id).then(setIsFav);
    }
  }, [user, game?.id]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Game Not Found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const score = getScore(game.likes, game.dislikes);
  const scoreText = getScoreTextClass(score);
  const imgSrc = gameImages[game.slug] || '/placeholder.svg';

  const similar = allGames
    .filter(g => g.id !== game.id)
    .map(g => ({
      game: g,
      score: g.tags.filter(t => game.tags.includes(t)).length * 2 + (g.category === game.category ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(g => g.game);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    await castVote(game.id, user.id, type);
    const newVote = await getUserVote(game.id, user.id);
    setUserVote(newVote);
    queryClient.invalidateQueries({ queryKey: ['game', slug] });
    queryClient.invalidateQueries({ queryKey: ['topGames'] });
  };

  const handleFavorite = async () => {
    if (!user) { toast.error('Sign in to favorite'); return; }
    await toggleFavorite(game.id, user.id);
    setIsFav(!isFav);
  };

  const handleComment = async () => {
    if (!user) { toast.error('Sign in to comment'); return; }
    if (!commentText.trim()) { toast.error('Write a comment first'); return; }
    const { error } = await addComment({
      game_id: game.id,
      user_id: user.id,
      text: commentText.trim(),
      pros: selectedPros,
      cons: selectedCons,
    });
    if (error) { toast.error('Failed to post comment'); return; }
    toast.success('Comment posted!');
    setCommentText('');
    setSelectedPros([]);
    setSelectedCons([]);
    queryClient.invalidateQueries({ queryKey: ['comments', game.id] });
  };

  const togglePro = (pro: string) => setSelectedPros(prev => prev.includes(pro) ? prev.filter(p => p !== pro) : [...prev, pro]);
  const toggleCon = (con: string) => setSelectedCons(prev => prev.includes(con) ? prev.filter(c => c !== con) : [...prev, con]);

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
              <Button variant={userVote === 'like' ? 'default' : 'secondary'} className="gap-2" onClick={() => handleVote('like')}>
                <ThumbsUp className="h-4 w-4" /> Like ({game.likes.toLocaleString()})
              </Button>
              <Button variant={userVote === 'dislike' ? 'destructive' : 'secondary'} className="gap-2" onClick={() => handleVote('dislike')}>
                <ThumbsDown className="h-4 w-4" /> Dislike ({game.dislikes.toLocaleString()})
              </Button>
              <Button variant={isFav ? 'default' : 'secondary'} className="gap-2" onClick={handleFavorite}>
                <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} /> Favorite
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
                {(['newest', 'oldest'] as const).map(s => (
                  <Button key={s} variant={sortBy === s ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy(s)} className="text-xs capitalize">
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comment form */}
            <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-4 space-y-4">
              <Textarea
                placeholder={user ? "Write your review..." : "Sign in to write a review"}
                className="bg-card resize-none"
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!user}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-400 uppercase mb-2">Select Pros</p>
                  <div className="space-y-1.5">
                    {PROS_OPTIONS.slice(0, 5).map(pro => (
                      <label key={pro} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={selectedPros.includes(pro)} onCheckedChange={() => togglePro(pro)} /> {pro}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase mb-2">Select Cons</p>
                  <div className="space-y-1.5">
                    {CONS_OPTIONS.slice(0, 5).map(con => (
                      <label key={con} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={selectedCons.includes(con)} onCheckedChange={() => toggleCon(con)} /> {con}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="default" size="sm" onClick={handleComment} disabled={!user}>Submit Review</Button>
            </div>

            {/* Comment list */}
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {(comment.profiles?.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{comment.profiles?.username || 'Anonymous'}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{comment.text}</p>
                  {(comment.pros?.length > 0 || comment.cons?.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {comment.pros?.map((p: string) => (
                        <Badge key={p} variant="secondary" className="text-xs text-green-400">✓ {p}</Badge>
                      ))}
                      {comment.cons?.map((c: string) => (
                        <Badge key={c} variant="secondary" className="text-xs text-red-400">✗ {c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
          </section>

          <section>
            <h3 className="font-display text-lg font-bold mb-3">Similar Games</h3>
            <div className="space-y-3">
              {similar.map(g => (
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
