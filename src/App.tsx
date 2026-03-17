import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import GamePage from "./pages/GamePage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import TopGamesPage from "./pages/TopGamesPage";
import TrendingPage from "./pages/TrendingPage";
import NewGamesPage from "./pages/NewGamesPage";
import RandomPage from "./pages/RandomPage";
import GamesLikePage from "./pages/GamesLikePage";
import ComparePage from "./pages/ComparePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import AddGamePage from "./pages/AddGamePage";
import AdminPage from "./pages/AdminPage";
import UserProfilePage from "./pages/UserProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game/:slug" element={<GamePage />} />
              <Route path="/category/:name" element={<CategoryPage />} />
              <Route path="/tag/:name" element={<TagPage />} />
              <Route path="/top-games" element={<TopGamesPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/new-games" element={<NewGamesPage />} />
              <Route path="/random" element={<RandomPage />} />
              <Route path="/games-like/:slug" element={<GamesLikePage />} />
              <Route path="/compare/:slugs" element={<ComparePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/add-game" element={<AddGamePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
