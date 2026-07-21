import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });

  const body  = await request.json().catch(() => ({}));
  const label = body?.label ?? "default";

  const raw  = "ss_" + randomBytes(24).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");

  const admin = createServiceRoleClient();
  const { error } = await admin.from("sync_keys").insert({
    user_id: user.id, key_hash: hash, label,
  });

  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ key: raw, label });
}

export async function OPTIONS() {
  return new Response(null, { status:204 });
}
