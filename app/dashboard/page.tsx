"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SavedReel } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [reels, setReels]     = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncKey, setSyncKey] = useState<string | null>(null);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchReels(); fetchOrCreateSyncKey(); }, []);

  async function fetchReels() {
    const { data, error } = await supabase
      .from("saved_reels")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setReels(data || []);
    setLoading(false);
  }

  async function fetchOrCreateSyncKey() {
    const { data } = await supabase
      .from("sync_keys")
      .select("id")
      .is("revoked_at", null)
      .limit(1)
      .single();
    if (data) setSyncKey("ss_••••••••••••••••");
  }

  async function handleSignout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main style={{ minHeight:"100vh", padding:"24px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <h1 style={{ fontSize:"20px", fontWeight:700 }}>ReelScribe</h1>
          <p style={{ color:"var(--muted)", fontSize:"12px" }}>Your reel library</p>
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          {syncKey && (
            <span style={{ fontSize:"11px", color:"var(--muted)", background:"var(--surface)",
              padding:"5px 10px", borderRadius:"6px", border:"1px solid var(--border)" }}>
              {syncKey}
            </span>
          )}
          <button onClick={handleSignout} style={btnSecondary}>Sign out</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:"12px", marginBottom:"28px" }}>
        {[
          { label:"Total reels",       value: reels.length },
          { label:"Words transcribed", value: reels.reduce((a,r) => a+(r.word_count||0), 0).toLocaleString() },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:"var(--radius)", padding:"14px 18px", flex:1 }}>
            <p style={{ fontSize:"22px", fontWeight:700 }}>{s.value}</p>
            <p style={{ fontSize:"11px", color:"var(--muted)", marginTop:"2px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"16px" }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ ...cardBase, background:"var(--surface)", animation:"pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
          <p style={{ fontSize:"32px", marginBottom:"12px" }}>🎙</p>
          <p>No reels yet. Paste a URL in the extension to get started.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"16px" }}>
          {reels.map(reel => <ReelCard key={reel.id} reel={reel} />)}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .reel-card:hover .overlay { opacity:1!important; }
      `}</style>
    </main>
  );
}

function downloadMd(reel: SavedReel) {
  const content = [
    "---",
    `source: ${reel.url}`,
    `id: ${reel.post_id}`,
    `date: ${new Date(reel.created_at).toISOString().slice(0,10)}`,
    "tool: ReelScribe",
    "---",
    "",
    "# Reel Transcript",
    "",
    reel.transcript?.trim() || "(no transcript)",
  ].join("\n");
  const blob = new Blob([content], { type:"text/markdown" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${reel.post_id}.md`; a.click();
  URL.revokeObjectURL(url);
}

function ReelCard({ reel }: { reel: SavedReel }) {
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function resolveThumb() {
      if (reel.thumbnail_storage_path) {
        const { data, error } = await supabase.storage
          .from("reel-assets")
          .createSignedUrl(reel.thumbnail_storage_path, 3600);
        if (error) console.warn("[thumb] signed URL error:", error.message);
        if (data?.signedUrl) { setThumbSrc(data.signedUrl); return; }
      }
      if (reel.thumbnail_url || reel.frame_url) {
        setThumbSrc(reel.thumbnail_url || reel.frame_url);
        return;
      }
      console.warn("[thumb] no source for", reel.post_id, "| path:", reel.thumbnail_storage_path);
    }
    resolveThumb();
  }, [reel.thumbnail_storage_path, reel.thumbnail_url, reel.frame_url]);

  return (
    <div className="reel-card"
      style={{ ...cardBase, position:"relative", overflow:"hidden", cursor:"pointer" }}
      onClick={() => window.open(reel.url, "_blank")}>
      <div style={{ width:"100%", aspectRatio:"9/16", background:"var(--surface)", position:"relative" }}>
        {thumbSrc && !imgError ? (
          <img src={thumbSrc} alt={reel.post_id} onError={() => setImgError(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"32px", color:"var(--muted)" }}>🎙</div>
        )}
      </div>
      <div className="overlay" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)",
        opacity:0, transition:"opacity 0.2s", padding:"12px", display:"flex",
        flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:"11px", color:"var(--accent)", marginBottom:"4px" }}>
          {reel.word_count ? `${reel.word_count} words` : "No transcript"}
        </p>
        <p style={{ fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>
          {new Date(reel.created_at).toLocaleDateString()}
        </p>
        {reel.transcript && (
          <p style={{ fontSize:"11px", color:"var(--text)", marginBottom:"10px",
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3,
            WebkitBoxOrient:"vertical" }}>
            {reel.transcript}
          </p>
        )}
        <button
          onClick={e => { e.stopPropagation(); downloadMd(reel); }}
          style={{ background:"var(--accent)", color:"#0e0e0e", border:"none",
            borderRadius:"6px", padding:"6px 0", fontSize:"12px", fontWeight:600,
            cursor:"pointer", width:"100%" }}>
          ↓ Download .md
        </button>
      </div>
    </div>
  );
}

const cardBase: React.CSSProperties = {
  borderRadius:"var(--radius)", border:"1px solid var(--border)", minHeight:"280px",
};
const btnSecondary: React.CSSProperties = {
  background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)",
  borderRadius:"var(--radius)", padding:"7px 14px", fontSize:"12px", cursor:"pointer",
};
