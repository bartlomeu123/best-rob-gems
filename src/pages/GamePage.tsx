import { useParams, Link, useNavigate } from 'react-router-dom';
import { getScore, getScoreTextClass, PROS_OPTIONS, CONS_OPTIONS } from '@/lib/types';
import { ThumbsUp, ThumbsDown, ExternalLink, Heart, Flag, ArrowLeft, Edit, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GameCard from '@/components/GameCard';
import CommunityEvaluation from '@/components/CommunityEvaluation';
import { gameImages } from '@/lib/gameImages';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchGameBySlug, fetchApprovedGames, fetchComments, addComment, castVote,
  getUserVote, toggleFavorite, isFavorited, reportComment, updateGame, deleteComment,
  castCommentVote, getUserCommentVotes, fetchGameFeatures, fetchFeatureOptions,
} from '@/lib/supabaseData';
import FeatureChecklist from '@/components/game/FeatureChecklist';
import { ALL_CATEGORIES } from '@/lib/categories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const GamePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [selectedCons, setSelectedCons] = useState<string[]>([]);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down'>>({});

  // Admin edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', image: '', category: '', tags: '', roblox_link: '' });
  const [editFeatureIds, setEditFeatureIds] = useState<string[]>([]);

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

  const { data: gameFeatures = [] } = useQuery({
    queryKey: ['gameFeatures', game?.id],
    queryFn: () => fetchGameFeatures(game!.id),
    enabled: !!game?.id,
  });

  const { data: allFeatureOptions = [] } = useQuery({
    queryKey: ['featureOptions'],
    queryFn: fetchFeatureOptions,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (user && game?.id) {
      getUserVote(game.id, user.id).then(setUserVote);
      isFavorited(game.id, user.id).then(setIsFav);
    }
  }, [user, game?.id]);

  useEffect(() => {
    if (user && comments.length > 0) {
      const ids = comments.map((c: any) => c.id);
      getUserCommentVotes(ids, user.id).then(setCommentVotes);
    }
  }, [user, comments]);

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
  const imgSrc = game.image || gameImages[game.slug] || '/placeholder.svg';

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

  const handleReport = async (commentId: string) => {
    if (!user) { toast.error('Sign in to report'); return; }
    const { error } = await reportComment(commentId, user.id, 'inappropriate');
    if (error) {
      if (error.code === '23505') toast.info('Already reported');
      else toast.error('Failed to report');
      return;
    }
    toast.success('Comment reported');
  };

  const handleCommentVote = async (commentId: string, type: 'up' | 'down') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    await castCommentVote(commentId, user.id, type);
    queryClient.invalidateQueries({ queryKey: ['comments', game.id] });
    const ids = comments.map((c: any) => c.id);
    getUserCommentVotes(ids, user.id).then(setCommentVotes);
  };

  const openEditDialog = () => {
    setEditForm({
      title: game.title,
      description: game.description,
      image: game.image,
      category: game.category,
      tags: game.tags.join(', '),
      roblox_link: game.robloxLink || '',
    });
    setEditFeatureIds(gameFeatures.map(f => f.id));
    setEditOpen(true);
  };

  const handleEditGame = async () => {
    const newSlug = editForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await updateGame(game.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      image: editForm.image.trim() || undefined,
      category: editForm.category,
      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      roblox_link: editForm.roblox_link.trim() || undefined,
      slug: newSlug,
      feature_ids: editFeatureIds,
    });
    if (error) { toast.error('Failed to update'); return; }
    toast.success('Game updated!');
    setEditOpen(false);
    if (newSlug !== slug) {
      navigate(`/game/${newSlug}`);
    } else {
      queryClient.invalidateQueries({ queryKey: ['game', slug] });
    }
    queryClient.invalidateQueries({ queryKey: ['gameFeatures', game.id] });
  };

  const togglePro = (pro: string) => setSelectedPros(prev => prev.includes(pro) ? prev.filter(p => p !== pro) : [...prev, pro]);
  const toggleCon = (con: string) => setSelectedCons(prev => prev.includes(con) ? prev.filter(c => c !== con) : [...prev, con]);

  const sortedComments = [...comments].sort((a: any, b: any) => {
    const scoreDiff = (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {isAdmin && (
          <Button variant="secondary" size="sm" className="gap-1" onClick={openEditDialog}>
            <Edit className="h-4 w-4" /> Edit Game
          </Button>
        )}
      </div>

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

          {/* Community Evaluation */}
          <CommunityEvaluation comments={comments} />

          {/* Comments */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Comments ({comments.length})</h2>
              <span className="text-xs text-muted-foreground">Sorted by top votes</span>
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
                    {PROS_OPTIONS.map(pro => (
                      <label key={pro} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={selectedPros.includes(pro)} onCheckedChange={() => togglePro(pro)} /> {pro}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase mb-2">Select Cons</p>
                  <div className="space-y-1.5">
                    {CONS_OPTIONS.map(con => (
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
              {sortedComments.map((comment: any) => {
                const netVotes = (comment.upvotes || 0) - (comment.downvotes || 0);
                const myVote = commentVotes[comment.id];
                return (
                  <div key={comment.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex gap-3">
                      {/* Vote column */}
                      <div className="flex flex-col items-center gap-0.5 min-w-[36px]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${myVote === 'up' ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => handleCommentVote(comment.id, 'up')}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </Button>
                        <span className={`text-xs font-bold ${netVotes > 0 ? 'text-primary' : netVotes < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {netVotes}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${myVote === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}
                          onClick={() => handleCommentVote(comment.id, 'down')}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Comment content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {(comment.profiles?.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold">{comment.profiles?.username || 'Anonymous'}</span>
                                {comment.is_admin && (
                                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 font-semibold">Admin</Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {user && user.id !== comment.user_id && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleReport(comment.id)} title="Report">
                                <Flag className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                title="Delete comment"
                                onClick={async () => {
                                  await deleteComment(comment.id);
                                  toast.success('Comment deleted');
                                  queryClient.invalidateQueries({ queryKey: ['comments', game.id] });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {gameFeatures.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Game Features</h3>
              <ul className="space-y-2">
                {gameFeatures.map((feature) => (
                  <li key={feature.id} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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

      {/* Admin Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="Image URL" value={editForm.image} onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))} />
            <Textarea placeholder="Description" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            <select
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              value={editForm.category}
              onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
            >
              {ALL_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <Input placeholder="Tags (comma separated)" value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} />
            <Input placeholder="Roblox link" value={editForm.roblox_link} onChange={e => setEditForm(f => ({ ...f, roblox_link: e.target.value }))} />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Game Features</p>
              <FeatureChecklist
                options={allFeatureOptions}
                selectedIds={editFeatureIds}
                onToggle={(id) => setEditFeatureIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])}
                className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto sm:grid-cols-2"
              />
            </div>
            <Button className="w-full" onClick={handleEditGame}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamePage;
