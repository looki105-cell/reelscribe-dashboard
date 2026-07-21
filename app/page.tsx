"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setError("Check your email to confirm your account.");
    setLoading(false);
  }

  return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ width:"100%", maxWidth:"380px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:700, marginBottom:"6px" }}>ReelScribe</h1>
        <p style={{ color:"var(--muted)", marginBottom:"28px", fontSize:"14px" }}>
          Transcribe Instagram Reels into markdown
        </p>
        <form style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ fontSize:"12px", color: error.includes("Check") ? "var(--accent)" : "var(--error)" }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading} style={btnStyle}>
            {loading ? "..." : "Sign in"}
          </button>
          <button onClick={handleSignup} disabled={loading}
            style={{ ...btnStyle, background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)" }}>
            Create account
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)",
  borderRadius:"var(--radius)", padding:"10px 14px", fontSize:"14px", outline:"none", width:"100%",
};
const btnStyle: React.CSSProperties = {
  background:"var(--accent)", color:"#0e0e0e", border:"none",
  borderRadius:"var(--radius)", padding:"10px", fontSize:"14px",
  fontWeight:600, cursor:"pointer", width:"100%",
};
