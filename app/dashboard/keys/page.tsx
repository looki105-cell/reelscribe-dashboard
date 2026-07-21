"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SyncKey = {
  id: string;
  key_prefix: string;
  label: string | null;
  created_at: string;
  revoked_at: string | null;
};

export default function KeysPage() {
  const [keys, setKeys]             = useState<SyncKey[]>([]);
  const [loading, setLoading]       = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [newKey, setNewKey]         = useState<string | null>(null);
  const [label, setLabel]           = useState("");
  const [error, setError]           = useState("");
  const supabase = createClient();

  useEffect(() => { fetchKeys(); }, []);

  async function fetchKeys() {
    const { data } = await supabase
      .from("sync_keys")
      .select("id, key_prefix, label, created_at, revoked_at")
      .order("created_at", { ascending: false });
    setKeys(data || []);
    setLoading(false);
  }

  async function generateKey() {
    setGenLoading(true); setNewKey(null); setError("");
    try {
      const res  = await fetch("/api/sync-key", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ label: label || "extension" }),
      });
      const data = await res.json();
      if (res.status === 429) { setError(data.error); return; }
      if (res.ok) { setNewKey(data.key); setLabel(""); fetchKeys(); }
      else setError(data.error ?? "Failed to generate key");
    } catch { setError("Network error — try again"); }
    finally { setGenLoading(false); }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this key? The extension using it will stop working.")) return;
    await supabase.from("sync_keys")
      .update({ revoked_at: new Date().toISOString() }).eq("id", id);
    fetchKeys();
  }

  return (
    <main style={{ padding:"32px", maxWidth:700 }}>
      <h1 style={{ fontSize:"20px", fontWeight:700, marginBottom:4 }}>Sync Keys</h1>
      <p style={{ color:"var(--muted)", fontSize:"13px", marginBottom:28 }}>
        Generate keys to connect the ReelScribe extension to your account.
      </p>

      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Generate new key</h2>
        <div style={{ display:"flex", gap:10 }}>
          <input type="text" placeholder="Label (e.g. home laptop)"
            value={label} onChange={e => setLabel(e.target.value)}
            style={inputStyle} />
          <button onClick={generateKey} disabled={genLoading}
            style={{ ...btnAccent, whiteSpace:"nowrap" as const }}>
            {genLoading ? "Generating..." : "+ New key"}
          </button>
        </div>
        {error && <p style={{ fontSize:12, color:"var(--error)", marginTop:10 }}>{error}</p>}
        {newKey && (
          <div style={{ marginTop:14, background:"#0f2a1e", border:"1px solid var(--accent)",
            borderRadius:8, padding:14 }}>
            <p style={{ fontSize:12, color:"var(--accent)", fontWeight:600, marginBottom:8 }}>
              Copy this key now — it will not be shown again
            </p>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <code style={{ flex:1, background:"var(--bg)", padding:"8px 12px",
                borderRadius:6, fontSize:12, wordBreak:"break-all" as const }}>{newKey}</code>
              <button onClick={() => navigator.clipboard.writeText(newKey!)} style={btnSecondary}>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Key history</h2>
        {loading ? (
          <p style={{ color:"var(--muted)", fontSize:13 }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ color:"var(--muted)", fontSize:13 }}>No keys yet.</p>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                {["Label","Prefix","Created","Status",""].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"6px 8px",
                    fontSize:11, color:"var(--muted)", fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} style={{ borderBottom:"1px solid var(--border)", opacity:k.revoked_at ? 0.4 : 1 }}>
                  <td style={{ padding:"10px 8px" }}>{k.label || "—"}</td>
                  <td style={{ padding:"10px 8px", fontFamily:"monospace", fontSize:12 }}>{k.key_prefix}...</td>
                  <td style={{ padding:"10px 8px", color:"var(--muted)" }}>
                    {new Date(k.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding:"10px 8px" }}>
                    {k.revoked_at
                      ? <span style={{ color:"var(--error)", fontSize:11 }}>Revoked</span>
                      : <span style={{ color:"var(--accent)", fontSize:11 }}>Active</span>}
                  </td>
                  <td style={{ padding:"10px 8px" }}>
                    {!k.revoked_at && (
                      <button onClick={() => revokeKey(k.id)} style={{
                        background:"transparent", border:"1px solid var(--error)",
                        color:"var(--error)", borderRadius:6, padding:"4px 10px",
                        fontSize:11, cursor:"pointer",
                      }}>Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:20, marginBottom:16 };
const sectionTitle: React.CSSProperties = { fontSize:14, fontWeight:600, marginBottom:14 };
const inputStyle: React.CSSProperties   = { flex:1, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:6, padding:"8px 12px", fontSize:13, outline:"none" };
const btnAccent: React.CSSProperties    = { background:"var(--accent)", color:"#0e0e0e", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" };
const btnSecondary: React.CSSProperties = { background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 12px", fontSize:12, cursor:"pointer" };
