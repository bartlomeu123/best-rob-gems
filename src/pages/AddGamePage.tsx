import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AddGamePage = () => {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [robloxLink, setRobloxLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast.error('Game name is required');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    toast.success('Game submitted for review!');
    navigate('/');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-2">Submit a Game</h1>
      <p className="text-muted-foreground text-sm mb-6">Add a new Roblox game to the platform. It will be reviewed before appearing publicly. Max 5 submissions per day.</p>

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
        <Button type="submit" variant="default" className="w-full">Submit Game</Button>
      </form>
    </div>
  );
};

export default AddGamePage;
