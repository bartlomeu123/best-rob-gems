import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { submitGame } from '@/lib/supabaseData';

const AddGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [robloxLink, setRobloxLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to submit a game');
      navigate('/login');
      return;
    }
    if (!gameName.trim()) {
      toast.error('Game name is required');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    setLoading(true);
    const slug = gameName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await submitGame({
      title: gameName.trim(),
      slug,
      category,
      description: description.trim() || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined,
      roblox_link: robloxLink.trim() || undefined,
      submitted_by: user.id,
    });
    if (error) {
      toast.error(error.message || 'Failed to submit game');
    } else {
      toast.success('Game submitted for review!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">Submit a Game</h1>
      <p className="text-muted-foreground text-sm mb-6">Add a new Roblox game to the platform. It will be reviewed before appearing publicly.</p>

      {!user && (
        <div className="rounded-xl border border-border bg-card p-6 text-center mb-6">
          <p className="text-muted-foreground mb-3">You need to sign in to submit a game.</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Game Name *</label>
          <Input placeholder="e.g. Blox Fruits" className="bg-secondary" value={gameName} onChange={e => setGameName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description (optional)</label>
          <Textarea placeholder="Describe the game..." className="bg-secondary resize-none" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Category *</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
          <Input placeholder="e.g. Anime, PvP, Adventure" className="bg-secondary" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Roblox Link (optional)</label>
          <Input placeholder="https://www.roblox.com/games/..." className="bg-secondary" value={robloxLink} onChange={e => setRobloxLink(e.target.value)} />
        </div>
        <Button type="submit" variant="default" className="w-full" disabled={loading || !user}>
          {loading ? 'Submitting...' : 'Submit Game'}
        </Button>
      </form>
    </div>
  );
};

export default AddGamePage;
