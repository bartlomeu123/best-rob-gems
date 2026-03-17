export interface DiscoveryMeta {
  type: 'feature' | 'category' | 'ranking' | 'platform' | 'tag' | 'unknown';
  key: string;
  title: string;
}

// Static SEO-friendly discovery routes
export const DISCOVERY_ROUTES: Record<string, DiscoveryMeta> = {
  // Category pages
  'best-roblox-anime-games': { type: 'category', key: 'anime', title: '🎌 Best Roblox Anime Games' },
  'best-roblox-horror-games': { type: 'category', key: 'horror', title: '👻 Best Roblox Horror Games' },
  'best-roblox-tycoon-games': { type: 'category', key: 'tycoon', title: '🏭 Best Roblox Tycoon Games' },
  'best-roblox-rpg-games': { type: 'category', key: 'rpg', title: '🛡️ Best Roblox RPG Games' },
  'best-roblox-fps-games': { type: 'category', key: 'fps', title: '🔫 Best Roblox FPS Games' },
  'best-roblox-simulator-games': { type: 'category', key: 'simulator', title: '🎮 Best Roblox Simulator Games' },
  'best-roblox-fighting-games': { type: 'category', key: 'fighting', title: '🥊 Best Roblox Fighting Games' },
  'best-roblox-survival-games': { type: 'category', key: 'survival', title: '🏕️ Best Roblox Survival Games' },
  'best-roblox-sandbox-games': { type: 'category', key: 'sandbox', title: '🧱 Best Roblox Sandbox Games' },
  'best-roblox-racing-games': { type: 'category', key: 'racing', title: '🏎️ Best Roblox Racing Games' },
  'best-roblox-adventure-games': { type: 'category', key: 'adventure', title: '🗺️ Best Roblox Adventure Games' },
  'best-roblox-obby-games': { type: 'category', key: 'obby', title: '🏃 Best Roblox Obby Games' },

  // Feature pages
  'roblox-pvp-games': { type: 'feature', key: 'pvp-combat', title: '⚡ Roblox PvP Games' },
  'roblox-open-world-games': { type: 'feature', key: 'open-world', title: '🌍 Roblox Open World Games' },
  'roblox-games-with-trading': { type: 'feature', key: 'trading-system', title: '🔄 Roblox Games with Trading' },
  'roblox-games-with-boss-battles': { type: 'feature', key: 'boss-battles', title: '🐉 Roblox Games with Boss Battles' },
  'roblox-multiplayer-games': { type: 'feature', key: 'multiplayer', title: '👥 Roblox Multiplayer Games' },
  'roblox-co-op-games': { type: 'feature', key: 'co-op-gameplay', title: '🤝 Roblox Co-op Games' },
  'roblox-sandbox-games': { type: 'feature', key: 'sandbox', title: '🧱 Roblox Sandbox Games' },

  // Platform pages
  'roblox-mobile-games': { type: 'platform', key: 'mobile', title: '📱 Roblox Mobile Games' },
  'roblox-console-games': { type: 'platform', key: 'console', title: '🎮 Roblox Console Games' },
  'roblox-cross-platform-games': { type: 'platform', key: 'cross-platform', title: '🔗 Roblox Cross-Platform Games' },

  // Ranking pages
  'most-liked-roblox-games': { type: 'ranking', key: 'most-liked', title: '❤️ Most Liked Roblox Games' },
  'trending-roblox-games': { type: 'ranking', key: 'trending', title: '🔥 Trending Roblox Games' },
  'fastest-growing-roblox-games': { type: 'ranking', key: 'fastest-growing', title: '📈 Fastest Growing Roblox Games' },
  'new-roblox-games': { type: 'ranking', key: 'new', title: '✨ New Roblox Games' },
};

export function getDiscoveryMeta(slug: string): DiscoveryMeta {
  if (DISCOVERY_ROUTES[slug]) return DISCOVERY_ROUTES[slug];

  // Try to infer from slug pattern
  if (slug.startsWith('best-roblox-') && slug.endsWith('-games')) {
    const cat = slug.replace('best-roblox-', '').replace('-games', '');
    return { type: 'category', key: cat, title: `Best Roblox ${cat.charAt(0).toUpperCase() + cat.slice(1)} Games` };
  }
  if (slug.startsWith('roblox-') && slug.endsWith('-games')) {
    const feature = slug.replace('roblox-', '').replace('-games', '');
    return { type: 'feature', key: feature, title: `Roblox ${feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Games` };
  }

  return { type: 'unknown', key: slug, title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
}

export function getAllDiscoveryLinks() {
  return Object.entries(DISCOVERY_ROUTES).map(([slug, meta]) => ({
    slug,
    ...meta,
  }));
}
