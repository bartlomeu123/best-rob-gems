import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SEARCH_KEYWORDS = [
  "anime", "tycoon", "simulator", "horror", "rpg", "pvp", "obby", "battle",
  "adventure", "survival", "racing", "fighting", "sandbox", "tower defense",
  "roleplay", "escape", "cooking", "pet", "ninja", "zombie", "fantasy",
  "military", "school", "superhero", "dragon", "pirate", "medieval", "space",
  "mystery", "detective", "farm", "city", "war", "magic", "demon", "sword",
];

// Category keyword mapping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  anime: ["anime", "manga", "naruto", "dragon ball", "one piece", "demon slayer", "jujutsu", "bleach", "boruto", "attack on titan", "my hero", "saiyan", "chakra", "shinobi", "shonen"],
  tycoon: ["tycoon", "empire", "business", "factory", "restaurant tycoon", "mall"],
  simulator: ["simulator", "sim", "clicker", "idle", "grind"],
  horror: ["horror", "scary", "ghost", "haunted", "creepy", "fnaf", "backrooms", "slender", "jumpscare", "fear"],
  rpg: ["rpg", "quest", "dungeon", "level up", "mmorpg", "role playing"],
  pvp: ["pvp", "versus", "vs", "duel", "arena", "battleground", "combat"],
  obby: ["obby", "obstacle", "parkour", "jump", "tower of"],
  fps: ["fps", "first person shooter", "gun game", "call of", "counter"],
  fighting: ["fighting", "fight", "brawl", "martial", "boxing", "wrestling", "punch"],
  survival: ["survival", "survive", "wilderness", "apocalypse", "last stand"],
  racing: ["racing", "race", "speed", "drift", "car", "kart", "vehicle", "driving"],
  sandbox: ["sandbox", "build", "create", "craft", "block"],
  roleplay: ["roleplay", "rp", "life sim", "brookhaven", "bloxburg", "adopt"],
  adventure: ["adventure", "explore", "journey", "story", "world"],
  escape: ["escape", "escape room", "puzzle escape"],
  fantasy: ["fantasy", "wizard", "magic", "mythical", "fairy", "enchant"],
  medieval: ["medieval", "knight", "castle", "kingdom", "king", "throne"],
  ninja: ["ninja", "stealth", "assassin", "shadow"],
  zombie: ["zombie", "undead", "infection", "outbreak", "walker"],
  military: ["military", "army", "soldier", "navy", "marine", "troop"],
  "pet-game": ["pet", "adopt", "animal", "creature", "puppy", "kitten", "breed"],
  sports: ["sports", "soccer", "football", "basketball", "tennis", "baseball"],
  strategy: ["strategy", "tower defense", "td", "defend", "base defense"],
  "mini-games": ["mini game", "minigame", "party game", "challenge"],
  shooter: ["shooter", "shoot", "gun", "weapon", "sniper", "rifle"],
  economy: ["economy", "trade", "trading", "market", "shop", "store", "merchant"],
  "sci-fi": ["sci-fi", "scifi", "space", "alien", "galaxy", "robot", "mech", "cyber", "futuristic"],
  social: ["social", "hangout", "chat", "club", "dance", "fashion"],
  monster: ["monster", "beast", "kaiju", "titan"],
};

// Tag keywords — broader set
const TAG_KEYWORDS: Record<string, string[]> = {
  multiplayer: ["multiplayer", "co-op", "coop", "team", "online", "friends"],
  singleplayer: ["singleplayer", "single player", "solo"],
  "open-world": ["open world", "open-world", "free roam", "explore"],
  competitive: ["competitive", "ranked", "leaderboard", "tournament"],
  casual: ["casual", "relaxing", "chill", "easy"],
  action: ["action", "combat", "fight", "battle", "attack"],
  puzzle: ["puzzle", "solve", "brain", "riddle", "mystery"],
  building: ["build", "building", "construct", "create"],
  trading: ["trade", "trading", "market", "exchange"],
  "boss-battles": ["boss", "boss battle", "boss fight", "raid"],
  "story-driven": ["story", "narrative", "lore", "cinematic", "campaign"],
  anime: ["anime", "manga", "naruto", "one piece"],
  horror: ["horror", "scary", "creepy", "ghost"],
  pvp: ["pvp", "player vs", "versus", "duel"],
  simulator: ["simulator", "sim", "idle", "clicker"],
  tycoon: ["tycoon", "business", "empire"],
  obby: ["obby", "obstacle", "parkour"],
  roleplay: ["roleplay", "rp", "life sim"],
  survival: ["survival", "survive"],
  fantasy: ["fantasy", "magic", "wizard"],
  "tower-defense": ["tower defense", "td", "defend"],
  pets: ["pet", "adopt", "animal"],
  fighting: ["fighting", "brawl", "martial"],
  racing: ["racing", "race", "drift", "car"],
  military: ["military", "army", "war"],
  space: ["space", "galaxy", "alien"],
  medieval: ["medieval", "knight", "castle"],
  zombie: ["zombie", "undead", "infection"],
};

function detectCategory(name: string, description?: string): string {
  const text = `${name} ${description || ""}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return cat;
    }
  }
  return "casual";
}

function detectTags(name: string, description?: string): string[] {
  const text = `${name} ${description || ""}`.toLowerCase();
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        tags.push(tag);
        break;
      }
    }
  }
  return tags.slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get ALL existing roblox_game_ids to skip duplicates
    const existingIds = new Set<number>();
    let offset = 0;
    while (true) {
      const { data: batch } = await supabase
        .from("games")
        .select("roblox_game_id")
        .not("roblox_game_id", "is", null)
        .range(offset, offset + 999);
      if (!batch || batch.length === 0) break;
      for (const r of batch) existingIds.add(Number(r.roblox_game_id));
      if (batch.length < 1000) break;
      offset += 1000;
    }

    const TARGET = 50;
    const candidates = new Map<number, { name: string; rootPlaceId: number; description?: string }>();

    const addCandidates = (games: any[]) => {
      for (const game of games) {
        const uid = game.universeId;
        const pid = game.rootPlaceId || game.placeId || 0;
        if (uid && game.name && !candidates.has(uid) && !existingIds.has(uid) && !existingIds.has(pid)) {
          candidates.set(uid, { name: game.name, rootPlaceId: pid, description: game.description });
        }
      }
    };

    // 1. Fetch from multiple sort tokens
    try {
      const sortsRes = await fetch("https://games.roblox.com/v1/games/sorts?GameSortsContext=HomeSorts");
      if (sortsRes.ok) {
        const sortsData = await sortsRes.json();
        for (const sort of sortsData.sorts || []) {
          if (!sort.token) continue;
          for (let startRow = 0; startRow < 200 && candidates.size < TARGET * 3; startRow += 50) {
            try {
              const listRes = await fetch(
                `https://games.roblox.com/v1/games/list?sortToken=${sort.token}&startRows=${startRow}&maxRows=50`
              );
              if (listRes.ok) {
                const listData = await listRes.json();
                addCandidates(listData.games || []);
                if (!listData.games || listData.games.length < 50) break;
              } else break;
            } catch { break; }
          }
        }
      }
    } catch { /* ignore */ }

    // 2. Keyword-based search discovery
    for (const keyword of SEARCH_KEYWORDS) {
      if (candidates.size >= TARGET * 3) break;
      try {
        const searchRes = await fetch(
          `https://games.roblox.com/v1/games/list?keyword=${encodeURIComponent(keyword)}&startRows=0&maxRows=50`
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          addCandidates(searchData.games || []);
        }
      } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, 100));
    }

    // 3. Rolimons API
    try {
      const roliRes = await fetch("https://api.rolimons.com/games/v1/gamelist");
      if (roliRes.ok) {
        const roliData = await roliRes.json();
        if (roliData.success && roliData.games) {
          const entries = Object.entries(roliData.games) as [string, any[]][];
          const sorted = entries.filter(([_, vals]) => vals && vals[0]).sort((a, b) => (b[1][1] || 0) - (a[1][1] || 0));
          for (const [placeId, vals] of sorted) {
            const numId = Number(placeId);
            if (!candidates.has(numId) && !existingIds.has(numId)) {
              candidates.set(numId, { name: vals[0] as string, rootPlaceId: numId });
            }
            if (candidates.size >= TARGET * 3) break;
          }
        }
      }
    } catch { /* ignore */ }

    // 4. Incremental universe ID discovery
    if (candidates.size < TARGET) {
      const { data: maxRow } = await supabase
        .from("games")
        .select("roblox_game_id")
        .not("roblox_game_id", "is", null)
        .order("roblox_game_id", { ascending: false })
        .limit(1);

      let startId = maxRow?.[0]?.roblox_game_id ? Number(maxRow[0].roblox_game_id) + 1 : 5000000000;

      for (let attempt = 0; attempt < 5 && candidates.size < TARGET * 2; attempt++) {
        const batchIds = Array.from({ length: 50 }, (_, i) => startId + i + attempt * 50);
        try {
          const idsParam = batchIds.join(",");
          const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${idsParam}`);
          if (res.ok) {
            const data = await res.json();
            for (const game of data.data || []) {
              if (game.id && game.name && game.rootPlaceId) {
                if (!existingIds.has(game.id) && !existingIds.has(game.rootPlaceId) && !candidates.has(game.id)) {
                  candidates.set(game.id, { name: game.name, rootPlaceId: game.rootPlaceId, description: game.description });
                }
              }
            }
          }
        } catch { /* ignore */ }
      }
    }

    // Take up to TARGET new games
    const newGames: { universeId: number; name: string; rootPlaceId: number; description?: string }[] = [];
    for (const [uid, info] of candidates) {
      newGames.push({ universeId: uid, name: info.name, rootPlaceId: info.rootPlaceId, description: info.description });
      if (newGames.length >= TARGET) break;
    }

    // Fetch thumbnails
    const thumbMap: Record<number, string> = {};
    const placeIds = newGames.map(g => g.rootPlaceId).filter(Boolean);
    for (let i = 0; i < placeIds.length; i += 50) {
      const batch = placeIds.slice(i, i + 50).join(",");
      try {
        const thumbRes = await fetch(
          `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${batch}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
        );
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          for (const item of thumbData.data || []) {
            if (item.state === "Completed" && item.imageUrl) {
              thumbMap[item.targetId] = item.imageUrl;
            }
          }
        }
      } catch { /* ignore */ }
    }

    let inserted = 0;
    for (const game of newGames) {
      const slug = game.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 80);

      const { data: slugCheck } = await supabase
        .from("games")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const finalSlug = slugCheck ? `${slug}-${game.rootPlaceId || game.universeId}` : slug;
      const gameId = game.rootPlaceId || game.universeId;

      // Smart category & tag detection
      const category = detectCategory(game.name, game.description);
      const tags = detectTags(game.name, game.description);

      const { error } = await supabase.from("games").insert({
        title: game.name,
        slug: finalSlug,
        image: thumbMap[game.rootPlaceId] || null,
        description: game.description || `Play ${game.name} on Roblox!`,
        category,
        tags,
        roblox_link: `https://www.roblox.com/games/${gameId}`,
        status: "approved",
        roblox_game_id: gameId,
        submitter_type: "regular",
      });

      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        message: `Found ${candidates.size} candidates, inserted ${inserted} new games`,
        inserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
