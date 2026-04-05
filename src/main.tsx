import { createRoot } from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Before mounting React, let Supabase process any OAuth tokens in the URL hash.
 * This prevents React Router from interfering with the hash before Supabase reads it.
 * Also handles stale JWTs left over from the Lovable Cloud migration.
 */
async function bootstrap() {
  const hash = window.location.hash;

  // If the URL contains an OAuth callback hash, wait for Supabase to process it
  if (hash && (hash.includes("access_token") || hash.includes("refresh_token") || hash.includes("error_description"))) {
    try {
      // getSession() will trigger _initialize() which reads the hash
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("OAuth callback processing error:", error.message);
      }
      // Clean the hash from the URL after processing
      if (data.session) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch (err) {
      console.error("Failed to process OAuth callback:", err);
    }
  } else {
    // Normal page load — validate existing session, clear stale tokens if invalid
    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.warn("Stale session detected, signing out:", error.message);
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore — app will work as unauthenticated
    }
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
