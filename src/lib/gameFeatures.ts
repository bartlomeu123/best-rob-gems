export const GAME_FEATURES = [
  'Single Player',
  'Multiplayer',
  'Co-op Gameplay',
  'PvP Combat',
  'PvE Combat',
  'Open World',
  'Instanced Dungeons',
  'Lobby Based',
  'Round Based',
  'Sandbox',
  'Character Progression',
  'Skill Tree',
  'Level System',
  'Equipment System',
  'Boss Battles',
  'Quest System',
  'Trading System',
  'Guilds / Clans',
  'Player Economy',
  'Chat System',
  'Leaderboards',
  'Private Servers',
  'Ranked',
  'Party System',
  'Matchmaking',
  'Public Servers',
  'Gamepasses',
  'Microtransactions',
  'Pay to Win Elements',
  'Cosmetic Shop',
  'PC Support',
  'Mobile Support',
  'Console Support',
  'Cross-platform Play',
  'Achievements',
] as const;

export type GameFeatureName = (typeof GAME_FEATURES)[number];

export interface FeatureOption {
  id: string;
  name: string;
}
