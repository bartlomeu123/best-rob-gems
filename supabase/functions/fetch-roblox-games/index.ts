import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get existing roblox_game_ids to skip duplicates
    const { data: existing } = await supabase
      .from("games")
      .select("roblox_game_id")
      .not("roblox_game_id", "is", null);
    const existingIds = new Set(
      (existing || []).map((r: any) => Number(r.roblox_game_id))
    );

    // Fetch games from multiple Roblox API sort endpoints to get diverse games
    const sortTokens: string[] = [];
    try {
      const sortsRes = await fetch("https://games.roblox.com/v1/games/sorts?GameSortsContext=HomeSorts");
      if (sortsRes.ok) {
        const sortsData = await sortsRes.json();
        for (const sort of (sortsData.sorts || []).slice(0, 5)) {
          if (sort.token) sortTokens.push(sort.token);
        }
      }
    } catch { /* ignore */ }

    // Collect universe IDs from multiple sort lists
    const universeSet = new Map<number, { name: string; rootPlaceId: number }>();

    for (const token of sortTokens) {
      try {
        const listRes = await fetch(
          `https://games.roblox.com/v1/games/list?sortToken=${token}&startRows=0&maxRows=25`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          for (const game of listData.games || []) {
            if (game.universeId && game.name && !universeSet.has(game.universeId)) {
              universeSet.set(game.universeId, {
                name: game.name,
                rootPlaceId: game.rootPlaceId || game.placeId || 0,
              });
            }
          }
        }
      } catch { /* ignore */ }
    }

    // Also fetch from the Rolimons API as a fallback/supplement
    try {
      const roliRes = await fetch("https://api.rolimons.com/games/v1/gamelist");
      if (roliRes.ok) {
        const roliData = await roliRes.json();
        if (roliData.success && roliData.games) {
          const entries = Object.entries(roliData.games) as [string, any[]][];
          const sorted = entries
            .filter(([_, vals]) => vals && vals[0])
            .sort((a, b) => (b[1][1] || 0) - (a[1][1] || 0))
            .slice(0, 30);
          for (const [placeId, vals] of sorted) {
            const numId = Number(placeId);
            if (!universeSet.has(numId)) {
              universeSet.set(numId, { name: vals[0] as string, rootPlaceId: numId });
            }
          }
        }
      }
    } catch { /* ignore */ }

    // Filter out already-existing games and take up to 50 new ones
    const newGames: { universeId: number; name: string; rootPlaceId: number }[] = [];
    for (const [uid, info] of universeSet) {
      if (!existingIds.has(uid) && !existingIds.has(info.rootPlaceId)) {
        newGames.push({ universeId: uid, name: info.name, rootPlaceId: info.rootPlaceId });
      }
      if (newGames.length >= 50) break;
    }

    // Fetch thumbnails for the place IDs
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
        category: "Casual",
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
        message: `Found ${universeSet.size} total games, ${newGames.length} new candidates, inserted ${inserted}`,
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
