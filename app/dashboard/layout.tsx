"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const NAV_ITEMS = [
  { href:"/dashboard",          icon:"bx-film",          label:"Library"  },
  { href:"/dashboard/keys",     icon:"bx-key",           label:"Keys"     },
  { href:"/dashboard/settings", icon:"bx-cog",           label:"Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen]   = useState(false);
  const [email, setEmail] = useState("");
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("nav_open");
    if (saved === "true") setOpen(true);
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  function toggle() {
    setOpen(prev => {
      localStorage.setItem("nav_open", String(!prev));
      return !prev;
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const W = open ? 220 : 56;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>
      <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />

      <nav style={{
        width:W, minWidth:W, transition:"width 0.2s ease",
        background:"#111", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:100,
        overflow:"hidden",
      }}>
        {/* Logo / toggle */}
        <div style={{ display:"flex", alignItems:"center", height:56,
          padding:"0 16px", borderBottom:"1px solid var(--border)",
          gap:10, cursor:"pointer" }} onClick={toggle}>
          <i className="bx bx-microphone" style={{ fontSize:20, color:"var(--accent)", flexShrink:0 }} />
          {open && (
            <>
              <span style={{ fontSize:14, fontWeight:700, whiteSpace:"nowrap" }}>ReelScribe</span>
              <i className="bx bx-chevron-left" style={{ marginLeft:"auto", fontSize:16, color:"var(--muted)", flexShrink:0 }} />
            </>
          )}
        </div>

        {/* Nav links */}
        <div style={{ flex:1, padding:"8px 0" }}>
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 16px", cursor:"pointer", textDecoration:"none",
                background: active ? "rgba(126,203,161,0.08)" : "transparent",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                color: active ? "var(--accent)" : "var(--text)",
                transition:"background 0.15s",
              }}>
                <i className={`bx ${icon}`} style={{ fontSize:18, flexShrink:0 }} />
                {open && <span style={{ fontSize:13, whiteSpace:"nowrap" }}>{label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid var(--border)", padding:"12px" }}>
          {open && (
            <p style={{ fontSize:11, color:"var(--muted)", marginBottom:8,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              display:"flex", alignItems:"center", gap:6 }}>
              <i className="bx bx-user-circle" style={{ fontSize:14, flexShrink:0 }} />
              {email}
            </p>
          )}
          <button onClick={signOut} style={{
            width:"100%", background:"transparent", border:"1px solid var(--border)",
            color:"var(--muted)", borderRadius:6, padding:"7px 0",
            fontSize:12, cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center", gap:6,
          }}>
            <i className="bx bx-log-out" style={{ fontSize:15 }} />
            {open && <span>Sign out</span>}
          </button>
        </div>
      </nav>

      <div style={{ marginLeft:W, flex:1, transition:"margin-left 0.2s ease", minWidth:0 }}>
        {children}
      </div>
    </div>
  );
}
