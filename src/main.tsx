import { createRoot } from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  const hash = window.location.hash;

  if (hash.includes("access_token") || hash.includes("refresh_token")) {
    try {
      await new Promise<void>((resolve) => {
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            listener.subscription.unsubscribe();
            resolve();
          }
        });
        setTimeout(resolve, 1000);
      });

      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    } catch (err) {
      console.error("OAuth bootstrap error:", err);
    }
  } else {
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
