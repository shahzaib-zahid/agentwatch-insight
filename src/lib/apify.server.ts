// Server-only Apify ingestion helpers. Calls run through the Lovable connector gateway.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PLATFORMS, profileUrl, type ContentType, type Platform } from "@/lib/platforms";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/apify";

type Json = Record<string, unknown>;

function gatewayHeaders() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const apifyKey = process.env["APIFY_API_KEY"];
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!apifyKey) throw new Error("APIFY_API_KEY is not configured");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": apifyKey,
    "Content-Type": "application/json",
  };
}

async function runActorSync(actorId: string, input: Json, limit: number): Promise<Json[]> {
  const res = await fetch(
    `${GATEWAY_URL}/acts/${actorId}/run-sync-get-dataset-items?limit=${limit}&timeout=120`,
    { method: "POST", headers: gatewayHeaders(), body: JSON.stringify(input) },
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`[apify] ${actorId} failed [${res.status}]: ${body}`);
    throw new Error(`Apify run failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as Json[]) : [];
}

function actorInput(platform: Platform, url: string, handle: string, limit: number): Json {
  const h = handle.replace(/^@/, "");
  switch (platform) {
    case "youtube":
      return { startUrls: [{ url }], maxResults: limit, maxResultsShorts: limit };
    case "facebook":
      return { startUrls: [{ url }], resultsLimit: limit };
    case "instagram":
      return { directUrls: [url], resultsType: "posts", resultsLimit: limit };
    case "x":
      return { twitterHandles: [h], maxItems: limit, sort: "Top" };
    case "reddit":
      return { startUrls: [{ url }], maxItems: limit, type: "posts" };
    case "tiktok":
      return { profiles: [h], resultsPerPage: limit };
  }
}

function num(...vals: unknown[]): number {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.round(v));
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
      return Math.max(0, Math.round(Number(v)));
    }
  }
  return 0;
}

function str(...vals: unknown[]): string | null {
  for (const v of vals) if (typeof v === "string" && v.trim() !== "") return v;
  return null;
}

function defaultFormat(platform: Platform, item: Json): ContentType {
  if (platform === "youtube") return item["isShort"] ? "short" : "video";
  if (platform === "instagram") {
    const t = String(item["type"] ?? "").toLowerCase();
    if (t.includes("video") || t.includes("reel")) return "reel";
    if (t.includes("sidecar") || t.includes("carousel")) return "carousel";
    return "post";
  }
  if (platform === "tiktok") return "reel";
  if (platform === "x") return "thread";
  return "post";
}

export type NormalizedPost = {
  post_url: string;
  content_type: ContentType;
  caption_text: string | null;
  posted_at: string;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

function normalize(platform: Platform, item: Json): NormalizedPost | null {
  const post_url = str(item["url"], item["postUrl"], item["webVideoUrl"], item["twitterUrl"], item["link"]);
  if (!post_url) return null;
  const rawDate = str(item["date"], item["createdAt"], item["timestamp"], item["publishedAt"], item["createTimeISO"]);
  const parsed = rawDate ? new Date(rawDate) : new Date();
  return {
    post_url,
    content_type: defaultFormat(platform, item),
    caption_text: str(item["text"], item["caption"], item["title"], item["fullText"], item["body"]),
    posted_at: Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
    thumbnail_url: str(item["thumbnailUrl"], item["displayUrl"], item["thumbnail"], item["coverUrl"]),
    views: num(item["viewCount"], item["playCount"], item["views"], item["videoViewCount"]),
    likes: num(item["likes"], item["likeCount"], item["likesCount"], item["diggCount"], item["upVotes"]),
    comments: num(item["comments"], item["commentCount"], item["commentsCount"], item["numberOfComments"]),
    shares: num(item["shares"], item["shareCount"], item["reshareCount"], item["retweetCount"]),
    saves: num(item["collectCount"], item["saves"], item["bookmarkCount"]),
  };
}

export async function ingestPlatform(platform: Platform, limit = 15) {
  const meta = PLATFORMS.find((p) => p.id === platform);
  if (!meta) throw new Error(`Unknown platform: ${platform}`);

  const { data: competitors, error } = await supabaseAdmin
    .from("competitors")
    .select("id, handle, profile_url, platform, active")
    .eq("platform", platform)
    .eq("active", true);
  if (error) throw error;

  let totalItems = 0;
  const failures: string[] = [];

  for (const c of competitors ?? []) {
    const url = c.profile_url ?? profileUrl(platform, c.handle);
    const started = new Date().toISOString();
    try {
      const items = await runActorSync(meta.actor, actorInput(platform, url, c.handle, limit), limit);
      const posts = items.map((i) => normalize(platform, i)).filter((p): p is NormalizedPost => !!p);

      for (const p of posts) {
        const { data: existing } = await supabaseAdmin
          .from("posts")
          .select("id")
          .eq("post_url", p.post_url)
          .maybeSingle();

        let postId = existing?.id;
        if (!postId) {
          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("posts")
            .insert({
              competitor_id: c.id,
              platform,
              post_url: p.post_url,
              content_type: p.content_type,
              caption_text: p.caption_text,
              posted_at: p.posted_at,
              thumbnail_url: p.thumbnail_url,
              pulled_at: new Date().toISOString(),
            })
            .select("id")
            .single();
          if (insErr) throw insErr;
          postId = inserted.id;
        } else {
          await supabaseAdmin
            .from("posts")
            .update({ pulled_at: new Date().toISOString(), caption_text: p.caption_text })
            .eq("id", postId);
        }

        const denom = p.views > 0 ? p.views : Math.max(1, p.likes + p.comments + p.shares + p.saves);
        const engagement = ((p.likes + p.comments + p.shares + p.saves) / denom) * 100;

        await supabaseAdmin.from("metrics").upsert(
          {
            post_id: postId,
            views: p.views,
            likes: p.likes,
            comments: p.comments,
            shares: p.shares,
            saves: p.saves,
            engagement_rate: Number(Math.min(100, engagement).toFixed(2)),
            last_updated: new Date().toISOString(),
          },
          { onConflict: "post_id" },
        );
      }

      totalItems += posts.length;
      await supabaseAdmin.from("ingestion_runs").insert({
        platform,
        actor_id: meta.actor,
        competitor_id: c.id,
        items_returned: posts.length,
        status: posts.length > 0 ? "success" : "empty",
        message: posts.length > 0 ? `Pulled ${posts.length} posts from ${url}` : `No items returned for ${url}`,
        started_at: started,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failures.push(`${c.handle}: ${message}`);
      await supabaseAdmin.from("ingestion_runs").insert({
        platform,
        actor_id: meta.actor,
        competitor_id: c.id,
        items_returned: 0,
        status: "failed",
        message: message.slice(0, 400),
        started_at: started,
      });
    }
  }

  const status = failures.length && totalItems === 0 ? "failed" : totalItems > 0 ? "success" : "empty";
  await supabaseAdmin.from("platform_configs").upsert(
    {
      platform,
      actor_id: meta.actor,
      last_run_status: status,
      ...(status === "success" ? { last_success_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "platform" },
  );

  return {
    platform,
    competitors: competitors?.length ?? 0,
    items: totalItems,
    status,
    failures,
  };
}
