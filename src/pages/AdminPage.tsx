import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPendingGames, approveGame, rejectGame } from '@/lib/supabaseData';
import { Game } from '@/lib/types';
import { toast } from 'sonner';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingGames().then(games => {
        setPendingGames(games);
        setLoadingGames(false);
      });
    }
  }, [isAdmin]);

  const handleApprove = async (gameId: string) => {
    const { error } = await approveGame(gameId);
    if (error) {
      toast.error('Failed to approve');
      return;
    }
    toast.success('Game approved!');
    setPendingGames(prev => prev.filter(g => g.id !== gameId));
  };

  const handleReject = async (gameId: string) => {
    const { error } = await rejectGame(gameId);
    if (error) {
      toast.error('Failed to reject');
      return;
    }
    toast.success('Game rejected');
    setPendingGames(prev => prev.filter(g => g.id !== gameId));
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
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Pending Games</h3>
          <p className="text-3xl font-bold text-primary mt-2">{pendingGames.length}</p>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Pending Game Submissions</h2>
      {loadingGames ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : pendingGames.length === 0 ? (
        <p className="text-muted-foreground">No pending submissions.</p>
      ) : (
        <div className="space-y-3">
          {pendingGames.map(game => (
            <div key={game.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <span className="font-semibold">{game.title}</span>
                <Badge variant="secondary" className="ml-2">Pending</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => handleApprove(game.id)}>Approve</Button>
                <Button variant="destructive" size="sm" onClick={() => handleReject(game.id)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
