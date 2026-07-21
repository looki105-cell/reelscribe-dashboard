import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

const MAX_KEYS_PER_USER = 10;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

  // 5 key generations per hour per user
  if (!rateLimit(`sync-key:${user.id}`, 5, 60 * 60_000)) {
    return rateLimitResponse();
  }

  const admin = createServiceRoleClient();

  // Enforce max active keys per user
  const { count } = await admin
    .from("sync_keys")
    .select("id", { count:"exact", head:true })
    .eq("user_id", user.id)
    .is("revoked_at", null) as { count: number | null };

  if ((count ?? 0) >= MAX_KEYS_PER_USER) {
    return NextResponse.json(
      { error:`Maximum of ${MAX_KEYS_PER_USER} active keys allowed. Revoke an existing key first.` },
      { status:422 }
    );
  }

  const body  = await request.json().catch(() => ({}));
  const rawLabel = body?.label ?? "default";
  const label = typeof rawLabel === "string" ? rawLabel.slice(0, 64) : "default";

  const raw    = "ss_" + randomBytes(24).toString("hex");
  const hash   = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 10);

  const { error } = await admin.from("sync_keys").insert({
    user_id: user.id, key_hash: hash, key_prefix: prefix, label,
  });

  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ key: raw, label });
}

export async function OPTIONS() {
  return new Response(null, { status:204 });
}
