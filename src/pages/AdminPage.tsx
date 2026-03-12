import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { games } from '@/lib/mockData';

const AdminPage = () => {
  const pending = games.filter(g => g.status === 'pending');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {[
          { label: 'Pending Games', count: 2, href: '/admin/pending-games' },
          { label: 'Reported Games', count: 3, href: '/admin/reported-games' },
          { label: 'Reported Comments', count: 5, href: '/admin/reported-comments' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">{item.label}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{item.count}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Pending Game Submissions</h2>
      <div className="space-y-3">
        {pending.length === 0 && <p className="text-muted-foreground text-sm">No pending submissions.</p>}
        {/* Sample pending items */}
        {[{ title: 'Example Game 1', submitter: 'user123' }, { title: 'Example Game 2', submitter: 'gamer456' }].map((item, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <span className="font-semibold">{item.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">by {item.submitter}</span>
              <Badge variant="secondary" className="ml-2">Pending</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm">Approve</Button>
              <Button variant="destructive" size="sm">Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
