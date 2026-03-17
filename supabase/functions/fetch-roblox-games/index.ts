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
    const candidates = new Map<number, { name: string; rootPlaceId: number }>();

    // Helper to add candidates from a game list
    const addCandidates = (games: any[]) => {
      for (const game of games) {
        const uid = game.universeId;
        const pid = game.rootPlaceId || game.placeId || 0;
        if (uid && game.name && !candidates.has(uid) && !existingIds.has(uid) && !existingIds.has(pid)) {
          candidates.set(uid, { name: game.name, rootPlaceId: pid });
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
          // Paginate through each sort
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
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    // 3. Rolimons API as supplementary source
    try {
      const roliRes = await fetch("https://api.rolimons.com/games/v1/gamelist");
      if (roliRes.ok) {
        const roliData = await roliRes.json();
        if (roliData.success && roliData.games) {
          const entries = Object.entries(roliData.games) as [string, any[]][];
          const sorted = entries
            .filter(([_, vals]) => vals && vals[0])
            .sort((a, b) => (b[1][1] || 0) - (a[1][1] || 0));
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

    // 4. Incremental universe ID discovery - try from a high known ID
    if (candidates.size < TARGET) {
      // Get the highest known roblox_game_id
      const { data: maxRow } = await supabase
        .from("games")
        .select("roblox_game_id")
        .not("roblox_game_id", "is", null)
        .order("roblox_game_id", { ascending: false })
        .limit(1);
      
      let startId = maxRow?.[0]?.roblox_game_id ? Number(maxRow[0].roblox_game_id) + 1 : 5000000000;
      
      // Try batches of universe IDs
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
                  candidates.set(game.id, { name: game.name, rootPlaceId: game.rootPlaceId });
                }
              }
            }
          }
        } catch { /* ignore */ }
      }
    }

    // Take up to TARGET new games
    const newGames: { universeId: number; name: string; rootPlaceId: number }[] = [];
    for (const [uid, info] of candidates) {
      newGames.push({ universeId: uid, name: info.name, rootPlaceId: info.rootPlaceId });
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

      const { error } = await supabase.from("games").insert({
        title: game.name,
        slug: finalSlug,
        image: thumbMap[game.rootPlaceId] || null,
        description: `Play ${game.name} on Roblox!`,
        category: "casual",
        tags: [],
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
