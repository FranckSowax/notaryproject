import { useEffect, useRef } from 'react';

export function YCIHLandingZH() {
  const revealRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = '1';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --ycih-ink: #080810;
          --ycih-deep: #0E0E1A;
          --ycih-panel: #13131F;
          --ycih-border: rgba(201,162,39,0.18);
          --ycih-red: #C8312A;
          --ycih-gold: #C9A227;
          --ycih-gold-light: #E0BA4A;
          --ycih-gold-dim: rgba(201,162,39,0.08);
          --ycih-text: #E8E0D0;
          --ycih-muted: rgba(232,224,208,0.45);
          --ycih-white: #F5F0E8;
        }

        .ycih-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .ycih-page {
          background: var(--ycih-ink);
          color: var(--ycih-text);
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .ycih-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1000;
          opacity: 0.6;
        }

        /* NAVBAR */
        .ycih-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: rgba(8,8,16,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--ycih-border);
        }

        .ycih-nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 1.4rem;
          letter-spacing: 0.12em;
          color: var(--ycih-gold);
        }
        .ycih-nav-logo span { color: var(--ycih-white); font-weight: 300; }

        .ycih-nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }

        .ycih-nav-links a {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ycih-muted);
          text-decoration: none;
          transition: color 0.3s;
        }
        .ycih-nav-links a:hover { color: var(--ycih-gold); }

        .ycih-nav-badge {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ycih-gold);
          border: 1px solid var(--ycih-gold);
          padding: 5px 14px;
          border-radius: 2px;
          opacity: 0.8;
        }

        .ycih-lang-switch {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: var(--ycih-gold);
          text-decoration: none;
          border: 1px solid var(--ycih-gold);
          padding: 4px 12px;
          border-radius: 2px;
          transition: background 0.3s, color 0.3s;
          margin-left: 16px;
        }
        .ycih-lang-switch:hover { background: var(--ycih-gold); color: var(--ycih-ink); }

        /* HERO */
        .ycih-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 80px 80px;
          position: relative;
          overflow: hidden;
        }

        .ycih-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 30%, rgba(201,162,39,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(200,49,42,0.08) 0%, transparent 60%);
        }

        .ycih-hero-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .ycih-hero-lines svg {
          width: 100%;
          height: 100%;
          opacity: 0.12;
        }

        .ycih-hero-tag {
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--ycih-gold);
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          opacity: 0;
          animation: ycihFadeUp 0.8s 0.2s forwards;
        }

        .ycih-hero-tag::before {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: var(--ycih-gold);
        }

        .ycih-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 8vw, 8rem);
          font-weight: 300;
          line-height: 0.92;
          letter-spacing: -0.02em;
          color: var(--ycih-white);
          margin-bottom: 16px;
          opacity: 0;
          animation: ycihFadeUp 0.9s 0.35s forwards;
        }

        .ycih-hero-title em {
          font-style: italic;
          color: var(--ycih-gold);
        }

        .ycih-hero-subtitle {
          font-size: 0.88rem;
          letter-spacing: 0.08em;
          color: var(--ycih-muted);
          margin-bottom: 60px;
          max-width: 520px;
          line-height: 1.7;
          opacity: 0;
          animation: ycihFadeUp 0.9s 0.5s forwards;
        }

        .ycih-hero-stats {
          display: flex;
          gap: 64px;
          opacity: 0;
          animation: ycihFadeUp 0.9s 0.65s forwards;
        }

        .ycih-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 600;
          color: var(--ycih-gold-light);
          line-height: 1;
          display: block;
        }
        .ycih-stat-label {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ycih-muted);
          margin-top: 6px;
          display: block;
        }

        .ycih-hero-scroll {
          position: absolute;
          bottom: 40px;
          right: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: ycihFadeIn 1s 1.2s forwards;
        }
        .ycih-hero-scroll span {
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--ycih-muted);
          writing-mode: vertical-lr;
        }
        .ycih-scroll-line {
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, var(--ycih-gold), transparent);
          animation: ycihGrow 2s 1.5s infinite;
        }

        /* SECTION SHARED */
        .ycih-section {
          padding: 100px 80px;
          position: relative;
        }

        .ycih-section-label {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--ycih-gold);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .ycih-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--ycih-gold);
        }

        .ycih-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 4vw, 3.8rem);
          font-weight: 300;
          line-height: 1.1;
          color: var(--ycih-white);
          margin-bottom: 48px;
        }
        .ycih-section-title em {
          font-style: italic;
          color: var(--ycih-gold);
        }

        /* OVERVIEW */
        .ycih-overview { background: var(--ycih-deep); border-top: 1px solid var(--ycih-border); }

        .ycih-overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        .ycih-overview-text p {
          color: var(--ycih-muted);
          font-size: 0.95rem;
          line-height: 1.85;
          margin-bottom: 20px;
        }

        .ycih-overview-text p strong {
          color: var(--ycih-text);
          font-weight: 400;
        }

        .ycih-fact-row {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid var(--ycih-border);
        }

        .ycih-fact-key {
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ycih-muted);
          padding-top: 2px;
        }

        .ycih-fact-val {
          font-size: 0.92rem;
          color: var(--ycih-text);
          font-weight: 400;
        }

        .ycih-fact-val.gold { color: var(--ycih-gold-light); font-weight: 500; }

        /* SECTORS */
        .ycih-sectors { background: var(--ycih-ink); }

        .ycih-sectors-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }

        .ycih-sector-card {
          background: var(--ycih-panel);
          padding: 40px 36px;
          border: 1px solid var(--ycih-border);
          position: relative;
          overflow: hidden;
          transition: background 0.4s, border-color 0.4s;
          cursor: default;
        }

        .ycih-sector-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 2px;
          height: 0;
          background: var(--ycih-gold);
          transition: height 0.4s;
        }

        .ycih-sector-card:hover { background: rgba(201,162,39,0.04); border-color: rgba(201,162,39,0.4); }
        .ycih-sector-card:hover::before { height: 100%; }

        .ycih-sector-icon {
          font-size: 1.8rem;
          margin-bottom: 24px;
          display: block;
        }

        .ycih-sector-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--ycih-white);
          margin-bottom: 14px;
          line-height: 1.2;
        }

        .ycih-sector-desc {
          font-size: 0.82rem;
          color: var(--ycih-muted);
          line-height: 1.75;
        }

        /* PROJECTS */
        .ycih-projects { background: var(--ycih-deep); border-top: 1px solid var(--ycih-border); }

        .ycih-projects-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .ycih-project-card {
          border: 1px solid var(--ycih-border);
          background: var(--ycih-panel);
          position: relative;
          overflow: hidden;
        }

        .ycih-project-header {
          padding: 36px 36px 24px;
          border-bottom: 1px solid var(--ycih-border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .ycih-project-country {
          font-size: 0.62rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--ycih-gold);
          margin-bottom: 8px;
        }

        .ycih-project-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--ycih-white);
          line-height: 1.15;
        }

        .ycih-project-status {
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: rgba(200,49,42,0.18);
          color: #F07070;
          border: 1px solid rgba(200,49,42,0.3);
          padding: 4px 12px;
          border-radius: 2px;
          white-space: nowrap;
        }

        .ycih-project-status.active {
          background: rgba(50,180,80,0.12);
          color: #6DDBA0;
          border-color: rgba(50,180,80,0.3);
        }

        .ycih-project-body {
          padding: 28px 36px 36px;
        }

        .ycih-project-desc {
          font-size: 0.87rem;
          color: var(--ycih-muted);
          line-height: 1.8;
          margin-bottom: 28px;
        }

        .ycih-project-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .ycih-metric-box {
          background: var(--ycih-gold-dim);
          border: 1px solid var(--ycih-border);
          padding: 16px;
          text-align: center;
        }

        .ycih-metric-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ycih-gold-light);
          display: block;
        }
        .ycih-metric-lbl {
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ycih-muted);
          margin-top: 4px;
          display: block;
        }

        /* Featured */
        .ycih-project-card.featured {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .ycih-project-card.featured .ycih-project-header {
          border-right: 1px solid var(--ycih-border);
          border-bottom: none;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          background: linear-gradient(135deg, var(--ycih-panel), rgba(201,162,39,0.04));
        }

        .ycih-project-card.featured .ycih-project-body {
          padding: 48px;
        }

        .ycih-project-card.featured .ycih-project-metrics {
          grid-template-columns: repeat(2, 1fr);
        }

        /* SUBSIDIARIES */
        .ycih-subsidiaries { background: var(--ycih-ink); }

        .ycih-sub-list {
          display: flex;
          flex-direction: column;
          max-width: 900px;
        }

        .ycih-sub-item {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          align-items: center;
          gap: 28px;
          padding: 24px 0;
          border-bottom: 1px solid var(--ycih-border);
          transition: padding-left 0.3s;
          cursor: default;
        }

        .ycih-sub-item:hover { padding-left: 8px; }

        .ycih-sub-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: rgba(201,162,39,0.3);
          line-height: 1;
        }

        .ycih-sub-name {
          font-size: 0.95rem;
          color: var(--ycih-text);
          font-weight: 400;
        }

        .ycih-sub-desc {
          font-size: 0.78rem;
          color: var(--ycih-muted);
          margin-top: 4px;
        }

        .ycih-sub-tag {
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ycih-gold);
          border: 1px solid rgba(201,162,39,0.3);
          padding: 4px 12px;
          border-radius: 2px;
          white-space: nowrap;
        }

        /* AWARDS */
        .ycih-awards { background: var(--ycih-deep); border-top: 1px solid var(--ycih-border); }

        .ycih-awards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }

        .ycih-award-card {
          background: var(--ycih-panel);
          border: 1px solid var(--ycih-border);
          padding: 36px 28px;
          text-align: center;
          transition: background 0.3s;
        }

        .ycih-award-card:hover { background: var(--ycih-gold-dim); }

        .ycih-award-icon { font-size: 2rem; margin-bottom: 16px; }

        .ycih-award-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          color: var(--ycih-gold-light);
          margin-bottom: 10px;
        }

        .ycih-award-desc {
          font-size: 0.78rem;
          color: var(--ycih-muted);
          line-height: 1.65;
        }

        /* INTERNATIONAL */
        .ycih-international { background: var(--ycih-ink); border-top: 1px solid var(--ycih-border); }

        .ycih-countries-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          margin-top: 48px;
        }

        .ycih-country-item {
          background: var(--ycih-panel);
          border: 1px solid var(--ycih-border);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.3s, background 0.3s;
        }

        .ycih-country-item:hover {
          border-color: rgba(201,162,39,0.4);
          background: var(--ycih-gold-dim);
        }

        .ycih-country-flag { font-size: 1.6rem; }

        .ycih-country-name {
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--ycih-text);
        }

        .ycih-country-role {
          font-size: 0.72rem;
          color: var(--ycih-muted);
          line-height: 1.5;
        }

        /* BR BANNER */
        .ycih-br-banner {
          background: linear-gradient(135deg, var(--ycih-red) 0%, #8B1A16 100%);
          border: 1px solid rgba(200,49,42,0.5);
          padding: 48px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          margin-top: 40px;
        }

        .ycih-br-label {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 12px;
        }

        .ycih-br-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: white;
          line-height: 1.2;
        }

        .ycih-br-desc {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.65);
          max-width: 480px;
          line-height: 1.75;
        }

        .ycih-br-nums {
          display: flex;
          gap: 48px;
          flex-shrink: 0;
        }

        .ycih-br-num-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 600;
          color: white;
          line-height: 1;
          display: block;
        }

        .ycih-br-num-l {
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          display: block;
          margin-top: 6px;
        }

        /* FOOTER */
        .ycih-footer {
          padding: 60px 80px;
          border-top: 1px solid var(--ycih-border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 40px;
          background: var(--ycih-deep);
        }

        .ycih-footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--ycih-gold);
          margin-bottom: 8px;
        }

        .ycih-footer-tagline {
          font-size: 0.78rem;
          color: var(--ycih-muted);
          max-width: 280px;
          line-height: 1.65;
        }

        .ycih-footer-info { text-align: right; }

        .ycih-footer-info p {
          font-size: 0.8rem;
          color: var(--ycih-muted);
          line-height: 1.8;
        }

        .ycih-footer-info strong {
          color: var(--ycih-text);
          font-weight: 400;
        }

        /* DIVIDER */
        .ycih-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--ycih-gold), transparent);
          opacity: 0.25;
          margin: 0;
        }

        /* REVEAL */
        .ycih-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        /* ANIMATIONS */
        @keyframes ycihFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes ycihFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes ycihGrow {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          100% { transform: scaleY(1); transform-origin: top; opacity: 0; }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .ycih-nav { padding: 16px 24px; }
          .ycih-nav-links, .ycih-nav-badge { display: none; }
          .ycih-hero { padding: 0 24px 60px; }
          .ycih-section { padding: 70px 24px; }
          .ycih-overview-grid, .ycih-projects-layout { grid-template-columns: 1fr; gap: 40px; }
          .ycih-sectors-grid { grid-template-columns: 1fr; }
          .ycih-awards-grid { grid-template-columns: 1fr 1fr; }
          .ycih-countries-grid { grid-template-columns: 1fr 1fr; }
          .ycih-project-card.featured { grid-column: 1; display: block; }
          .ycih-project-card.featured .ycih-project-header { border-right: none; border-bottom: 1px solid var(--ycih-border); }
          .ycih-br-banner { flex-direction: column; padding: 36px 28px; }
          .ycih-footer { flex-direction: column; padding: 48px 24px; }
          .ycih-footer-info { text-align: left; }
          .ycih-hero-stats { gap: 32px; flex-wrap: wrap; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="ycih-page">
        {/* NAVBAR */}
        <nav className="ycih-nav">
          <div className="ycih-nav-logo">YCIH <span>— 云南集团</span></div>
          <ul className="ycih-nav-links">
            <li><a href="#overview">简介</a></li>
            <li><a href="#sectors">业务领域</a></li>
            <li><a href="#projects">项目</a></li>
            <li><a href="#international">国际化</a></li>
          </ul>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <div className="ycih-nav-badge">中国国企 · 昆明</div>
            <a href="/ycih" className="ycih-lang-switch">FR</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="ycih-hero" id="top">
          <div className="ycih-hero-bg"></div>
          <div className="ycih-hero-lines">
            <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="200" x2="1440" y2="200" stroke="#C9A227" strokeWidth="0.5"/>
              <line x1="0" y1="600" x2="1440" y2="600" stroke="#C9A227" strokeWidth="0.5"/>
              <line x1="300" y1="0" x2="300" y2="900" stroke="#C9A227" strokeWidth="0.5"/>
              <line x1="1100" y1="0" x2="1100" y2="900" stroke="#C9A227" strokeWidth="0.5"/>
              <circle cx="1100" cy="200" r="120" stroke="#C9A227" strokeWidth="0.5"/>
              <circle cx="1100" cy="200" r="60" stroke="#C9A227" strokeWidth="0.5"/>
              <path d="M300 600 L600 200 L900 600 Z" stroke="#C8312A" strokeWidth="0.5"/>
              <line x1="900" y1="0" x2="1440" y2="900" stroke="#C9A227" strokeWidth="0.3"/>
            </svg>
          </div>

          <div className="ycih-hero-tag">中国国有企业 — 云南省</div>
          <h1 className="ycih-hero-title">
            YCIH<br/><em>云南建设投资</em><br/>控股集团
          </h1>
          <p className="ycih-hero-subtitle">
            YCIH是云南省一流的省级国有企业,是云南省建设投资控股集团有限公司。总部位于昆明,业务涵盖建筑工程、房地产、水电及通过丝绸之路进行国际拓展的全产业链。
          </p>
          <div className="ycih-hero-stats">
            <div>
              <span className="ycih-stat-num">166<sup style={{fontSize:'1.2rem'}}>位</sup></span>
              <span className="ycih-stat-label">中国500强 (2025)</span>
            </div>
            <div>
              <span className="ycih-stat-num">160<sup style={{fontSize:'1.2rem'}}>亿</sup></span>
              <span className="ycih-stat-label">年营业收入 (人民币)</span>
            </div>
            <div>
              <span className="ycih-stat-num">754</span>
              <span className="ycih-stat-label">已申请专利</span>
            </div>
            <div>
              <span className="ycih-stat-num">2016</span>
              <span className="ycih-stat-label">成立 (合并重组)</span>
            </div>
          </div>
          <div className="ycih-hero-scroll">
            <div className="ycih-scroll-line"></div>
            <span>向下滚动</span>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* OVERVIEW */}
        <section className="ycih-section ycih-overview" id="overview">
          <div className="ycih-section-label">集团简介</div>
          <h2 className="ycih-section-title">中国省级<em>公共投资</em><br/>领军企业</h2>
          <div className="ycih-overview-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-overview-text">
              <p>
                <strong>云南建设投资控股集团有限公司 (YCIH)</strong> 是云南省重要的省属国有企业,由云南省人民政府国有资产监督管理委员会 (SASAC) 履行出资人职责并进行国有资本管理。
              </p>
              <p>
                集团于<strong>2016年4月21日</strong>由三大集团合并重组而成——云南建工集团、中国第十四冶金建设集团和西南交通建设集团,整合了数十年的建筑工程和重工业领域专业经验。
              </p>
              <p>
                总部位于<strong>昆明经济技术开发区临溪路188号</strong>,云南省省会昆明地处东南亚门户的战略位置。
              </p>
              <p>
                在<strong>中国500强</strong>排名中,YCIH于2025年位列第166位,营业收入超过<strong>16,000亿元人民币</strong>。集团是上海建工集团和中国建筑工程总公司的主要竞争对手之一。
              </p>
            </div>
            <div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">全称</div>
                <div className="ycih-fact-val">云南建设投资控股集团有限公司</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">简称</div>
                <div className="ycih-fact-val gold">YCIH — 云南建投集团</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">总部</div>
                <div className="ycih-fact-val">中国云南省昆明市</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">企业性质</div>
                <div className="ycih-fact-val">省属国有企业 (SASAC)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">法定代表人</div>
                <div className="ycih-fact-val">陈祖军</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">成立时间</div>
                <div className="ycih-fact-val">2016年4月19日 (三大集团合并)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">营业收入</div>
                <div className="ycih-fact-val gold">16,016亿元 (2025)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">专利</div>
                <div className="ycih-fact-val">754项已申请专利</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">全国排名</div>
                <div className="ycih-fact-val">中国500强第166位 (2025)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">官方网站</div>
                <div className="ycih-fact-val">ynjstzkg.com</div>
              </div>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* SECTORS */}
        <section className="ycih-section ycih-sectors" id="sectors">
          <div className="ycih-section-label">业务领域</div>
          <h2 className="ycih-section-title">六大<em>战略板块</em><br/>协同发展</h2>
          <div className="ycih-sectors-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏗️</span>
              <div className="ycih-sector-title">基础设施投资与建设</div>
              <p className="ycih-sector-desc">公路、高速公路、经济区、国家体育场馆。YCIH在国内外丝绸之路框架下,投资建设重大基础设施工程。</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏢</span>
              <div className="ycih-sector-title">房地产开发与投资</div>
              <p className="ycih-sector-desc">开发住宅、商业和行政综合体。为中国各级政府和机构投资者管理城市综合开发项目。</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏭</span>
              <div className="ycih-sector-title">工业与民用建筑</div>
              <p className="ycih-sector-desc">工业厂房、工厂、医疗和教育基础设施。YCIH通过旗下多家专业建筑子公司,调动多专业重型工程力量。</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">⚡</span>
              <div className="ycih-sector-title">水电与机电工程</div>
              <p className="ycih-sector-desc">安装水电设备和复杂机械系统。涵盖电站、配电网络和全区域能源基础设施项目。</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">⚙️</span>
              <div className="ycih-sector-title">冶金设备制造</div>
              <p className="ycih-sector-desc">设计制造冶炼和工业化学转化设备。拥有集成研发能力,已申请754项以上建筑材料和工程专利。</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🔬</span>
              <div className="ycih-sector-title">建筑科学研究</div>
              <p className="ycih-sector-desc">应用研究机构 (云南省建筑科学研究院)。在建筑材料、抗震结构、铁路扣件系统和可持续技术领域创新。</p>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* PROJECTS */}
        <section className="ycih-section ycih-projects" id="projects">
          <div className="ycih-section-label">重点项目</div>
          <h2 className="ycih-section-title">国内外<em>标志性</em><br/>建设成就</h2>
          <div className="ycih-projects-layout ycih-reveal" ref={addRevealRef}>

            {/* FEATURED: Laos SEZ */}
            <div className="ycih-project-card featured">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇱🇦 老挝 — 经济特区</div>
                  <div className="ycih-project-name">赛色塔综合开发区<br/>万象</div>
                  <div style={{marginTop:16, fontSize:'0.83rem', color:'var(--ycih-muted)', lineHeight:1.7, maxWidth:340}}>
                    该项目由习近平主席和老挝国家元首共同见证签署。YCIH通过旗下子公司YOIC,在万象东北部联合开发11.5平方公里的经济特区。
                  </div>
                </div>
                <div className="ycih-project-status active">运营中</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">
                  赛色塔开发区是中国在老挝最大的直接投资项目。由YCIH (通过YOIC, 75%) 和万象市政府 (25%) 共同出资建设,已入驻生物医药、电子通信、科技创新、建材和清洁能源等领域企业,来自中国、日本、新加坡、泰国、奥地利、加拿大和香港等国家和地区。该项目被两国政府列为国家优先事项,获得国家开发银行和中国商务部的支持。
                </p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">1.28亿$</span>
                    <span className="ycih-metric-lbl">LCJV注册资本</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">3.6亿$</span>
                    <span className="ycih-metric-lbl">总投资额</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">11.5 km²</span>
                    <span className="ycih-metric-lbl">占地面积</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">68+</span>
                    <span className="ycih-metric-lbl">入驻企业</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="ycih-project-card">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇨🇳 中国 — 昆明</div>
                  <div className="ycih-project-name">云南文化艺术中心</div>
                </div>
                <div className="ycih-project-status active">已交付</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">建设云南大剧院,云南省重要的文化地标。荣获<strong>2020-2021年度鲁班奖</strong>,这是中国建筑工程领域的最高荣誉。</p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">🏆</span>
                    <span className="ycih-metric-lbl">鲁班奖</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">N°1</span>
                    <span className="ycih-metric-lbl">云南建筑</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">AAA</span>
                    <span className="ycih-metric-lbl">国家信用</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="ycih-project-card">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇲🇲 缅甸 — 能源</div>
                  <div className="ycih-project-name">中缅油气管道<br/>与能源合作</div>
                </div>
                <div className="ycih-project-status">开发中</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">与缅甸能源部就仰光和曼德勒太阳能投资以及经过云南的中缅石油管道开发进行战略会谈。</p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">太阳能</span>
                    <span className="ycih-metric-lbl">仰光和曼德勒</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">天然气</span>
                    <span className="ycih-metric-lbl">一体化管道</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">BRI</span>
                    <span className="ycih-metric-lbl">一带一路</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* SUBSIDIARIES */}
        <section className="ycih-section ycih-subsidiaries" id="subsidiaries">
          <div className="ycih-section-label">集团架构</div>
          <h2 className="ycih-section-title">YCIH集团<br/><em>子公司</em>与实体</h2>
          <div className="ycih-sub-list ycih-reveal" ref={addRevealRef}>
            {[
              { num: '01', name: '云南省海外投资有限公司 (YOIC)', desc: '集团国际业务核心——一带一路项目、万象经济特区 (老挝)、缅甸、东南亚', tag: '海外' },
              { num: '02', name: '云南建投第二建设有限公司', desc: '承担民用和工业建筑施工——云南及周边地区', tag: '建筑' },
              { num: '03', name: '云南工程建设总承包股份有限公司', desc: '大型基础设施和土木工程EPC总承包商', tag: 'EPC' },
              { num: '04', name: '云南建投安装股份有限公司', desc: '机电安装专业企业——始建于1958年8月,拥有60余年专业经验', tag: '安装' },
              { num: '05', name: '云南第三建设工程有限公司', desc: '民用和工业建筑施工,区域市政工程', tag: '施工' },
              { num: '06', name: '西南交通建设集团股份有限公司', desc: '交通基础设施——中国西南地区的公路、高速公路、铁路建设', tag: '交通' },
              { num: '07', name: '云南省建筑科学研究院有限公司', desc: '研发中心——754项专利,建筑材料、抗震工程、工艺创新', tag: '研发' },
              { num: '08', name: '云南建投钢结构股份有限公司', desc: '大型工业和商业工程钢结构制造与安装', tag: '钢结构' },
            ].map((sub) => (
              <div key={sub.num} className="ycih-sub-item">
                <div className="ycih-sub-num">{sub.num}</div>
                <div>
                  <div className="ycih-sub-name">{sub.name}</div>
                  <div className="ycih-sub-desc">{sub.desc}</div>
                </div>
                <div className="ycih-sub-tag">{sub.tag}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* AWARDS */}
        <section className="ycih-section ycih-awards">
          <div className="ycih-section-label">荣誉与认证</div>
          <h2 className="ycih-section-title">最高级别<em>认可</em><br/>的卓越成就</h2>
          <div className="ycih-awards-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">🏆</div>
              <div className="ycih-award-name">鲁班奖</div>
              <p className="ycih-award-desc">中国建筑工程领域最高荣誉。YCIH凭昆明古城南环路项目荣获2020-2021年度鲁班奖。</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">⭐</div>
              <div className="ycih-award-name">全国优秀企业</div>
              <p className="ycih-award-desc">获国家颁发的"全国优秀施工企业"和"全国先进建筑施工企业"荣誉称号。</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">💎</div>
              <div className="ycih-award-name">国家AAA级信用</div>
              <p className="ycih-award-desc">"全国建筑业AAA级信用企业"认证——彰显财务实力和履约可靠性。</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">🔬</div>
              <div className="ycih-award-name">科技创新先进</div>
              <p className="ycih-award-desc">"全国科技创新先进企业"荣誉——754项专利及内部专业研究院。</p>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* INTERNATIONAL */}
        <section className="ycih-section ycih-international" id="international">
          <div className="ycih-section-label">国际布局</div>
          <h2 className="ycih-section-title"><em>丝绸之路</em>核心<br/>一带一路倡议</h2>

          <div className="ycih-countries-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇱🇦</div>
              <div className="ycih-country-name">老挝</div>
              <div className="ycih-country-role">赛色塔经济特区 · LCJV合资企业 · 11.5平方公里工业区</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇲🇲</div>
              <div className="ycih-country-name">缅甸</div>
              <div className="ycih-country-role">太阳能 · 石油天然气管道 · 政府间合作</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇰🇭</div>
              <div className="ycih-country-name">柬埔寨</div>
              <div className="ycih-country-role">一带一路经济走廊框架下的建筑和基础设施项目</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🌏</div>
              <div className="ycih-country-name">东南亚</div>
              <div className="ycih-country-role">中国-东盟经济走廊 · 云南-湄公河友谊桥</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🌍</div>
              <div className="ycih-country-name">全球拓展</div>
              <div className="ycih-country-role">通过YOIC,YCIH积极开拓非洲、中东和中亚新市场</div>
            </div>
          </div>

          <div className="ycih-br-banner ycih-reveal" ref={addRevealRef}>
            <div>
              <div className="ycih-br-label">一带一路倡议 — 云南门户</div>
              <div className="ycih-br-title">云南省：<br/>中国通往<br/>东南亚的门户</div>
            </div>
            <p className="ycih-br-desc">
              YCIH充分利用云南毗邻缅甸、老挝和越南的战略地理优势,在一带一路倡议框架下部署基础设施项目。集团被省级政府部门认定为国家"走出去"战略的关键参与者。
            </p>
            <div className="ycih-br-nums">
              <div>
                <span className="ycih-br-num-n">3</span>
                <span className="ycih-br-num-l">接壤国家</span>
              </div>
              <div>
                <span className="ycih-br-num-n">BRI</span>
                <span className="ycih-br-num-l">国家级倡议</span>
              </div>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* FOOTER */}
        <footer className="ycih-footer">
          <div>
            <div className="ycih-footer-logo">YCIH</div>
            <p className="ycih-footer-tagline">云南建设投资控股集团有限公司<br/>省属国有企业 — 中国昆明</p>
          </div>
          <div className="ycih-footer-info">
            <p><strong>总部地址</strong><br/>中国云南省昆明市<br/>经济技术开发区临溪路188号</p>
            <p style={{marginTop:16}}><strong>官方网站</strong><br/>www.ynjstzkg.com</p>
            <p style={{marginTop:16, fontSize:'0.7rem', color:'rgba(232,224,208,0.3)'}}>介绍文件 — Futur Sowax / DriveBy Africa</p>
          </div>
        </footer>
      </div>
    </>
  );
}
