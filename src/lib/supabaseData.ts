import { supabase } from '@/integrations/supabase/client';
import { Game } from './types';

export interface DbGame {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  description: string | null;
  category: string;
  tags: string[];
  likes: number;
  dislikes: number;
  roblox_link: string | null;
  submitted_by: string | null;
  status: string;
  votes_last_24h: number;
  rank_change: number;
  created_at: string;
}

export function dbGameToGame(g: DbGame): Game {
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    image: g.image || '',
    description: g.description || '',
    category: g.category,
    tags: g.tags || [],
    likes: g.likes,
    dislikes: g.dislikes,
    robloxLink: g.roblox_link || undefined,
    createdAt: g.created_at,
    submittedBy: g.submitted_by || 'unknown',
    status: g.status as 'pending' | 'approved' | 'rejected',
    votesLast24h: g.votes_last_24h,
    rankChange: g.rank_change,
  };
}

export async function fetchApprovedGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('likes', { ascending: false });
  if (error || !data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return dbGameToGame(data as unknown as DbGame);
}

export async function fetchGamesByCategory(category: string): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('category', category)
    .eq('status', 'approved');
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchGamesByTag(tag: string): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .contains('tags', [tag])
    .eq('status', 'approved');
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchTrendingGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('votes_last_24h', { ascending: false });
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchNewGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchRisingGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .gt('rank_change', 0)
    .order('rank_change', { ascending: false });
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchPendingGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchAllGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function submitGame(game: {
  title: string;
  slug: string;
  category: string;
  description?: string;
  tags?: string[];
  roblox_link?: string;
  image?: string;
  submitted_by: string;
}) {
  return supabase.from('games').insert({ ...game, status: 'pending' });
}

export async function approveGame(gameId: string) {
  return supabase.from('games').update({ status: 'approved' }).eq('id', gameId);
}

export async function rejectGame(gameId: string) {
  return supabase.from('games').update({ status: 'rejected' }).eq('id', gameId);
}

export async function deleteGame(gameId: string) {
  return supabase.from('games').delete().eq('id', gameId);
}

export async function updateGame(gameId: string, updates: {
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  tags?: string[];
  roblox_link?: string;
  slug?: string;
}) {
  return supabase.from('games').update(updates).eq('id', gameId);
}

export async function adminAddGame(game: {
  title: string;
  slug: string;
  category: string;
  description?: string;
  tags?: string[];
  roblox_link?: string;
  image?: string;
  submitted_by: string;
}) {
  return supabase.from('games').insert({ ...game, status: 'approved' });
}

// Comments
export async function fetchComments(gameId: string) {
  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey_profiles(username, avatar_url)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addComment(comment: {
  game_id: string;
  user_id: string;
  text: string;
  pros?: string[];
  cons?: string[];
  parent_id?: string;
}) {
  return supabase.from('comments').insert(comment);
}

export async function deleteComment(commentId: string) {
  return supabase.from('comments').delete().eq('id', commentId);
}

// Comment Reports
export async function reportComment(commentId: string, reportedBy: string, reason: string) {
  return supabase.from('comment_reports').insert({
    comment_id: commentId,
    reported_by: reportedBy,
    reason,
  });
}

export async function fetchReportedComments() {
  const { data } = await supabase
    .from('comment_reports')
    .select('*, comments(id, text, game_id, user_id, created_at, profiles!comments_user_id_fkey_profiles(username))')
    .eq('resolved', false)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function resolveReport(reportId: string) {
  return supabase.from('comment_reports').update({ resolved: true }).eq('id', reportId);
}

// Votes
export async function getUserVote(gameId: string, userId: string) {
  const { data } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();
  return data?.vote_type as 'like' | 'dislike' | null;
}

export async function castVote(gameId: string, userId: string, voteType: 'like' | 'dislike') {
  const { data: existing } = await supabase
    .from('votes')
    .select('id, vote_type')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      return supabase.from('votes').delete().eq('id', existing.id);
    } else {
      return supabase.from('votes').update({ vote_type: voteType }).eq('id', existing.id);
    }
  } else {
    return supabase.from('votes').insert({ game_id: gameId, user_id: userId, vote_type: voteType });
  }
}

// Favorites
export async function toggleFavorite(gameId: string, userId: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return supabase.from('favorites').delete().eq('id', existing.id);
  }
  return supabase.from('favorites').insert({ game_id: gameId, user_id: userId });
}

export async function isFavorited(gameId: string, userId: string) {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function searchGames(query: string): Promise<Game[]> {
  const q = `%${query}%`;
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .or(`title.ilike.${q},category.ilike.${q}`);
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}
