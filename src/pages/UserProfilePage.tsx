import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center font-display text-2xl font-bold text-primary">
            {(username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{username}</h1>
            <p className="text-sm text-muted-foreground">Member since January 2024</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-3">Games Submitted</h2>
          <p className="text-muted-foreground text-sm">No games submitted yet.</p>
        </section>
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-3">Favorite Games</h2>
          <p className="text-muted-foreground text-sm">No favorites yet.</p>
        </section>
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-3">Recent Comments</h2>
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
