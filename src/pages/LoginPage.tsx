import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const LoginPage = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "signup-success">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // 🔵 LOGIN GOOGLE (já existente)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // 🟣 LOGIN ROBLOX (NOVO)
  const handleRobloxLogin = () => {
    const clientId = "6400846031443177149";

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/roblox/callback`);

    const url = `https://authorize.roblox.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;

    window.location.href = url;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMode("signup-success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
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
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "signup-success") {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6 text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-primary mb-2" />
          <h1 className="font-display text-2xl font-bold">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => setMode("signin")}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6">
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Send Reset Link
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-6">
        <div className="text-center">
          <Gamepad2 className="mx-auto h-10 w-10 text-primary mb-2" />
          <h1 className="font-display text-2xl font-bold">Sign In</h1>
        </div>

        <div className="space-y-3">
          {/* GOOGLE */}
          <Button variant="secondary" className="w-full gap-2" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>

          {/* ROBLOX */}
          <Button variant="secondary" className="w-full gap-2" onClick={handleRobloxLogin}>
            <img src="https://tr.rbxcdn.com/favicon.ico" className="w-4 h-4" />
            Continue with Roblox
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
