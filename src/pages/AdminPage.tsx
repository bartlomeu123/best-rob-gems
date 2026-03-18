import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, Trash2, Check, X, AlertTriangle, Edit, Eye, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  fetchPendingGames, fetchAllGames, approveGame, rejectGame, deleteGame,
  adminAddGame, updateGame, fetchReportedComments, resolveReport, deleteComment,
  fetchFeatureOptions, fetchGameFeatures,
} from '@/lib/supabaseData';
import { Game } from '@/lib/types';
import { toast } from 'sonner';
import { ALL_CATEGORIES } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';
import { FeatureOption } from '@/lib/gameFeatures';
import FeatureChecklist from '@/components/game/FeatureChecklist';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([]);
  const [pendingDeveloperNames, setPendingDeveloperNames] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [importing, setImporting] = useState(false);
  const [retagging, setRetagging] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '', description: '', image: '', category: ALL_CATEGORIES[0].slug, tags: '', roblox_link: '',
    feature_ids: [] as string[],
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', image: '', category: '', tags: '', roblox_link: '',
    feature_ids: [] as string[],
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login');
  }, [user, isAdmin, loading, navigate]);

  const loadData = async () => {
    setLoadingData(true);
    const [pending, all, reported, features] = await Promise.all([
      fetchPendingGames(),
      fetchAllGames(),
      fetchReportedComments(),
      fetchFeatureOptions(),
    ]);

    setPendingGames(pending);
    setAllGames(all);
    setReports(reported);
    setFeatureOptions(features);

    const developerIds = [...new Set(
      pending
        .filter((game) => game.submitterType === 'developer' && game.submittedBy !== 'unknown')
        .map((game) => game.submittedBy),
    )];

    if (developerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', developerIds);

      const map: Record<string, string> = {};
      for (const p of profiles || []) map[p.user_id] = p.username;
      setPendingDeveloperNames(map);
    } else {
      setPendingDeveloperNames({});
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const toggleFeature = (scope: 'add' | 'edit', featureId: string) => {
    if (scope === 'add') {
      setAddForm((prev) => ({
        ...prev,
        feature_ids: prev.feature_ids.includes(featureId)
          ? prev.feature_ids.filter((id) => id !== featureId)
          : [...prev.feature_ids, featureId],
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      feature_ids: prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter((id) => id !== featureId)
        : [...prev.feature_ids, featureId],
    }));
  };

  const handleApprove = async (gameId: string) => {
    const { error } = await approveGame(gameId);
    if (error) { toast.error('Failed to approve'); return; }
    toast.success('Game approved!');
    setPendingGames((prev) => prev.filter((g) => g.id !== gameId));
    loadData();
  };

  const handleReject = async (gameId: string) => {
    const { error } = await rejectGame(gameId);
    if (error) { toast.error('Failed to reject'); return; }
    toast.success('Game rejected');
    setPendingGames((prev) => prev.filter((g) => g.id !== gameId));
    loadData();
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game permanently?')) return;
    const { error } = await deleteGame(gameId);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Game deleted');
    loadData();
  };

  const handleAddGame = async () => {
    if (!addForm.title.trim()) { toast.error('Title required'); return; }
    if (!user) return;

    const slug = addForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await adminAddGame({
      title: addForm.title.trim(),
      slug,
      category: addForm.category,
      description: addForm.description.trim() || undefined,
      tags: addForm.tags ? addForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      roblox_link: addForm.roblox_link.trim() || undefined,
      image: addForm.image.trim() || undefined,
      submitted_by: user.id,
      feature_ids: addForm.feature_ids,
      submitter_type: 'regular',
    });

    if (error) { toast.error('Failed to add game'); return; }

    toast.success('Game added and approved!');
    setAddForm({
      title: '', description: '', image: '', category: ALL_CATEGORIES[0].slug, tags: '', roblox_link: '', feature_ids: [],
    });
    setAddOpen(false);
    loadData();
  };

  const openEdit = async (game: Game) => {
    setEditGame(game);
    setEditForm({
      title: game.title,
      description: game.description,
      image: game.image,
      category: game.category,
      tags: game.tags.join(', '),
      roblox_link: game.robloxLink || '',
      feature_ids: [],
    });
    setEditOpen(true);

    const currentFeatures = await fetchGameFeatures(game.id);
    setEditForm((prev) => ({
      ...prev,
      feature_ids: currentFeatures.map((feature) => feature.id),
    }));
  };

  const handleEditGame = async () => {
    if (!editGame) return;

    const slug = editForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await updateGame(editGame.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      image: editForm.image.trim() || undefined,
      category: editForm.category,
      tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      roblox_link: editForm.roblox_link.trim() || undefined,
      slug,
      feature_ids: editForm.feature_ids,
    });

    if (error) { toast.error('Failed to update game'); return; }

    toast.success('Game updated!');
    setEditOpen(false);
    setEditGame(null);
    loadData();
  };

  const handleResolveReport = async (reportId: string) => {
    await resolveReport(reportId);
    toast.success('Report resolved');
    loadData();
  };

  const handleDeleteComment = async (commentId: string, reportId: string) => {
    await deleteComment(commentId);
    await resolveReport(reportId);
    toast.success('Comment deleted & report resolved');
    loadData();
  };

  if (loading || !isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="gap-2"
          disabled={importing}
          onClick={async () => {
            setImporting(true);
            try {
              const { data, error } = await supabase.functions.invoke('fetch-roblox-games');
              if (error) throw error;
              const msg = data?.message || `${data?.inserted || 0} new games added`;
              toast.success(msg);
              loadData();
            } catch (err: any) {
              toast.error('Import failed: ' + (err.message || 'Unknown error'));
            } finally {
              setImporting(false);
            }
          }}
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {importing ? 'Importing...' : 'Import 50 New Games'}
        </Button>

        <Button
          variant="secondary"
          className="gap-2"
          disabled={retagging}
          onClick={async () => {
            setRetagging(true);
            try {
              const { data, error } = await supabase.functions.invoke('retag-games');
              if (error) throw error;
              const msg = data?.message || `${data?.updated || 0} games re-tagged`;
              toast.success(msg);
              loadData();
            } catch (err: any) {
              toast.error('Re-tag failed: ' + (err.message || 'Unknown error'));
            } finally {
              setRetagging(false);
            }
          }}
        >
          {retagging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
          {retagging ? 'Re-tagging...' : 'Re-tag All Games'}
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Pending Games</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{pendingGames.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Total Games</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{allGames.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Reported Comments</h3>
          <p className="mt-2 text-3xl font-bold text-destructive">{reports.length}</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="pending">Pending ({pendingGames.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="games">All Games</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {loadingData ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : pendingGames.length === 0 ? (
            <p className="text-muted-foreground">No pending submissions.</p>
          ) : (
            pendingGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  {game.image && <img src={game.image} alt={game.title} className="h-12 w-12 rounded object-cover" />}
                  <div>
                    <span className="font-semibold">{game.title}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">{game.category}</Badge>
                      <Badge variant={game.submitterType === 'developer' ? 'default' : 'outline'} className="text-xs">
                        {game.submitterType === 'developer' ? 'Game Developer' : 'Regular User'}
                      </Badge>
                      {game.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    {game.submitterType === 'developer' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Developer: {pendingDeveloperNames[game.submittedBy] || 'Unknown'}
                      </p>
                    )}
                    {game.description && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{game.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="gap-1" onClick={() => handleApprove(game.id)}>
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleReject(game.id)}>
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reported comments.</p>
          ) : (
            reports.map((report: any) => (
              <div key={report.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-semibold">Reported: {report.reason}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">By: {report.comments?.profiles?.username || 'Unknown'}</p>
                    <p className="mt-1 rounded bg-secondary/50 p-2 text-sm">{report.comments?.text || 'Comment deleted'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Reported on {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleResolveReport(report.id)}>
                      Dismiss
                    </Button>
                    {report.comments?.id && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(report.comments.id, report.id)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Game</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Game title *" value={addForm.title} onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))} />
                  <Input placeholder="Image URL" value={addForm.image} onChange={(e) => setAddForm((f) => ({ ...f, image: e.target.value }))} />
                  <Textarea placeholder="Description" rows={3} value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
                  <select
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
                    value={addForm.category}
                    onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {ALL_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                  <Input placeholder="Tags (comma separated)" value={addForm.tags} onChange={(e) => setAddForm((f) => ({ ...f, tags: e.target.value }))} />
                  <Input placeholder="Roblox link" value={addForm.roblox_link} onChange={(e) => setAddForm((f) => ({ ...f, roblox_link: e.target.value }))} />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Game Features</p>
                    <FeatureChecklist
                      options={featureOptions}
                      selectedIds={addForm.feature_ids}
                      onToggle={(featureId) => toggleFeature('add', featureId)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleAddGame}>Add & Approve Game</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {allGames.length === 0 ? (
            <p className="text-muted-foreground">No games found.</p>
          ) : (
            <div className="space-y-2">
              {allGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {game.image && <img src={game.image} alt={game.title} className="h-10 w-10 flex-shrink-0 rounded object-cover" />}
                    <div className="min-w-0">
                      <span className="text-sm font-semibold">{game.title}</span>
                      <div className="mt-0.5 flex gap-1">
                        <Badge
                          variant={game.status === 'approved' ? 'default' : game.status === 'pending' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {game.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{game.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <Link to={`/game/${game.slug}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(game)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete" onClick={() => handleDelete(game.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                <Input placeholder="Image URL" value={editForm.image} onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))} />
                <Textarea placeholder="Description" rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                <select
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {ALL_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                <Input placeholder="Tags (comma separated)" value={editForm.tags} onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))} />
                <Input placeholder="Roblox link" value={editForm.roblox_link} onChange={(e) => setEditForm((f) => ({ ...f, roblox_link: e.target.value }))} />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Game Features</p>
                  <FeatureChecklist
                    options={featureOptions}
                    selectedIds={editForm.feature_ids}
                    onToggle={(featureId) => toggleFeature('edit', featureId)}
                  />
                </div>

                <Button className="w-full" onClick={handleEditGame}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
