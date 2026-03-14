import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_CATEGORIES } from '@/lib/categories';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { fetchFeatureOptions, submitGame } from '@/lib/supabaseData';
import { useQuery } from '@tanstack/react-query';
import FeatureChecklist from '@/components/game/FeatureChecklist';

const AddGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitterType, setSubmitterType] = useState<'regular' | 'developer' | null>(null);
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [robloxLink, setRobloxLink] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOther, setContactOther] = useState('');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: featureOptions = [] } = useQuery({
    queryKey: ['featureOptions'],
    queryFn: fetchFeatureOptions,
  });

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId],
    );
  };

  const resetForm = () => {
    setGameName('');
    setDescription('');
    setCategory('');
    setTags('');
    setRobloxLink('');
    setContactEmail('');
    setContactOther('');
    setSelectedFeatureIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be signed in to submit a game');
      navigate('/login');
      return;
    }

    if (!submitterType) {
      toast.error('Choose if you are a game developer or regular user');
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

    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (submitterType === 'developer') {
      if (!robloxLink.trim()) {
        toast.error('Roblox game link is required for developers');
        return;
      }
      if (!description.trim()) {
        toast.error('Description is required for developers');
        return;
      }
      if (tagArray.length === 0) {
        toast.error('At least one tag is required for developers');
        return;
      }
      if (selectedFeatureIds.length === 0) {
        toast.error('Select at least one feature');
        return;
      }
      if (!contactEmail.trim()) {
        toast.error('Contact email is required for developers');
        return;
      }
    }

    setLoading(true);
    const slug = gameName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await submitGame({
      title: gameName.trim(),
      slug,
      category,
      description: description.trim() || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined,
      roblox_link: robloxLink.trim() || undefined,
      submitted_by: user.id,
      submitter_type: submitterType,
      contact_email: submitterType === 'developer' ? contactEmail.trim() : undefined,
      contact_other: submitterType === 'developer' ? contactOther.trim() || undefined : undefined,
      feature_ids: submitterType === 'developer' ? selectedFeatureIds : [],
    });

    if (error) {
      toast.error(error.message || 'Failed to submit game');
      setLoading(false);
      return;
    }

    toast.success('Game submitted for review!');
    resetForm();
    navigate('/');
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 font-display text-3xl font-bold">
        {submitterType === 'developer' ? 'Submit Your Roblox Game' : 'Submit a Game'}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {submitterType === 'developer'
          ? 'Share full details so the admin can review your game faster.'
          : 'Add a Roblox game to the platform. It will be reviewed before appearing publicly.'}
      </p>

      {!user && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6 text-center">
          <p className="mb-3 text-muted-foreground">You need to sign in to submit a game.</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      )}

      {submitterType === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
            onClick={() => setSubmitterType('regular')}
          >
            <p className="font-semibold">Regular User</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the simple submission form.</p>
          </button>
          <button
            type="button"
            className="rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
            onClick={() => setSubmitterType('developer')}
          >
            <p className="font-semibold">Game Developer</p>
            <p className="mt-1 text-sm text-muted-foreground">Submit with full game details and features.</p>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSubmitterType(null)}>
              Change submitter type
            </Button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Game Name *</label>
            <Input placeholder="e.g. Blox Fruits" className="bg-secondary" value={gameName} onChange={(e) => setGameName(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description {submitterType === 'developer' ? '*' : '(optional)'}
            </label>
            <Textarea
              placeholder="Describe the game..."
              className="resize-none bg-secondary"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Category *</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tags {submitterType === 'developer' ? '*' : '(comma separated)'}
            </label>
            <Input
              placeholder="e.g. Anime, PvP, Adventure"
              className="bg-secondary"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Roblox Link {submitterType === 'developer' ? '*' : '(optional)'}
            </label>
            <Input
              placeholder="https://www.roblox.com/games/..."
              className="bg-secondary"
              value={robloxLink}
              onChange={(e) => setRobloxLink(e.target.value)}
            />
          </div>

          {submitterType === 'developer' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Features *</label>
                <FeatureChecklist
                  options={featureOptions}
                  selectedIds={selectedFeatureIds}
                  onToggle={toggleFeature}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Contact email *</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-secondary"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Other contact (optional)</label>
                <Input
                  placeholder="Discord, Telegram, portfolio, etc."
                  className="bg-secondary"
                  value={contactOther}
                  onChange={(e) => setContactOther(e.target.value)}
                />
              </div>
            </>
          )}

          <Button type="submit" variant="default" className="w-full" disabled={loading || !user}>
            {loading ? 'Submitting...' : 'Submit Game'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddGamePage;
