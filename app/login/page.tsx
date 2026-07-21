"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode]         = useState<"signin"|"signup">("signin");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const supabase = createClient();
  const router   = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Mono:wght@300;400&family=Outfit:wght@300;400;500&display=swap");
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0906;font-family:"Outfit",sans-serif;}

        body::before{content:"";position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:0.6;}

        .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;overflow:hidden;}

        .grid-h,.grid-v{position:absolute;pointer-events:none;opacity:0.12;}
        .grid-h{left:0;right:0;height:1px;background:#1e1c17;}
        .grid-v{top:0;bottom:0;width:1px;background:#1e1c17;}

        .login-glow{position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(126,203,161,0.05),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}

        .orb{position:absolute;border-radius:50%;pointer-events:none;
          background:rgba(126,203,161,0.06);
          backdrop-filter:blur(20px) saturate(180%);
          border:1px solid rgba(126,203,161,0.1);
          box-shadow:0 8px 32px rgba(126,203,161,0.08), inset 0 1px 0 rgba(126,203,161,0.15);
          animation:orb-float 6s ease-in-out infinite;
        }
        @keyframes orb-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}

        .glass-card{
          position:relative;z-index:10;
          width:100%;max-width:400px;
          background:rgba(17,16,9,0.6);
          backdrop-filter:blur(40px) saturate(200%);
          border:1px solid rgba(126,203,161,0.15);
          border-radius:16px;
          padding:40px 36px;
          box-shadow:0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(126,203,161,0.12), inset 0 -1px 0 rgba(0,0,0,0.4);
        }
        .glass-card::before{content:"";position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(to right,transparent,rgba(126,203,161,0.4),transparent);border-radius:2px;}

        .card-logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:28px;}
        .card-title{font-family:"Cormorant Garamond",serif;font-size:28px;font-weight:300;color:#e8e2d4;text-align:center;}
        .card-sub{font-size:12px;color:#6b6456;text-align:center;margin-top:4px;margin-bottom:32px;font-family:"DM Mono",monospace;letter-spacing:0.05em;}

        label{display:block;font-size:11px;font-family:"DM Mono",monospace;letter-spacing:0.1em;text-transform:uppercase;color:#6b6456;margin-bottom:6px;}
        input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(126,203,161,0.15);border-radius:6px;padding:10px 12px;font-size:13px;color:#e8e2d4;outline:none;transition:border-color 0.2s,background 0.2s;font-family:"Outfit",sans-serif;}
        input:focus{border-color:rgba(126,203,161,0.4);background:rgba(126,203,161,0.04);}
        input::placeholder{color:#3a3830;}
        .field{margin-bottom:16px;}

        .btn-submit{width:100%;margin-top:8px;background:#7ecba1;color:#0a0906;border:none;border-radius:6px;padding:12px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;font-family:"DM Mono",monospace;cursor:pointer;transition:opacity 0.2s,transform 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .btn-submit:hover:not(:disabled){opacity:0.88;transform:translateY(-1px);}
        .btn-submit:disabled{opacity:0.5;cursor:not-allowed;}

        .error-msg{font-size:12px;color:#e87c7c;margin-top:12px;text-align:center;font-family:"DM Mono",monospace;}
        .ok-msg{font-size:12px;color:#7ecba1;margin-top:12px;text-align:center;font-family:"DM Mono",monospace;}

        .toggle-row{text-align:center;margin-top:20px;font-size:12px;color:#6b6456;}
        .toggle-btn{background:none;border:none;color:#7ecba1;cursor:pointer;font-size:12px;font-family:"DM Mono",monospace;letter-spacing:0.05em;text-decoration:underline;padding:0;}
      `}</style>

      <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />

      <div className="login-wrap">
        {[...Array(6)].map((_,i) => <div key={`h${i}`} className="grid-h" style={{ top:`${(i+1)*14.28}%` }} />)}
        {[...Array(8)].map((_,i) => <div key={`v${i}`} className="grid-v" style={{ left:`${(i+1)*11.11}%` }} />)}

        <div className="login-glow" />

        <div className="orb" style={{ width:140, height:140, top:"15%", left:"12%", animationDelay:"0s" }} />
        <div className="orb" style={{ width:90,  height:90,  bottom:"20%", right:"14%", animationDelay:"2s" }} />
        <div className="orb" style={{ width:60,  height:60,  top:"55%", left:"70%", animationDelay:"4s" }} />

        <div className="glass-card">
          <div className="card-logo">
            <i className="bx bx-microphone" style={{ fontSize:22, color:"#7ecba1" }} />
          </div>
          <h1 className="card-title">
            {mode === "signin" ? "Welcome back." : "Get started."}
          </h1>
          <p className="card-sub">
            {mode === "signin" ? "Sign in to your library" : "Create your account"}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-submit" type="submit" disabled={loading}>
              {loading
                ? <><i className="bx bx-loader-alt bx-spin" /> Working…</>
                : <>{mode === "signin" ? "Sign in" : "Create account"} <i className="bx bx-right-arrow-alt" /></>
              }
            </button>
          </form>

          {error && (
            <p className={error.includes("Check") ? "ok-msg" : "error-msg"}>{error}</p>
          )}

          <p className="toggle-row">
            {mode === "signin" ? "No account? " : "Already have one? "}
            <button className="toggle-btn"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
