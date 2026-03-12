import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Lock } from 'lucide-react';
import { useState } from 'react';

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Temporary placeholder — real auth requires Lovable Cloud
  if (!authenticated) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6 text-center">
          <Lock className="mx-auto h-10 w-10 text-primary" />
          <h1 className="font-display text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">This panel requires authentication. Enable Lovable Cloud for proper admin login with role-based access.</p>
          <p className="text-xs text-muted-foreground italic">Demo: type "admin" to preview the panel.</p>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter admin password"
              className="bg-secondary"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                if (password === 'admin') {
                  setAuthenticated(true);
                } else {
                  setError('Invalid password');
                }
              }}
            >
              Access Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        <Badge variant="secondary" className="text-xs">Demo Mode</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {[
          { label: 'Pending Games', count: 2 },
          { label: 'Reported Games', count: 3 },
          { label: 'Reported Comments', count: 5 },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold">{item.label}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{item.count}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Pending Game Submissions</h2>
      <div className="space-y-3">
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
