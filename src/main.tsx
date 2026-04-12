import { createRoot } from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

/**

* Bootstrap the app while safely handling Supabase OAuth callbacks.
* This ensures the access_token in the URL hash is processed before
* React Router mounts and potentially clears the hash.
  */
  async function bootstrap() {
  const hash = window.location.hash;

// If returning from OAuth (Google, etc)
if (hash.includes("access_token") || hash.includes("refresh_token")) {
try {
// Wait for Supabase to emit the auth event
await new Promise<void>((resolve) => {
const { data: listener } = supabase.auth.onAuthStateChange((event) => {
if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
listener.subscription.unsubscribe();
resolve();
}
});

```
    // Safety fallback in case event does not fire
    setTimeout(resolve, 1000);
  });

  // Remove the OAuth hash from the URL
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
} catch (err) {
  console.error("OAuth bootstrap error:", err);
}
```

} else {
// Normal page load — validate session
try {
const { error } = await supabase.auth.getSession();
if (error) {
console.warn("Invalid session detected, signing out:", error.message);
await supabase.auth.signOut();
}
} catch {
// Ignore and continue unauthenticated
}
}

createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
