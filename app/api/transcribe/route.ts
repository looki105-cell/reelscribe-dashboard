import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

const ALLOWED_ORIGINS = [
  "chrome-extension://",  // any extension origin prefix
];

function corsHeaders(origin: string | null) {
  // Allow extension origins and the dashboard
  const allowed =
    !origin ||
    origin.startsWith("chrome-extension://") ||
    origin === process.env.NEXT_PUBLIC_SITE_URL;
  return {
    "Access-Control-Allow-Origin": allowed ? (origin ?? "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function authenticateToken(request: Request) {
  const auth  = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token || !token.startsWith("ss_") || token.length > 200) return null;
  const hash  = createHash("sha256").update(token).digest("hex");
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("sync_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", hash)
    .single() as { data: { id:string; user_id:string; revoked_at:string|null }|null; error:unknown };
  if (!data || data.revoked_at) return null;
  return { userId: data.user_id, keyId: data.id };
}

async function fetchThumbnail(url: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!r.ok) return null;
    const data = await r.json();
    return data.thumbnail_url ?? null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  const auth = await authenticateToken(request);
  if (!auth) return NextResponse.json({ error:"Invalid token" }, { status:401, headers });

  // 5 transcriptions per minute per user
  if (!rateLimit(`transcribe:${auth.userId}`, 5, 60_000)) {
    return rateLimitResponse();
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error:"Invalid JSON" }, { status:400, headers });

  const { postId, url, markdown, wordCount } = body;

  // Input validation
  if (typeof postId !== "string" || postId.length > 200) return NextResponse.json({ error:"Invalid postId" }, { status:422, headers });
  if (typeof url !== "string" || !/instagram\.com\/(reel|reels?|p)\//.test(url)) return NextResponse.json({ error:"Invalid Instagram URL" }, { status:422, headers });
  if (markdown && typeof markdown !== "string") return NextResponse.json({ error:"Invalid markdown" }, { status:422, headers });
  if (markdown && markdown.length > 500_000) return NextResponse.json({ error:"Transcript too large" }, { status:422, headers });

  const thumbnailUrl = await fetchThumbnail(url);
  const admin = createServiceRoleClient();

  const { error } = await admin.from("saved_reels").upsert({
    post_id: postId, url,
    transcript: markdown ?? null,
    word_count: typeof wordCount === "number" ? wordCount : 0,
    thumbnail_url: thumbnailUrl,
    frame_status: thumbnailUrl ? "ok" : "pending",
    user_id: auth.userId,
  }, { onConflict:"user_id,post_id" });

  if (error) return NextResponse.json({ error: error.message }, { status:500, headers });
  return NextResponse.json({ ok:true, thumbnailUrl }, { headers });
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new Response(null, { status:204, headers: corsHeaders(origin) });
}
