import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

async function authenticateToken(request: Request) {
  const auth  = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !token.startsWith("ss_")) return null;
  const hash  = createHash("sha256").update(token).digest("hex");
  const admin = createServiceRoleClient();
  const { data } = await admin.from("sync_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", hash).single() as { data: { id:string; user_id:string; revoked_at:string|null }|null; error:unknown };
  if (!data || data.revoked_at) return null;
  return { userId: data.user_id, keyId: data.id };
}

export async function POST(request: Request) {
  const auth = await authenticateToken(request);
  if (!auth) return NextResponse.json({ error:"Invalid token" }, { status:401 });

  const body = await request.json().catch(() => null);
  const { postId, url, frameUrl } = body ?? {};
  if (!postId || !url) return NextResponse.json({ error:"postId and url required" }, { status:422 });

  const admin = createServiceRoleClient();
  const { error } = await admin.from("saved_reels").upsert({
    post_id: postId, url, frame_url: frameUrl ?? null,
    frame_status: frameUrl ? "ok" : "pending", user_id: auth.userId,
  }, { onConflict:"user_id,post_id" });

  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ ok:true });
}

export async function OPTIONS() {
  return new Response(null, { status:204 });
}
