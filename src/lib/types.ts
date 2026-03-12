export interface Game {
  id: string;
  slug: string;
  title: string;
  image: string;
  description: string;
  category: string;
  tags: string[];
  likes: number;
  dislikes: number;
  robloxLink?: string;
  createdAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  votesLast24h: number;
  rankChange: number; // positive = rising, negative = falling
}

export interface Comment {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  pros: string[];
  cons: string[];
  createdAt: string;
  replies: Comment[];
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
  gamesSubmitted: string[];
  favorites: string[];
  comments: string[];
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export const PROS_OPTIONS = [
  'Fun gameplay',
  'Frequent updates',
  'Active community',
  'Good progression',
  'Good graphics',
  'Great storyline',
  'Fair monetization',
  'Unique concept',
];

export const CONS_OPTIONS = [
  'Too much grinding',
  'Pay to win',
  'Bugs',
  'Toxic community',
  'Lack of content',
  'Poor optimization',
  'Server issues',
  'Repetitive gameplay',
];

export function getScore(likes: number, dislikes: number): number {
  if (likes + dislikes === 0) return 0;
  return Math.round((likes / (likes + dislikes)) * 100);
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'score-gradient-high';
  if (score >= 40) return 'score-gradient-mid';
  return 'score-gradient-low';
}

export function getScoreTextClass(score: number): string {
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}
