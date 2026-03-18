import { useEffect, useRef } from 'react';

export function YCIHLanding() {
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
          <div className="ycih-nav-logo">YCIH <span>— Yunnan Group</span></div>
          <ul className="ycih-nav-links">
            <li><a href="#overview">Presentation</a></li>
            <li><a href="#sectors">Secteurs</a></li>
            <li><a href="#projects">Projets</a></li>
            <li><a href="#international">International</a></li>
          </ul>
          <div className="ycih-nav-badge">Etat chinois · Kunming</div>
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

          <div className="ycih-hero-tag">Groupe Public Chinois — Yunnan Province</div>
          <h1 className="ycih-hero-title">
            YCIH<br/><em>Yunnan Construction</em><br/>Investment Holding Group
          </h1>
          <p className="ycih-hero-subtitle">
            Entreprise publique d'Etat de premier plan, YCIH est la holding provinciale de construction et d'investissement du Yunnan. Active depuis Kunming, elle deploie ses capacites sur toute la chaine BTP, immobilier, hydroelectricite et expansion internationale via la Route de la Soie.
          </p>
          <div className="ycih-hero-stats">
            <div>
              <span className="ycih-stat-num">166<sup style={{fontSize:'1.2rem'}}>e</sup></span>
              <span className="ycih-stat-label">China Top 500 (2025)</span>
            </div>
            <div>
              <span className="ycih-stat-num">160<sup style={{fontSize:'1.2rem'}}>Mrd</sup></span>
              <span className="ycih-stat-label">CA annuel (¥ yuans)</span>
            </div>
            <div>
              <span className="ycih-stat-num">754</span>
              <span className="ycih-stat-label">Brevets deposes</span>
            </div>
            <div>
              <span className="ycih-stat-num">2016</span>
              <span className="ycih-stat-label">Creation (fusion)</span>
            </div>
          </div>
          <div className="ycih-hero-scroll">
            <div className="ycih-scroll-line"></div>
            <span>Scroll</span>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* OVERVIEW */}
        <section className="ycih-section ycih-overview" id="overview">
          <div className="ycih-section-label">Presentation</div>
          <h2 className="ycih-section-title">Un geant de <em>l'investissement public</em><br/>provincial chinois</h2>
          <div className="ycih-overview-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-overview-text">
              <p>
                <strong>Yunnan Construction Investment Holding Group Co., Ltd. (YCIH)</strong> est une entreprise publique provinciale pilier, dont les missions d'actionnaire et de gestion du capital d'Etat sont exercees par la Commission de supervision et d'administration des actifs d'Etat de la Province du Yunnan (SASAC).
              </p>
              <p>
                Nee le <strong>21 avril 2016</strong> de la fusion de trois entites majeures — le Yunnan Construction Engineering Group, le 14th Metallurgical Construction Group et le Southwest Transportation Construction Group — YCIH consolide des decennies d'expertise dans le BTP et l'ingenierie lourde.
              </p>
              <p>
                Son siege se situe au <strong>No. 188 Linxi Road, Zone de Developpement Economique et Technologique de Kunming</strong>, capitale de la Province du Yunnan, region strategique a la frontiere de l'Asie du Sud-Est.
              </p>
              <p>
                Au classement national <strong>China Top 500</strong>, YCIH occupe la 166e position en 2025, avec un chiffre d'affaires operationnel de plus de <strong>16 000 milliards de yuans</strong>. Elle figure parmi les principaux concurrents de Shanghai Construction Group et China State Construction Engineering Corp.
              </p>
            </div>
            <div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Nom complet</div>
                <div className="ycih-fact-val">Yunnan Construction Investment Holding Group Co., Ltd.</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Sigle</div>
                <div className="ycih-fact-val gold">YCIH — 云南建投集团</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Siege social</div>
                <div className="ycih-fact-val">Kunming, Province du Yunnan, Chine</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Nature juridique</div>
                <div className="ycih-fact-val">Entreprise publique d'Etat provincial (SASAC)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Representant legal</div>
                <div className="ycih-fact-val">Chen Zujun</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Fondation</div>
                <div className="ycih-fact-val">19 avril 2016 (fusion de 3 groupes)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">CA operationnel</div>
                <div className="ycih-fact-val gold">16 016 Mrd ¥ (2025)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Brevets</div>
                <div className="ycih-fact-val">754 brevets deposes</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Classement national</div>
                <div className="ycih-fact-val">166e China Top 500 (2025)</div>
              </div>
              <div className="ycih-fact-row">
                <div className="ycih-fact-key">Site officiel</div>
                <div className="ycih-fact-val">ynjstzkg.com</div>
              </div>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* SECTORS */}
        <section className="ycih-section ycih-sectors" id="sectors">
          <div className="ycih-section-label">Domaines d'activite</div>
          <h2 className="ycih-section-title">Six <em>secteurs strategiques</em><br/>en synergie</h2>
          <div className="ycih-sectors-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏗️</span>
              <div className="ycih-sector-title">Investissement & Construction d'Infrastructures</div>
              <p className="ycih-sector-desc">Routes, autoroutes, zones economiques, stades nationaux. YCIH finance et realise des ouvrages d'infrastructure majeurs, tant en Chine qu'a l'international dans le cadre de la Route de la Soie.</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏢</span>
              <div className="ycih-sector-title">Promotion Immobiliere & Investissement</div>
              <p className="ycih-sector-desc">Developpement de complexes residentiels, commerciaux et administratifs. Gestion de projets mixtes urbains pour le compte de collectivites et d'investisseurs institutionnels en Chine.</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🏭</span>
              <div className="ycih-sector-title">Construction Industrielle & Civile</div>
              <p className="ycih-sector-desc">Batiments industriels, usines, infrastructures hospitalieres et educatives. YCIH mobilise une ingenierie lourde multi-corps d'etat avec ses multiples filiales de construction specialisees.</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">⚡</span>
              <div className="ycih-sector-title">Hydroelectricite & Electromecanique</div>
              <p className="ycih-sector-desc">Installation d'equipements hydroelectriques et de systemes mecaniques complexes. Projets de centrales, reseaux de distribution et infrastructures energetiques dans toute la region.</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">⚙️</span>
              <div className="ycih-sector-title">Fabrication d'Equipements Metallurgiques</div>
              <p className="ycih-sector-desc">Conception et production d'equipements de fusion et de transformation chimique industrielle. Capacite de R&D integree avec plus de 754 brevets deposes dans les materiaux et la construction.</p>
            </div>
            <div className="ycih-sector-card">
              <span className="ycih-sector-icon">🔬</span>
              <div className="ycih-sector-title">Recherche Scientifique en Construction</div>
              <p className="ycih-sector-desc">Bureau de recherche appliquee (Yunnan Provincial Building Research Institute). Innovation en materiaux, structures sismiques, systemes de fixation ferroviaire et technologies durables.</p>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* PROJECTS */}
        <section className="ycih-section ycih-projects" id="projects">
          <div className="ycih-section-label">Projets phares</div>
          <h2 className="ycih-section-title">Realisations <em>emblematiques</em><br/>en Chine et a l'international</h2>
          <div className="ycih-projects-layout ycih-reveal" ref={addRevealRef}>

            {/* FEATURED: Laos SEZ */}
            <div className="ycih-project-card featured">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇱🇦 Laos — Zone Economique Speciale</div>
                  <div className="ycih-project-name">Zone de Developpement<br/>Saysettha, Vientiane</div>
                  <div style={{marginTop:16, fontSize:'0.83rem', color:'var(--ycih-muted)', lineHeight:1.7, maxWidth:340}}>
                    Projet bilateral signe en presence du President Xi Jinping et de son homologue laotien. YCIH via sa filiale YOIC co-developpe cette zone economique speciale de 11,5 km² au nord-est de Vientiane.
                  </div>
                </div>
                <div className="ycih-project-status active">En operation</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">
                  La Zone Saysettha constitue le plus grand investissement direct chinois au Laos. Co-financee par YCIH (via YOIC, 75%) et le gouvernement municipal de Vientiane (25%), la zone accueille des entreprises de biomedecine, communications electroniques, innovation technologique, materiaux de construction et energie propre, en provenance de Chine, Japon, Singapour, Thailande, Autriche, Canada et Hong Kong. Declaree priorite nationale par les deux gouvernements, elle beneficie du soutien de la China Development Bank et du Ministere chinois du Commerce.
                </p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">128M$</span>
                    <span className="ycih-metric-lbl">Capital LCJV</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">360M$</span>
                    <span className="ycih-metric-lbl">Investissement total</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">11,5 km²</span>
                    <span className="ycih-metric-lbl">Superficie</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">68+</span>
                    <span className="ycih-metric-lbl">Entreprises accueillies</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="ycih-project-card">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇨🇳 Chine — Kunming</div>
                  <div className="ycih-project-name">Yunnan Culture<br/>& Arts Center</div>
                </div>
                <div className="ycih-project-status active">Livre</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">Construction du Grand Theatre du Yunnan (Yunnan Grand Theatre), vitrine culturelle majeure de la province. Laureat du <strong>Prix Luban 2020–2021</strong>, la plus haute distinction de la construction en Chine.</p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">🏆</span>
                    <span className="ycih-metric-lbl">Luban Prize</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">N°1</span>
                    <span className="ycih-metric-lbl">Yunnan BTP</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">AAA</span>
                    <span className="ycih-metric-lbl">Credit national</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="ycih-project-card">
              <div className="ycih-project-header">
                <div>
                  <div className="ycih-project-country">🇲🇲 Myanmar — Energie</div>
                  <div className="ycih-project-name">Myanmar–China<br/>Pipeline & Energie</div>
                </div>
                <div className="ycih-project-status">En developpement</div>
              </div>
              <div className="ycih-project-body">
                <p className="ycih-project-desc">Discussions strategiques avec le Ministere de l'Energie du Myanmar pour des investissements dans les energies solaires a Yangon et Mandalay, et la valorisation des pipelines petroliers Myanmar–Chine traversant le Yunnan.</p>
                <div className="ycih-project-metrics">
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">Solar</span>
                    <span className="ycih-metric-lbl">Yangon & Mandalay</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">Gas</span>
                    <span className="ycih-metric-lbl">Pipeline integre</span>
                  </div>
                  <div className="ycih-metric-box">
                    <span className="ycih-metric-val">BRI</span>
                    <span className="ycih-metric-lbl">Route de la Soie</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* SUBSIDIARIES */}
        <section className="ycih-section ycih-subsidiaries" id="subsidiaries">
          <div className="ycih-section-label">Structure du groupe</div>
          <h2 className="ycih-section-title"><em>Filiales</em> & entites<br/>du groupe YCIH</h2>
          <div className="ycih-sub-list ycih-reveal" ref={addRevealRef}>
            {[
              { num: '01', name: 'Yunnan Provincial Overseas Investment Co., Ltd. (YOIC)', desc: 'Bras arme international du groupe — projets BRI, Zone SEZ de Vientiane (Laos), Myanmar, Asie du Sud-Est', tag: 'Overseas' },
              { num: '02', name: 'YCIH No. 2 Construction Co., Ltd.', desc: 'Execution de chantiers de construction civile et industrielle — Yunnan et regions voisines', tag: 'Construction' },
              { num: '03', name: 'Yunnan Engineering Construction General Contracting Co.', desc: 'Contracteur general EPC pour projets d\'infrastructure et de genie civil d\'envergure', tag: 'EPC' },
              { num: '04', name: 'Yunnan Construction Investment & Installation Co., Ltd.', desc: 'Specialiste de l\'installation electromecanique — fondee en aout 1958, plus de 60 ans d\'expertise', tag: 'Installation' },
              { num: '05', name: 'Yunnan Third Construction Engineering Co.', desc: 'Construction de batiments civils et industriels, travaux publics regionaux', tag: 'BTP' },
              { num: '06', name: 'Southwest Communications Construction Group Co., Ltd.', desc: 'Infrastructures de transport — routes, autoroutes, voies ferrees dans le sud-ouest de la Chine', tag: 'Transport' },
              { num: '07', name: 'Yunnan Provincial Building Research Institute Co., Ltd.', desc: 'Centre de R&D — 754 brevets, materiaux de construction, ingenierie sismique, innovations process', tag: 'R&D' },
              { num: '08', name: 'YCIH Steel Structure Co., Ltd.', desc: 'Fabrication et assemblage de structures metalliques pour grands ouvrages industriels et commerciaux', tag: 'Acier' },
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
          <div className="ycih-section-label">Distinctions & certifications</div>
          <h2 className="ycih-section-title">L'excellence <em>reconnue</em><br/>au plus haut niveau</h2>
          <div className="ycih-awards-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">🏆</div>
              <div className="ycih-award-name">Prix Luban</div>
              <p className="ycih-award-desc">La plus haute distinction de la construction en Chine. YCIH laureat 2020–2021 pour l'Ancient City South Ring Road a Kunming.</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">⭐</div>
              <div className="ycih-award-name">Entreprise Nationale Excellente</div>
              <p className="ycih-award-desc">Titre "National Excellent Construction Enterprise" et "National Advanced Construction Enterprise" decernes par l'Etat.</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">💎</div>
              <div className="ycih-award-name">Credit AAA National</div>
              <p className="ycih-award-desc">Certification "National AAA Credit Enterprise of Construction Industry" — garant de la solidite financiere et de la fiabilite contractuelle.</p>
            </div>
            <div className="ycih-award-card">
              <div className="ycih-award-icon">🔬</div>
              <div className="ycih-award-name">Innovation Technologique</div>
              <p className="ycih-award-desc">Titre "National Advanced Science and Technology Innovation Enterprise" — 754 brevets et un institut de recherche dedie en interne.</p>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* INTERNATIONAL */}
        <section className="ycih-section ycih-international" id="international">
          <div className="ycih-section-label">Presence internationale</div>
          <h2 className="ycih-section-title">Au coeur de la <em>Route de la Soie</em><br/>Belt & Road Initiative</h2>

          <div className="ycih-countries-grid ycih-reveal" ref={addRevealRef}>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇱🇦</div>
              <div className="ycih-country-name">Laos</div>
              <div className="ycih-country-role">Zone SEZ Saysettha · Joint-venture LCJV · Zone industrielle 11,5 km²</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇲🇲</div>
              <div className="ycih-country-name">Myanmar</div>
              <div className="ycih-country-role">Energie solaire · Pipeline petrolier & gazier · Cooperation gouvernementale</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🇰🇭</div>
              <div className="ycih-country-name">Cambodge</div>
              <div className="ycih-country-role">Projets BTP et infrastructures dans le cadre des corridors economiques BRI</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🌏</div>
              <div className="ycih-country-name">Asie du Sud-Est</div>
              <div className="ycih-country-role">Corridor economique Chine–ASEAN · Pont de l'amitie Yunnan–Mekong</div>
            </div>
            <div className="ycih-country-item">
              <div className="ycih-country-flag">🌍</div>
              <div className="ycih-country-name">Expansion Globale</div>
              <div className="ycih-country-role">Via YOIC, YCIH explore de nouveaux marches en Afrique, Moyen-Orient et Asie Centrale</div>
            </div>
          </div>

          <div className="ycih-br-banner ycih-reveal" ref={addRevealRef}>
            <div>
              <div className="ycih-br-label">Belt & Road Initiative — Yunnan Gateway</div>
              <div className="ycih-br-title">La province du Yunnan :<br/>porte d'entree de la Chine<br/>vers l'Asie du Sud-Est</div>
            </div>
            <p className="ycih-br-desc">
              YCIH tire parti de la position geographique strategique du Yunnan, aux frontieres du Myanmar, du Laos et du Vietnam, pour deployer ses projets d'infrastructure dans le cadre de la Belt & Road Initiative. Le groupe a ete cite comme acteur cle de la strategie nationale d'"aller vers l'exterieur" (走出去) par les instances provinciales.
            </p>
            <div className="ycih-br-nums">
              <div>
                <span className="ycih-br-num-n">3</span>
                <span className="ycih-br-num-l">Pays frontaliers</span>
              </div>
              <div>
                <span className="ycih-br-num-n">BRI</span>
                <span className="ycih-br-num-l">Initiative officielle</span>
              </div>
            </div>
          </div>
        </section>

        <div className="ycih-divider"></div>

        {/* FOOTER */}
        <footer className="ycih-footer">
          <div>
            <div className="ycih-footer-logo">YCIH</div>
            <p className="ycih-footer-tagline">Yunnan Construction Investment Holding Group Co., Ltd.<br/>Groupe public provincial — Kunming, Chine</p>
          </div>
          <div className="ycih-footer-info">
            <p><strong>Siege social</strong><br/>No. 188 Linxi Road, Zone ETD<br/>Kunming, Province du Yunnan, Chine</p>
            <p style={{marginTop:16}}><strong>Site officiel</strong><br/>www.ynjstzkg.com</p>
            <p style={{marginTop:16, fontSize:'0.7rem', color:'rgba(232,224,208,0.3)'}}>Document de presentation — Futur Sowax / DriveBy Africa</p>
          </div>
        </footer>
      </div>
    </>
  );
}
