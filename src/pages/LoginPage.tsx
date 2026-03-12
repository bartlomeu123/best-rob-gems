import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2 } from 'lucide-react';
import { useState } from 'react';

const LoginPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

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
          <Button variant="secondary" className="w-full gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
          <Button variant="secondary" className="w-full gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Continue with X
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <Input placeholder="Username" className="bg-secondary" />
          )}
          <Input placeholder="Email address" type="email" className="bg-secondary" />
          <Input placeholder="Password" type="password" className="bg-secondary" />
          {mode === 'signup' && (
            <Input placeholder="Confirm password" type="password" className="bg-secondary" />
          )}
          <Button variant="default" className="w-full">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>

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
