import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    let updated = 0;
    let offset = 0;

    while (true) {
      const { data: games } = await supabase
        .from("games")
        .select("id, title, description, category, tags")
        .range(offset, offset + 499);

      if (!games || games.length === 0) break;

      for (const game of games) {
        const newCategory = detectCategory(game.title, game.description);
        const newTags = detectTags(game.title, game.description);

        // Only update if something changed
        const tagsChanged = JSON.stringify((game.tags || []).sort()) !== JSON.stringify(newTags.sort());
        const catChanged = game.category !== newCategory;

        if (catChanged || tagsChanged) {
          const { error } = await supabase
            .from("games")
            .update({ category: newCategory, tags: newTags })
            .eq("id", game.id);
          if (!error) updated++;
        }
      }

      if (games.length < 500) break;
      offset += 500;
    }

    return new Response(
      JSON.stringify({ message: `Re-tagged ${updated} games`, updated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
