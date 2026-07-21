"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const NAV_ITEMS = [
  { href:"/dashboard",          icon:"🎙", label:"Library"  },
  { href:"/dashboard/keys",     icon:"🔑", label:"Keys"     },
  { href:"/dashboard/settings", icon:"⚙",  label:"Settings" },
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
      <nav style={{
        width:W, minWidth:W, transition:"width 0.2s ease",
        background:"#111", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:100,
        overflow:"hidden",
      }}>
        <div style={{ display:"flex", alignItems:"center", height:56,
          padding:"0 16px", borderBottom:"1px solid var(--border)",
          gap:10, cursor:"pointer" }} onClick={toggle}>
          <span style={{ fontSize:20, flexShrink:0 }}>🎙</span>
          {open && (
            <>
              <span style={{ fontSize:14, fontWeight:700, whiteSpace:"nowrap" }}>ReelScribe</span>
              <span style={{ marginLeft:"auto", fontSize:12, color:"var(--muted)", flexShrink:0 }}>←</span>
            </>
          )}
        </div>

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
                <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                {open && <span style={{ fontSize:13, whiteSpace:"nowrap" }}>{label}</span>}
              </Link>
            );
          })}
        </div>

        <div style={{ borderTop:"1px solid var(--border)", padding:"12px" }}>
          {open && (
            <p style={{ fontSize:11, color:"var(--muted)", marginBottom:8,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {email}
            </p>
          )}
          <button onClick={signOut} style={{
            width:"100%", background:"transparent", border:"1px solid var(--border)",
            color:"var(--muted)", borderRadius:6, padding:"7px 0",
            fontSize:12, cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center", gap:6,
          }}>
            <span>↩</span>
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
