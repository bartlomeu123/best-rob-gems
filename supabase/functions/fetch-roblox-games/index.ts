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

    // Use Rolimons game list API which provides popular Roblox games
    const roliRes = await fetch("https://api.rolimons.com/games/v1/gamelist");
    if (!roliRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from Rolimons API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roliData = await roliRes.json();
    if (!roliData.success || !roliData.games) {
      return new Response(
        JSON.stringify({ error: "Invalid response from Rolimons" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // roliData.games is an object: { placeId: [name, playerCount?, iconUrl?] }
    // Sort by player count (index 1) descending and take top 50
    const gameEntries = Object.entries(roliData.games) as [string, any[]][];
    const sorted = gameEntries
      .filter(([_, vals]) => vals && vals[0])
      .sort((a, b) => (b[1][1] || 0) - (a[1][1] || 0))
      .slice(0, 50);

    // Get existing roblox_game_ids
    const { data: existing } = await supabase
      .from("games")
      .select("roblox_game_id")
      .not("roblox_game_id", "is", null);

    const existingIds = new Set(
      (existing || []).map((r: any) => Number(r.roblox_game_id))
    );

    // Collect place IDs for thumbnail fetch
    const placeIds = sorted.map(([pid]) => pid);
    
    // Fetch thumbnails using Roblox thumbnails API (by place IDs)
    const thumbMap: Record<string, string> = {};
    // The rolimons data may include icon URLs at index 2
    for (const [pid, vals] of sorted) {
      if (vals[2]) {
        thumbMap[pid] = vals[2];
      }
    }

    // If rolimons doesn't have icons, try Roblox thumbnails API
    const missingThumbIds = placeIds.filter((pid) => !thumbMap[pid]);
    if (missingThumbIds.length > 0) {
      // Batch in groups of 50
      for (let i = 0; i < missingThumbIds.length; i += 50) {
        const batch = missingThumbIds.slice(i, i + 50).join(",");
        try {
          const thumbRes = await fetch(
            `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${batch}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
          );
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            for (const item of thumbData.data || []) {
              if (item.state === "Completed" && item.imageUrl) {
                thumbMap[String(item.targetId)] = item.imageUrl;
              }
            }
          }
        } catch {
          // ignore thumbnail errors
        }
      }
    }

    let inserted = 0;
    for (const [placeId, vals] of sorted) {
      const numericId = Number(placeId);
      if (existingIds.has(numericId)) continue;

      const name = vals[0] as string;
      const slug = name
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

      const finalSlug = slugCheck ? `${slug}-${placeId}` : slug;

      const { error } = await supabase.from("games").insert({
        title: name,
        slug: finalSlug,
        image: thumbMap[placeId] || null,
        description: `Play ${name} on Roblox!`,
        category: "Casual",
        tags: [],
        roblox_link: `https://www.roblox.com/games/${placeId}`,
        status: "approved",
        roblox_game_id: numericId,
        submitter_type: "regular",
      });

      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        message: `Fetched ${sorted.length} games, inserted ${inserted} new games`,
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
