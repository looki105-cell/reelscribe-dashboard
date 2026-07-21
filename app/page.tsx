"use client";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const demoRef   = useRef<HTMLParagraphElement>(null);
  const wcRef     = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (cursorRef.current) { cursorRef.current.style.left = mx+"px"; cursorRef.current.style.top = my+"px"; }
    };
    document.addEventListener("mousemove", onMove);
    let raf: number;
    const animRing = () => {
      rx += (mx-rx)*0.12; ry += (my-ry)*0.12;
      if (ringRef.current) { ringRef.current.style.left = rx+"px"; ringRef.current.style.top = ry+"px"; }
      raf = requestAnimationFrame(animRing);
    };
    animRing();

    const lines = "So the key thing with sourdough is hydration. You want to be at around seventy-five percent — any higher and you're fighting the dough the whole way. I start my levain the night before, let it peak by morning. The bulk ferment is where most people go wrong — they cut it short. You want to see a thirty percent rise, feel that tension in the dough...";
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const typeNext = () => {
      if (i < lines.length && demoRef.current) {
        demoRef.current.innerHTML = lines.slice(0,i) + '<span style="border-right:2px solid #7ecba1"></span>';
        i++;
        if (wcRef.current) wcRef.current.textContent = String(lines.slice(0,i).trim().split(/\s+/).filter(Boolean).length);
        timer = setTimeout(typeNext, 30 + Math.random()*20);
      } else if (demoRef.current) {
        demoRef.current.innerHTML = lines;
        if (wcRef.current) wcRef.current.textContent = String(lines.trim().split(/\s+/).length);
      }
    };
    const startTimer = setTimeout(typeNext, 1200);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = (e.target as HTMLElement).dataset.delay || "0";
          setTimeout(() => e.target.classList.add("visible"), +delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".step, .quote-text, .quote-attr").forEach(el => obs.observe(el));

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(startTimer);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=Outfit:wght@300;400;500&display=swap");
        :root{--bg:#0a0906;--surface:#111009;--border:#1e1c17;--text:#e8e2d4;--muted:#6b6456;--accent:#7ecba1;--accent2:#7ecba1;--radius:4px;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:"Outfit",sans-serif;font-weight:300;overflow-x:hidden;cursor:none;}
        body::before{content:"";position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:1000;opacity:0.6;}
        .cursor{position:fixed;width:8px;height:8px;background:var(--accent);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform 0.15s;}
        .cursor-ring{position:fixed;width:32px;height:32px;border:1px solid rgba(126,203,161,0.4);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);}
        nav{position:fixed;top:0;left:0;right:0;padding:24px 48px;display:flex;align-items:center;justify-content:space-between;z-index:100;background:linear-gradient(to bottom,rgba(10,9,6,0.9),transparent);}
        .nav-logo{font-family:"Cormorant Garamond",serif;font-size:20px;font-weight:600;letter-spacing:0.05em;color:var(--text);text-decoration:none;}
        .nav-cta{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);text-decoration:none;border:1px solid rgba(126,203,161,0.3);padding:8px 20px;border-radius:2px;transition:background 0.2s,color 0.2s;}
        .nav-cta:hover{background:var(--accent);color:var(--bg);}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 48px 80px;position:relative;}
        .hero-glow{position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(126,203,161,0.06),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pulse-glow 4s ease-in-out infinite;}
        .hero-eyebrow{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);margin-bottom:32px;opacity:0;transform:translateY(12px);animation:fadeUp 0.8s ease 0.2s forwards;}
        .hero-title{font-family:"Cormorant Garamond",serif;font-size:clamp(52px,9vw,120px);font-weight:300;line-height:1;letter-spacing:-0.02em;margin-bottom:28px;opacity:0;transform:translateY(20px);animation:fadeUp 1s ease 0.4s forwards;}
        .hero-title em{font-style:italic;color:var(--accent);}
        .hero-sub{font-size:16px;color:var(--muted);max-width:480px;line-height:1.7;margin-bottom:52px;opacity:0;transform:translateY(16px);animation:fadeUp 0.9s ease 0.6s forwards;}
        .hero-actions{display:flex;gap:16px;align-items:center;opacity:0;transform:translateY(16px);animation:fadeUp 0.9s ease 0.8s forwards;}
        .btn-primary{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;background:var(--accent);color:var(--bg);border:none;padding:14px 32px;border-radius:2px;cursor:none;text-decoration:none;transition:opacity 0.2s,transform 0.15s;display:inline-block;}
        .btn-primary:hover{opacity:0.85;transform:translateY(-1px);}
        .btn-ghost{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color 0.2s;padding:14px 0;}
        .btn-ghost:hover{color:var(--text);}
        .scroll-hint{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;animation:fadeIn 1s ease 1.4s forwards;}
        .scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,var(--accent),transparent);animation:scroll-drop 2s ease-in-out infinite;}
        .scroll-label{font-family:"DM Mono",monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);writing-mode:vertical-rl;transform:rotate(180deg);}
        .demo-section{padding:80px 48px 120px;display:flex;justify-content:center;}
        .demo-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:32px;max-width:680px;width:100%;position:relative;overflow:hidden;}
        .demo-card::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--accent),transparent);opacity:0.6;}
        .demo-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);}
        .demo-dot{width:8px;height:8px;border-radius:50%;background:var(--accent2);animation:blink 2s ease-in-out infinite;}
        .demo-label{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:0.1em;color:var(--muted);text-transform:uppercase;}
        .demo-url{font-family:"DM Mono",monospace;font-size:12px;color:var(--accent);margin-left:auto;opacity:0.7;}
        .demo-transcript{font-size:14px;line-height:1.8;color:var(--text);opacity:0.85;min-height:120px;}
        .demo-meta{margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:flex;gap:24px;align-items:center;}
        .demo-stat{font-family:"DM Mono",monospace;font-size:11px;color:var(--muted);display:flex;flex-direction:column;align-items:flex-start;gap:2px;}
        .demo-stat-val{color:var(--accent);font-size:18px;font-family:"Cormorant Garamond",serif;display:flex;align-items:center;gap:6px;}
        .demo-stat-val i{font-size:20px;}
        .features{padding:80px 48px 120px;max-width:1100px;margin:0 auto;}
        .section-label{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:64px;display:flex;align-items:center;gap:16px;}
        .section-label::after{content:"";flex:1;height:1px;background:var(--border);}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:4px;overflow:hidden;}
        .feature{background:var(--bg);padding:40px 32px;transition:background 0.3s;position:relative;overflow:hidden;}
        .feature::after{content:"";position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform 0.4s cubic-bezier(.16,1,.3,1);}
        .feature:hover{background:var(--surface);}
        .feature:hover::after{transform:scaleX(1);}
        .feature-icon{font-size:26px;margin-bottom:20px;display:block;color:var(--accent);opacity:0.8;}
        .feature-title{font-family:"Cormorant Garamond",serif;font-size:22px;font-weight:400;color:var(--text);margin-bottom:12px;line-height:1.2;}
        .feature-desc{font-size:13px;color:var(--muted);line-height:1.7;}
        .how{padding:80px 48px 120px;max-width:1100px;margin:0 auto;}
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:48px;}
        .step{position:relative;opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease;}
        .step.visible{opacity:1;transform:translateY(0);}
        .step-num{font-family:"Cormorant Garamond",serif;font-size:72px;font-weight:300;color:var(--border);line-height:1;margin-bottom:16px;}
        .step-title{font-size:15px;font-weight:500;color:var(--text);margin-bottom:8px;}
        .step-desc{font-size:13px;color:var(--muted);line-height:1.7;}
        .step-connector{position:absolute;top:36px;right:-24px;width:48px;height:1px;background:linear-gradient(to right,var(--border),transparent);}
        .quote-section{padding:100px 48px;text-align:center;position:relative;}
        .quote-section::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(126,203,161,0.04),transparent 70%);}
        .quote-text{font-family:"Cormorant Garamond",serif;font-size:clamp(28px,4vw,52px);font-weight:300;font-style:italic;color:var(--text);max-width:800px;margin:0 auto 24px;line-height:1.3;opacity:0;transform:translateY(20px);transition:opacity 0.8s ease,transform 0.8s ease;}
        .quote-text.visible{opacity:1;transform:translateY(0);}
        .quote-attr{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent);opacity:0;transition:opacity 0.8s ease 0.3s;}
        .quote-attr.visible{opacity:1;}
        .cta-section{padding:100px 48px;text-align:center;border-top:1px solid var(--border);}
        .cta-title{font-family:"Cormorant Garamond",serif;font-size:clamp(36px,6vw,72px);font-weight:300;color:var(--text);margin-bottom:16px;line-height:1.1;}
        .cta-sub{font-size:14px;color:var(--muted);margin-bottom:48px;}
        footer{padding:32px 48px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
        .footer-logo{font-family:"Cormorant Garamond",serif;font-size:16px;color:var(--muted);display:flex;align-items:center;gap:8px;}
        .footer-note{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:0.1em;color:var(--muted);opacity:0.5;text-transform:uppercase;}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{to{opacity:1;}}
        @keyframes pulse-glow{0%,100%{transform:translate(-50%,-50%) scale(1);}50%{transform:translate(-50%,-50%) scale(1.1);opacity:0.7;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes scroll-drop{0%{transform:scaleY(0);transform-origin:top;opacity:1;}50%{transform:scaleY(1);transform-origin:top;}51%{transform-origin:bottom;}100%{transform:scaleY(0);transform-origin:bottom;opacity:0;}}
        @media(max-width:768px){nav{padding:20px 24px;}.hero{padding:100px 24px 80px;}.features-grid,.steps{grid-template-columns:1fr;}.features,.how,.demo-section{padding-left:24px;padding-right:24px;}.step-connector{display:none;}footer{flex-direction:column;gap:12px;text-align:center;}}
      `}</style>

      <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />

      <div className="cursor" ref={cursorRef}/>
      <div className="cursor-ring" ref={ringRef}/>

      <nav>
        <a className="nav-logo" href="#">ReelScribe</a>
        <a className="nav-cta" href="/login">Get started →</a>
      </nav>

      <section className="hero">
        <div className="hero-glow"/>
        <p className="hero-eyebrow">Instagram Reels → Markdown</p>
        <h1 className="hero-title">The reel you watched.<br/><em>The words that stayed.</em></h1>
        <p className="hero-sub">Paste a URL. Get a clean transcript in seconds. No scraping, no login walls — just the text, ready to use.</p>
        <div className="hero-actions">
          <a href="/login" className="btn-primary">Start transcribing</a>
          <a href="#how" className="btn-ghost">See how it works ↓</a>
        </div>
        <div className="scroll-hint">
          <span className="scroll-label">scroll</span>
          <div className="scroll-line"/>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-card">
          <div className="demo-header">
            <div className="demo-dot"/>
            <span className="demo-label">Live transcript</span>
            <span className="demo-url">instagram.com/reel/…</span>
          </div>
          <p className="demo-transcript" ref={demoRef}/>
          <div className="demo-meta">
            <div className="demo-stat">
              <span className="demo-stat-val"><i className="bx bx-text"/><span ref={wcRef}>0</span></span>
              words captured
            </div>
            <div className="demo-stat">
              <span className="demo-stat-val"><i className="bx bx-download"/></span>
              export as .md
            </div>
            <div className="demo-stat">
              <span className="demo-stat-val"><i className="bx bx-microphone"/></span>
              nova-2 model
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-label">What you get</div>
        <div className="features-grid">
          {[
            { icon:"bx-microphone",    title:"High-fidelity transcription", desc:"Powered by Deepgram nova-2. Smart formatting, punctuation, and paragraph breaks — not a wall of text." },
            { icon:"bxs-file-md",      title:"Clean markdown output",        desc:"Every transcript exports as a .md file with YAML frontmatter — drop it into Obsidian, NotebookLM, or your notes app." },
            { icon:"bx-image",         title:"Thumbnail + preview",          desc:"Your reel library stays visual. Thumbnails are stored privately alongside each transcript." },
            { icon:"bx-key",           title:"Sync keys",                    desc:"Generate scoped keys to connect the browser extension to your account. Revoke anytime." },
            { icon:"bx-alarm",         title:"30 seconds flat",              desc:"Paste the URL. The extension fetches, transcribes, and saves — all while you move on with your day." },
            { icon:"bx-lock-alt",      title:"Yours only",                   desc:"Row-level security means your reels are only ever visible to you. No shared databases." },
          ].map(f => (
            <div className="feature" key={f.title}>
              <i className={`bx ${f.icon} feature-icon`} />
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-label">How it works</div>
        <div className="steps">
          {[
            { n:"01", title:"Install the extension", desc:"Add ReelScribe to Chrome. Paste your sync key once — it remembers the rest.",              delay:0   },
            { n:"02", title:"Paste any Reel URL",    desc:"Copy the Instagram URL. Open the extension. Hit transcribe. That's the entire workflow.", delay:150 },
            { n:"03", title:"Read, export, use",     desc:"Your transcript lands in the dashboard instantly. Download as .md or pipe it wherever you work.", delay:300 },
          ].map((s,i) => (
            <div className="step" key={s.n} data-delay={String(s.delay)}>
              <div className="step-num">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              {i < 2 && <div className="step-connector"/>}
            </div>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <p className="quote-text">"The best ideas live inside reels you'll never find again."</p>
        <p className="quote-attr">ReelScribe fixes that</p>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Ready when you are.</h2>
        <p className="cta-sub">Free to start. No credit card.</p>
        <a href="/login" className="btn-primary">Open ReelScribe →</a>
      </section>

      <footer>
        <span className="footer-logo">
          <i className="bx bx-microphone" style={{ color:"var(--accent)", fontSize:16 }} />
          ReelScribe
        </span>
        <span className="footer-note">Beta — Built for curious minds</span>
      </footer>
    </>
  );
}
