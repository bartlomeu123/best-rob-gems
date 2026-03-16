import { supabase } from '@/integrations/supabase/client';
import { Game } from './types';
import { FeatureOption } from './gameFeatures';

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
  submitter_type: 'regular' | 'developer' | null;
  contact_email: string | null;
  contact_other: string | null;
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
    submitterType: (g.submitter_type as 'regular' | 'developer' | null) || 'regular',
    contactEmail: g.contact_email || undefined,
    contactOther: g.contact_other || undefined,
  };
}

// ---- Game fetchers ----

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

export async function fetchGamesByCategory(categorySlug: string): Promise<Game[]> {
  // Try matching by slug (case-insensitive) - games may store category as name or slug
  const { data } = await supabase
    .from('games')
    .select('*')
    .or(`category.ilike.${categorySlug}`)
    .eq('status', 'approved');
  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchGamesByTag(tag: string): Promise<Game[]> {
  // Tags are stored with various casing, so we search with ilike on title/tags
  // The .contains operator is case-sensitive, so we fetch all approved and filter client-side
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved');
  if (!data) return [];
  const lowerTag = tag.toLowerCase();
  const filtered = (data as unknown as DbGame[]).filter(g =>
    (g.tags || []).some(t => t.toLowerCase() === lowerTag)
  );
  return filtered.map(dbGameToGame);
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
  submitter_type?: 'regular' | 'developer';
  contact_email?: string;
  contact_other?: string;
  feature_ids?: string[];
}) {
  const { feature_ids = [], ...gamePayload } = game;

  const { data, error } = await supabase
    .from('games')
    .insert({ ...gamePayload, status: 'pending' })
    .select('id')
    .single();

  if (error || !data) return { data: null, error };

  if (feature_ids.length > 0) {
    const featureRows = feature_ids.map((featureId) => ({ game_id: data.id, feature_id: featureId }));
    const { error: featureError } = await supabase.from('game_features').insert(featureRows);
    if (featureError) return { data: null, error: featureError };
  }

  return { data, error: null };
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
  submitter_type?: 'regular' | 'developer';
  contact_email?: string;
  contact_other?: string;
  feature_ids?: string[];
}) {
  const { feature_ids, ...gameUpdates } = updates;

  const updateResult = await supabase.from('games').update(gameUpdates).eq('id', gameId);
  if (updateResult.error) return updateResult;

  if (feature_ids) {
    const { error: clearError } = await supabase.from('game_features').delete().eq('game_id', gameId);
    if (clearError) return { data: null, error: clearError };

    if (feature_ids.length > 0) {
      const rows = feature_ids.map((featureId) => ({ game_id: gameId, feature_id: featureId }));
      const { error: insertError } = await supabase.from('game_features').insert(rows);
      if (insertError) return { data: null, error: insertError };
    }
  }

  return updateResult;
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
  submitter_type?: 'regular' | 'developer';
  contact_email?: string;
  contact_other?: string;
  feature_ids?: string[];
}) {
  const { feature_ids = [], ...gamePayload } = game;

  const { data, error } = await supabase
    .from('games')
    .insert({ ...gamePayload, status: 'approved' })
    .select('id')
    .single();

  if (error || !data) return { data: null, error };

  if (feature_ids.length > 0) {
    const rows = feature_ids.map((featureId) => ({ game_id: data.id, feature_id: featureId }));
    const { error: featureError } = await supabase.from('game_features').insert(rows);
    if (featureError) return { data: null, error: featureError };
  }

  return { data, error: null };
}

// ---- Category counts ----

export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('games')
    .select('category')
    .eq('status', 'approved');
  if (!data) return {};
  const counts: Record<string, number> = {};
  for (const row of data) {
    // Store counts by lowercase slug so they match ALL_CATEGORIES slugs
    const key = row.category.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

// ---- Game Images ----

export async function fetchGameImages(gameId: string): Promise<{ id: string; image_url: string }[]> {
  const { data } = await supabase
    .from('game_images')
    .select('id, image_url')
    .eq('game_id', gameId)
    .order('created_at', { ascending: true });
  return (data as any[]) || [];
}

export async function addGameImage(gameId: string, imageUrl: string) {
  return supabase.from('game_images').insert({ game_id: gameId, image_url: imageUrl });
}

export async function deleteGameImage(imageId: string) {
  return supabase.from('game_images').delete().eq('id', imageId);
}

export async function fetchFeatureOptions(): Promise<FeatureOption[]> {
  const { data } = await supabase
    .from('features')
    .select('id, name')
    .order('name', { ascending: true });

  return (data || []) as FeatureOption[];
}

export async function fetchGameFeatures(gameId: string): Promise<FeatureOption[]> {
  const { data } = await supabase
    .from('game_features')
    .select('feature_id, features(name)')
    .eq('game_id', gameId);

  if (!data) return [];

  return (data as any[])
    .map((row) => ({
      id: row.feature_id,
      name: row.features?.name,
    }))
    .filter((item) => !!item.name) as FeatureOption[];
}

export async function fetchGamesBySubmitter(userId: string): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false });

  if (!data) return [];
  return (data as unknown as DbGame[]).map(dbGameToGame);
}

export async function fetchFavoritedGames(userId: string): Promise<Game[]> {
  const { data: favorites } = await supabase
    .from('favorites')
    .select('game_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!favorites || favorites.length === 0) return [];

  const gameIds = favorites.map((f: any) => f.game_id);

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .in('id', gameIds);

  if (!games) return [];

  const mapped = (games as unknown as DbGame[]).map(dbGameToGame);
  const orderMap = new Map(gameIds.map((id: string, index: number) => [id, index]));
  return mapped.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
}

// ---- Comments ----

export async function fetchComments(gameId: string) {
  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey_profiles(username, avatar_url)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });

  if (!data) return [];

  const userIds = [...new Set(data.map((c: any) => c.user_id))];
  const { data: roles } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds)
    .eq('role', 'admin');

  const adminSet = new Set((roles || []).map((r: any) => r.user_id));

  // Fetch vote counts for all comments
  const commentIds = data.map((c: any) => c.id);
  const { data: votes } = await supabase
    .from('comment_votes')
    .select('comment_id, vote_type')
    .in('comment_id', commentIds);

  const voteCounts: Record<string, { up: number; down: number }> = {};
  for (const v of votes || []) {
    if (!voteCounts[v.comment_id]) voteCounts[v.comment_id] = { up: 0, down: 0 };
    if (v.vote_type === 'up') voteCounts[v.comment_id].up++;
    else voteCounts[v.comment_id].down++;
  }

  const enrichedComments = data.map((c: any) => ({
    ...c,
    is_admin: adminSet.has(c.user_id),
    upvotes: voteCounts[c.id]?.up || 0,
    downvotes: voteCounts[c.id]?.down || 0,
  }));

  return enrichedComments.sort((a: any, b: any) => {
    const scoreDiff = (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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

// ---- Comment Votes ----

export async function getUserCommentVote(commentId: string, userId: string) {
  const { data } = await supabase
    .from('comment_votes')
    .select('vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();
  return data?.vote_type as 'up' | 'down' | null;
}

export async function castCommentVote(commentId: string, userId: string, voteType: 'up' | 'down') {
  const { data: existing } = await supabase
    .from('comment_votes')
    .select('id, vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      return supabase.from('comment_votes').delete().eq('id', existing.id);
    } else {
      return supabase.from('comment_votes').update({ vote_type: voteType }).eq('id', existing.id);
    }
  } else {
    return supabase.from('comment_votes').insert({ comment_id: commentId, user_id: userId, vote_type: voteType });
  }
}

export async function getUserCommentVotes(commentIds: string[], userId: string) {
  if (commentIds.length === 0) return {};
  const { data } = await supabase
    .from('comment_votes')
    .select('comment_id, vote_type')
    .in('comment_id', commentIds)
    .eq('user_id', userId);
  const map: Record<string, 'up' | 'down'> = {};
  for (const v of data || []) {
    map[v.comment_id] = v.vote_type as 'up' | 'down';
  }
  return map;
}

// ---- Comment Reports ----

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

// ---- Votes (game votes) ----

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

// ---- Favorites ----

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
