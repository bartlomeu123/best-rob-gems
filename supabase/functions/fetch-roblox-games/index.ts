import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RobloxGame {
  universeId: number;
  name: string;
  rootPlaceId: number;
  gameDescription?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch popular games from Roblox Charts API
    const chartsRes = await fetch(
      "https://games.roblox.com/v1/games/list?sortToken=&sortOrder=Desc&limit=50"
    );

    let gamesList: RobloxGame[] = [];

    if (!chartsRes.ok) {
      // Fallback: use the sorts endpoint to get a valid sort token
      const sortsRes = await fetch("https://games.roblox.com/v1/games/sorts?GameSortsContext=HomeSorts");
      if (sortsRes.ok) {
        const sortsData = await sortsRes.json();
        const popularSort = sortsData.sorts?.find((s: any) =>
          s.name === "Most Popular" || s.displayName === "Most Popular"
        );
        if (popularSort) {
          const listRes = await fetch(
            `https://games.roblox.com/v1/games/list?sortToken=${popularSort.token}&limit=50`
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            gamesList = (listData.games || []).map((g: any) => ({
              universeId: g.universeId,
              name: g.name,
              rootPlaceId: g.placeId || g.rootPlaceId,
              gameDescription: g.gameDescription,
            }));
          }
        }
      }
    } else {
      const chartsData = await chartsRes.json();
      gamesList = (chartsData.games || []).map((g: any) => ({
        universeId: g.universeId,
        name: g.name,
        rootPlaceId: g.placeId || g.rootPlaceId,
        gameDescription: g.gameDescription,
      }));
    }

    if (gamesList.length === 0) {
      // Last resort: use the v1/games/multiget endpoint with known popular universe IDs
      // Or try the discover page API
      const discoverRes = await fetch(
        "https://games.roblox.com/v1/games/sorts?GameSortsContext=GamesDefaultSorts"
      );
      if (discoverRes.ok) {
        const discoverData = await discoverRes.json();
        for (const sort of (discoverData.sorts || []).slice(0, 3)) {
          const listRes = await fetch(
            `https://games.roblox.com/v1/games/list?sortToken=${sort.token}&limit=25`
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            for (const g of (listData.games || [])) {
              if (!gamesList.find((x) => x.universeId === g.universeId)) {
                gamesList.push({
                  universeId: g.universeId,
                  name: g.name,
                  rootPlaceId: g.placeId || g.rootPlaceId,
                  gameDescription: g.gameDescription,
                });
              }
            }
          }
        }
      }
    }

    if (gamesList.length === 0) {
      return new Response(
        JSON.stringify({ message: "No games fetched from Roblox API" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch thumbnails
    const universeIds = gamesList.map((g) => g.universeId).join(",");
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
    );
    const thumbMap: Record<number, string> = {};
    if (thumbRes.ok) {
      const thumbData = await thumbRes.json();
      for (const item of thumbData.data || []) {
        if (item.state === "Completed" && item.imageUrl) {
          thumbMap[item.targetId] = item.imageUrl;
        }
      }
    }

    // Get existing roblox_game_ids to skip duplicates
    const { data: existing } = await supabase
      .from("games")
      .select("roblox_game_id")
      .not("roblox_game_id", "is", null);

    const existingIds = new Set(
      (existing || []).map((r: any) => Number(r.roblox_game_id))
    );

    // Insert new games
    let inserted = 0;
    for (const game of gamesList) {
      if (existingIds.has(game.universeId)) continue;

      const slug = game.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 80);

      // Check slug collision
      const { data: slugCheck } = await supabase
        .from("games")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const finalSlug = slugCheck ? `${slug}-${game.universeId}` : slug;

      const { error } = await supabase.from("games").insert({
        title: game.name,
        slug: finalSlug,
        image: thumbMap[game.universeId] || null,
        description: game.gameDescription || `Play ${game.name} on Roblox!`,
        category: "Casual",
        tags: [],
        roblox_link: `https://www.roblox.com/games/${game.rootPlaceId}`,
        status: "approved",
        roblox_game_id: game.universeId,
        submitter_type: "regular",
      });

      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        message: `Fetched ${gamesList.length} games, inserted ${inserted} new games`,
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
