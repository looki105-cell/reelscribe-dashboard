"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Integration = { obsidian_vault:string; claude_key:string; };

export default function SettingsPage() {
  const [theme, setTheme]             = useState<"dark"|"light">("dark");
  const [integration, setIntegration] = useState<Integration>({ obsidian_vault:"", claude_key:"" });
  const [saveMsg, setSaveMsg]         = useState("");
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark"|"light"|null;
    if (saved) { setTheme(saved); applyTheme(saved); }
    fetchIntegrations();
  }, []);

  function applyTheme(t: "dark"|"light") {
    const r = document.documentElement;
    if (t === "light") {
      r.style.setProperty("--bg",      "#f5f5f5");
      r.style.setProperty("--surface", "#ffffff");
      r.style.setProperty("--border",  "#e0e0e0");
      r.style.setProperty("--text",    "#111111");
      r.style.setProperty("--muted",   "#666666");
    } else {
      r.style.setProperty("--bg",      "#0e0e0e");
      r.style.setProperty("--surface", "#1a1a1a");
      r.style.setProperty("--border",  "#2a2a2a");
      r.style.setProperty("--text",    "#e8e8e8");
      r.style.setProperty("--muted",   "#888888");
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("theme", next); applyTheme(next);
  }

  async function fetchIntegrations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_integrations")
      .select("*").eq("user_id", user.id).single();
    if (data) setIntegration({ obsidian_vault: data.obsidian_vault || "", claude_key: data.claude_key || "" });
  }

  async function saveIntegrations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("user_integrations").upsert({
      user_id: user.id, ...integration,
    }, { onConflict:"user_id" });
    if (error) alert("Error: " + error.message);
    else { setSaveMsg("Saved!"); setTimeout(() => setSaveMsg(""), 2000); }
  }

  return (
    <main style={{ padding:"32px", maxWidth:700 }}>
      <h1 style={{ fontSize:"20px", fontWeight:700, marginBottom:4 }}>Settings</h1>
      <p style={{ color:"var(--muted)", fontSize:"13px", marginBottom:28 }}>
        Theme and integrations.
      </p>

      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Appearance</h2>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:13, fontWeight:500 }}>{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            <p style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
              {theme === "dark" ? "Easy on the eyes at night" : "Clean and bright"}
            </p>
          </div>
          <button onClick={toggleTheme} style={{
            background: theme === "dark" ? "var(--surface)" : "var(--accent)",
            color: theme === "dark" ? "var(--text)" : "#0e0e0e",
            border:"1px solid var(--border)", borderRadius:20,
            padding:"6px 16px", fontSize:12, cursor:"pointer", fontWeight:500,
          }}>
            {theme === "dark" ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Integrations</h2>
        <div style={{ borderBottom:"1px solid var(--border)", paddingBottom:16, marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>📓 Obsidian</p>
          <p style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>
            Requires the Local REST API plugin running on your machine.
          </p>
          <input type="text" placeholder="Vault name (e.g. my-vault)"
            value={integration.obsidian_vault}
            onChange={e => setIntegration(p => ({ ...p, obsidian_vault: e.target.value }))}
            style={inputStyle} />
        </div>
        <div style={{ paddingBottom:4 }}>
          <p style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>📖 NotebookLM</p>
          <p style={{ fontSize:11, color:"var(--muted)" }}>
            No public API yet. Use the download .md button on any reel and upload it at notebooklm.google.com.
          </p>
        </div>
        <button onClick={saveIntegrations} style={{ ...btnAccent, marginTop:16 }}>
          {saveMsg || "Save"}
        </button>
      </section>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:20, marginBottom:16 };
const sectionTitle: React.CSSProperties = { fontSize:14, fontWeight:600, marginBottom:14 };
const inputStyle: React.CSSProperties   = { width:"100%", background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", borderRadius:6, padding:"8px 12px", fontSize:13, outline:"none" };
const btnAccent: React.CSSProperties    = { background:"var(--accent)", color:"#0e0e0e", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" };
