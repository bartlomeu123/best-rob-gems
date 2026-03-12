import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/mockData';

const AddGamePage = () => (
  <div className="container mx-auto max-w-2xl px-4 py-6">
    <h1 className="font-display text-3xl font-bold mb-2">Submit a Game</h1>
    <p className="text-muted-foreground text-sm mb-6">Add a new Roblox game to the platform. It will be reviewed before appearing publicly. Max 5 submissions per day.</p>

    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Game Name *</label>
        <Input placeholder="e.g. Blox Fruits" className="bg-secondary" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Game Image URL *</label>
        <Input placeholder="https://..." className="bg-secondary" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Description *</label>
        <Textarea placeholder="Describe the game..." className="bg-secondary resize-none" rows={4} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Category *</label>
        <Select>
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
        <Input placeholder="e.g. Anime, PvP, Adventure" className="bg-secondary" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Roblox Link (optional)</label>
        <Input placeholder="https://www.roblox.com/games/..." className="bg-secondary" />
      </div>
      <Button variant="default" className="w-full">Submit Game</Button>
    </div>
  </div>
);

export default AddGamePage;
