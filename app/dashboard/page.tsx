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

      {/* Stat cards — skeleton while loading */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"28px" }}>
        {loading ? (
          <>
            <div style={skeletonStatStyle} />
            <div style={skeletonStatStyle} />
          </>
        ) : (
          [
            { label:"Total reels",       value: reels.length },
            { label:"Words transcribed", value: reels.reduce((a,r) => a+(r.word_count||0), 0).toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--radius)", padding:"14px 18px", flex:1 }}>
              <p style={{ fontSize:"22px", fontWeight:700 }}>{s.value}</p>
              <p style={{ fontSize:"11px", color:"var(--muted)", marginTop:"2px" }}>{s.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Pinterest masonry grid */}
      {loading ? (
        <div style={masonryGrid}>
          {[...Array(12)].map((_,i) => (
            <div key={i} style={{
              ...skeletonCardStyle,
              aspectRatio: i % 3 === 0 ? "9/16" : i % 3 === 1 ? "9/14" : "9/18",
            }} />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
          <p style={{ fontSize:"32px", marginBottom:"12px" }}>🎙</p>
          <p>No reels yet. Paste a URL in the extension to get started.</p>
        </div>
      ) : (
        <div style={masonryGrid}>
          {reels.map(reel => <ReelCard key={reel.id} reel={reel} />)}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,
            var(--surface) 25%,
            #2a2a2a 50%,
            var(--surface) 75%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .reel-card:hover .overlay { opacity:1!important; }
      `}</style>
    </main>
  );
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
    }
    resolveThumb();
  }, [reel.thumbnail_storage_path, reel.thumbnail_url, reel.frame_url]);

  return (
    <div className="reel-card"
      style={{ position:"relative", overflow:"hidden", cursor:"pointer",
        borderRadius:"var(--radius)", border:"1px solid var(--border)",
        breakInside:"avoid", marginBottom:"12px",
      }}
      onClick={() => window.open(reel.url, "_blank")}>
      <div style={{ width:"100%", aspectRatio:"9/16", background:"var(--surface)", position:"relative" }}>
        {thumbSrc && !imgError ? (
          <img src={thumbSrc} alt={reel.post_id} onError={() => setImgError(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"24px", color:"var(--muted)" }}>🎙</div>
        )}
      </div>
      <div className="overlay" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.78)",
        opacity:0, transition:"opacity 0.2s", padding:"10px", display:"flex",
        flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:"10px", color:"var(--accent)", marginBottom:"3px" }}>
          {reel.word_count ? `${reel.word_count} words` : "No transcript"}
        </p>
        <p style={{ fontSize:"9px", color:"var(--muted)", marginBottom:"6px" }}>
          {new Date(reel.created_at).toLocaleDateString()}
        </p>
        {reel.transcript && (
          <p style={{ fontSize:"10px", color:"var(--text)", marginBottom:"8px",
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3,
            WebkitBoxOrient:"vertical" }}>
            {reel.transcript}
          </p>
        )}
        <button
          onClick={e => { e.stopPropagation(); downloadMd(reel); }}
          style={{ background:"var(--accent)", color:"#0e0e0e", border:"none",
            borderRadius:"6px", padding:"5px 0", fontSize:"11px", fontWeight:600,
            cursor:"pointer", width:"100%" }}>
          ↓ .md
        </button>
      </div>
    </div>
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

// Pinterest-style masonry: small columns (~160px min), scales with zoom
const masonryGrid: React.CSSProperties = {
  columns: "160px",
  columnGap: "10px",
};

const skeletonStatStyle: React.CSSProperties = {
  flex: 1,
  height: 62,
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
} as React.CSSProperties & { className?: string };

const skeletonCardStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  marginBottom: "10px",
  breakInside: "avoid" as const,
};

const btnSecondary: React.CSSProperties = {
  background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)",
  borderRadius:"var(--radius)", padding:"7px 14px", fontSize:"12px", cursor:"pointer",
};
