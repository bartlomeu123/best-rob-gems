import { Game, Comment, Category } from './types';

export const categories: Category[] = [
  { name: 'Anime', slug: 'anime', icon: '⚔️', count: 45 },
  { name: 'Horror', slug: 'horror', icon: '👻', count: 32 },
  { name: 'Simulator', slug: 'simulator', icon: '🎮', count: 67 },
  { name: 'Tycoon', slug: 'tycoon', icon: '🏭', count: 41 },
  { name: 'Adventure', slug: 'adventure', icon: '🗺️', count: 53 },
  { name: 'PvP', slug: 'pvp', icon: '⚡', count: 38 },
  { name: 'RPG', slug: 'rpg', icon: '🛡️', count: 29 },
  { name: 'Obby', slug: 'obby', icon: '🏃', count: 44 },
];

export const games: Game[] = [
  {
    id: '1', slug: 'blox-fruits', title: 'Blox Fruits', image: '',
    description: 'Blox Fruits is an action-adventure game where players can obtain powerful fruits that grant special abilities. Explore vast seas, fight enemies, and become the strongest pirate or marine!',
    category: 'anime', tags: ['Anime', 'PvP', 'Adventure', 'Grinding', 'Multiplayer'],
    likes: 9200, dislikes: 1800, robloxLink: 'https://www.roblox.com/games/2753915549',
    createdAt: '2024-01-15', submittedBy: 'admin', status: 'approved', votesLast24h: 342, rankChange: 0,
  },
  {
    id: '2', slug: 'adopt-me', title: 'Adopt Me!', image: '',
    description: 'Adopt Me! is a massively popular role-playing game where players can adopt and raise virtual pets, decorate homes, and explore a colorful world with friends.',
    category: 'simulator', tags: ['Pets', 'Trading', 'Family', 'Casual'],
    likes: 8500, dislikes: 2500, robloxLink: 'https://www.roblox.com/games/920587163',
    createdAt: '2024-01-10', submittedBy: 'admin', status: 'approved', votesLast24h: 289, rankChange: 2,
  },
  {
    id: '3', slug: 'brookhaven', title: 'Brookhaven 🏡RP', image: '',
    description: 'Brookhaven is a town and city role-playing game where players can own houses, drive vehicles, and live out their virtual lives in an expansive open world.',
    category: 'adventure', tags: ['Roleplay', 'Open World', 'Casual', 'Social'],
    likes: 7800, dislikes: 2200, robloxLink: 'https://www.roblox.com/games/4924922222',
    createdAt: '2024-02-01', submittedBy: 'admin', status: 'approved', votesLast24h: 412, rankChange: 3,
  },
  {
    id: '4', slug: 'murder-mystery-2', title: 'Murder Mystery 2', image: '',
    description: 'Murder Mystery 2 is a thrilling game of deception where players take on roles of innocents, a sheriff, or a murderer. Can you solve the mystery before it\'s too late?',
    category: 'horror', tags: ['Mystery', 'PvP', 'Social', 'Trading'],
    likes: 6500, dislikes: 1500, robloxLink: 'https://www.roblox.com/games/142823291',
    createdAt: '2024-01-20', submittedBy: 'admin', status: 'approved', votesLast24h: 198, rankChange: -1,
  },
  {
    id: '5', slug: 'king-legacy', title: 'King Legacy', image: '',
    description: 'King Legacy is an anime-inspired adventure game where players eat devil fruits, master powerful abilities, and explore the vast ocean to become the King of Pirates.',
    category: 'anime', tags: ['Anime', 'Adventure', 'PvP', 'Grinding'],
    likes: 5800, dislikes: 1200, robloxLink: 'https://www.roblox.com/games/3526622498',
    createdAt: '2024-03-05', submittedBy: 'admin', status: 'approved', votesLast24h: 267, rankChange: 5,
  },
  {
    id: '6', slug: 'tower-of-hell', title: 'Tower of Hell', image: '',
    description: 'Tower of Hell is an obby game where players race to the top of a randomly generated tower with no checkpoints. Speed, skill, and patience are your best friends.',
    category: 'obby', tags: ['Obby', 'Competitive', 'Multiplayer', 'Skill'],
    likes: 5200, dislikes: 800, robloxLink: 'https://www.roblox.com/games/1962086868',
    createdAt: '2024-02-15', submittedBy: 'admin', status: 'approved', votesLast24h: 156, rankChange: 1,
  },
  {
    id: '7', slug: 'arsenal', title: 'Arsenal', image: '',
    description: 'Arsenal is a fast-paced first-person shooter where players cycle through weapons with each elimination. The first player to get a kill with every weapon wins!',
    category: 'pvp', tags: ['FPS', 'PvP', 'Competitive', 'Action'],
    likes: 4900, dislikes: 1100, robloxLink: 'https://www.roblox.com/games/286090429',
    createdAt: '2024-01-25', submittedBy: 'admin', status: 'approved', votesLast24h: 178, rankChange: -2,
  },
  {
    id: '8', slug: 'pet-simulator-x', title: 'Pet Simulator X', image: '',
    description: 'Pet Simulator X is a collecting game where players hatch eggs, collect pets, and explore various worlds. Trade with other players and discover the rarest pets!',
    category: 'simulator', tags: ['Pets', 'Trading', 'Grinding', 'Casual'],
    likes: 4500, dislikes: 1500, robloxLink: 'https://www.roblox.com/games/6284583030',
    createdAt: '2024-02-20', submittedBy: 'admin', status: 'approved', votesLast24h: 523, rankChange: 8,
  },
  {
    id: '9', slug: 'doors', title: 'DOORS', image: '',
    description: 'DOORS is a horror game where players must navigate through rooms, each hiding terrifying entities. Work together or alone to survive and reach the final door.',
    category: 'horror', tags: ['Horror', 'Co-op', 'Puzzle', 'Survival'],
    likes: 6100, dislikes: 900, robloxLink: 'https://www.roblox.com/games/6516141723',
    createdAt: '2024-03-01', submittedBy: 'admin', status: 'approved', votesLast24h: 445, rankChange: 6,
  },
  {
    id: '10', slug: 'bee-swarm-simulator', title: 'Bee Swarm Simulator', image: '',
    description: 'Bee Swarm Simulator lets you grow your own swarm of bees, collect pollen, and make honey. Discover rare bees and challenge tough bosses!',
    category: 'simulator', tags: ['Simulator', 'Grinding', 'Casual', 'Pets'],
    likes: 4200, dislikes: 600, robloxLink: 'https://www.roblox.com/games/1537690962',
    createdAt: '2024-02-10', submittedBy: 'admin', status: 'approved', votesLast24h: 134, rankChange: 0,
  },
  {
    id: '11', slug: 'jailbreak', title: 'Jailbreak', image: '',
    description: 'Jailbreak is an open-world action game where you can be a criminal breaking out of prison or a cop trying to stop them. Rob banks, drive vehicles, and more!',
    category: 'adventure', tags: ['Open World', 'PvP', 'Action', 'Vehicles'],
    likes: 5500, dislikes: 1500, robloxLink: 'https://www.roblox.com/games/606849621',
    createdAt: '2024-01-05', submittedBy: 'admin', status: 'approved', votesLast24h: 201, rankChange: -1,
  },
  {
    id: '12', slug: 'anime-defenders', title: 'Anime Defenders', image: '',
    description: 'Anime Defenders is a tower defense game featuring characters from popular anime. Strategically place units to defend against waves of enemies!',
    category: 'anime', tags: ['Anime', 'Tower Defense', 'Strategy', 'Multiplayer'],
    likes: 3800, dislikes: 400, robloxLink: 'https://www.roblox.com/games/17221860204',
    createdAt: '2024-03-10', submittedBy: 'user1', status: 'approved', votesLast24h: 678, rankChange: 12,
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1', gameId: '1', userId: 'u1', username: 'PirateKing99', avatar: '',
    text: 'Been playing this for months and the updates keep getting better. The new sea is amazing!',
    likes: 45, pros: ['Fun gameplay', 'Frequent updates', 'Good progression'], cons: ['Too much grinding'],
    createdAt: '2024-03-10', replies: [
      {
        id: 'c1r1', gameId: '1', userId: 'u2', username: 'FruitHunter', avatar: '',
        text: 'Totally agree! The new fruits are so cool.', likes: 12,
        pros: [], cons: [], createdAt: '2024-03-10', replies: [],
      }
    ],
  },
  {
    id: 'c2', gameId: '1', userId: 'u3', username: 'CasualGamer42', avatar: '',
    text: 'Fun game but the grinding to get good fruits is insane. Wish it was more balanced.',
    likes: 23, pros: ['Fun gameplay', 'Active community'], cons: ['Too much grinding', 'Pay to win'],
    createdAt: '2024-03-09', replies: [],
  },
  {
    id: 'c3', gameId: '1', userId: 'u4', username: 'AnimeFan2024', avatar: '',
    text: 'Best anime game on Roblox hands down. The combat system is really satisfying.',
    likes: 67, pros: ['Fun gameplay', 'Good graphics', 'Active community', 'Frequent updates'], cons: [],
    createdAt: '2024-03-08', replies: [],
  },
];

export function getGameBySlug(slug: string): Game | undefined {
  return games.find(g => g.slug === slug);
}

export function getGamesByCategory(category: string): Game[] {
  return games.filter(g => g.category === category && g.status === 'approved');
}

export function getGamesByTag(tag: string): Game[] {
  return games.filter(g => g.tags.some(t => t.toLowerCase() === tag.toLowerCase()) && g.status === 'approved');
}

export function getTopGames(): Game[] {
  return [...games].filter(g => g.status === 'approved').sort((a, b) => {
    const scoreA = a.likes / (a.likes + a.dislikes);
    const scoreB = b.likes / (b.likes + b.dislikes);
    return scoreB - scoreA;
  });
}

export function getTrendingGames(): Game[] {
  return [...games].filter(g => g.status === 'approved').sort((a, b) => b.votesLast24h - a.votesLast24h);
}

export function getRisingGames(): Game[] {
  return [...games].filter(g => g.status === 'approved' && g.rankChange > 0).sort((a, b) => b.rankChange - a.rankChange);
}

export function getNewGames(): Game[] {
  return [...games].filter(g => g.status === 'approved').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSimilarGames(game: Game): Game[] {
  return games
    .filter(g => g.id !== game.id && g.status === 'approved')
    .map(g => ({
      game: g,
      score: g.tags.filter(t => game.tags.includes(t)).length * 2 + (g.category === game.category ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(g => g.game);
}

export function getRandomGame(): Game {
  const approved = games.filter(g => g.status === 'approved');
  return approved[Math.floor(Math.random() * approved.length)];
}

export function searchGames(query: string): Game[] {
  const q = query.toLowerCase();
  return games.filter(g =>
    g.status === 'approved' && (
      g.title.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q)) ||
      g.category.toLowerCase().includes(q)
    )
  );
}
