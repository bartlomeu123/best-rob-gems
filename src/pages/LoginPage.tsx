import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

const LoginPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'signup-success'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMode('signup-success');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Signed in!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset link sent! Check your email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'signup-success') {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6 text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-primary mb-2" />
          <h1 className="font-display text-2xl font-bold">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>. Please click the link in the email to activate your account.
          </p>
          <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder.</p>
          <Button variant="secondary" className="w-full" onClick={() => setMode('signin')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6">
          <div className="text-center">
            <Gamepad2 className="mx-auto h-10 w-10 text-primary mb-2" />
            <h1 className="font-display text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <Input placeholder="Email address" type="email" className="bg-secondary" value={email} onChange={e => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <button onClick={() => setMode('signin')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mx-auto">
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6">
        <div className="text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-primary mb-2" />
          <h1 className="font-display text-2xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'signin' ? 'Welcome back!' : 'Join the community'}
          </p>
        </div>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full gap-2" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'signup' && (
            <Input placeholder="Username" className="bg-secondary" value={username} onChange={e => setUsername(e.target.value)} />
          )}
          <Input placeholder="Email address" type="email" className="bg-secondary" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input placeholder="Password" type="password" className="bg-secondary" value={password} onChange={e => setPassword(e.target.value)} required />
          {mode === 'signup' && (
            <Input placeholder="Confirm password" type="password" className="bg-secondary" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          )}
          <Button type="submit" variant="default" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {mode === 'signin' && (
          <button onClick={() => setMode('forgot')} className="block w-full text-center text-xs text-muted-foreground hover:text-primary">
            Forgot your password?
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">Sign Up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-primary hover:underline font-medium">Sign In</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
