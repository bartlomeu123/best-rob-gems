export interface CategoryDef {
  name: string;
  slug: string;
  icon: string;
}

export const ALL_CATEGORIES: CategoryDef[] = [
  { name: 'FPS', slug: 'fps', icon: '🔫' },
  { name: 'RPG', slug: 'rpg', icon: '🛡️' },
  { name: 'Simulator', slug: 'simulator', icon: '🎮' },
  { name: 'Fighting', slug: 'fighting', icon: '🥊' },
  { name: 'Survival', slug: 'survival', icon: '🏕️' },
  { name: 'Sandbox', slug: 'sandbox', icon: '🧱' },
  { name: 'Strategy', slug: 'strategy', icon: '♟️' },
  { name: 'Shooter', slug: 'shooter', icon: '🎯' },
  { name: 'Racing', slug: 'racing', icon: '🏎️' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Social', slug: 'social', icon: '💬' },
  { name: 'Roleplay', slug: 'roleplay', icon: '🎭' },
  { name: 'Pet Game', slug: 'pet-game', icon: '🐾' },
  { name: 'Fantasy', slug: 'fantasy', icon: '🧙' },
  { name: 'Medieval', slug: 'medieval', icon: '🏰' },
  { name: 'Ninja', slug: 'ninja', icon: '🥷' },
  { name: 'Sci-fi', slug: 'sci-fi', icon: '🚀' },
  { name: 'Military', slug: 'military', icon: '🎖️' },
  { name: 'Zombie', slug: 'zombie', icon: '🧟' },
  { name: 'Monster', slug: 'monster', icon: '👹' },
  { name: 'Casual', slug: 'casual', icon: '🎲' },
  { name: 'Mini Games', slug: 'mini-games', icon: '🕹️' },
  { name: 'Escape', slug: 'escape', icon: '🚪' },
  { name: 'Economy', slug: 'economy', icon: '💰' },
  { name: 'Anime', slug: 'anime', icon: '⚔️' },
  { name: 'Horror', slug: 'horror', icon: '👻' },
  { name: 'Tycoon', slug: 'tycoon', icon: '🏭' },
  { name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { name: 'PvP', slug: 'pvp', icon: '⚡' },
  { name: 'Obby', slug: 'obby', icon: '🏃' },
  { name: 'Other', slug: 'other', icon: '📦' },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return ALL_CATEGORIES.find(c => c.slug === slug);
}
