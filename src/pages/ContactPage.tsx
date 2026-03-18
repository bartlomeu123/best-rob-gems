import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('All fields are required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact', {
        body: { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() },
      });
      if (error) throw error;
      setSent(true);
      toast.success('Message sent successfully!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          <h2 className="font-display text-2xl font-bold">Message Sent!</h2>
          <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you soon.</p>
          <Button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <Mail className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="font-display text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">Have questions or feedback? Get in touch with us.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name <span className="text-destructive">*</span></label>
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email <span className="text-destructive">*</span></label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            maxLength={255}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Message <span className="text-destructive">*</span></label>
          <Textarea
            placeholder="Write your message here..."
            rows={5}
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            maxLength={5000}
            required
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={sending}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
};

export default ContactPage;
