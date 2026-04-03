import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export function YCIHGabonEnergie() {
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
      { threshold: 0.08 }
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes yge-fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .yge-page * { margin:0; padding:0; box-sizing:border-box; }
        .yge-page {
          font-family: 'DM Sans', sans-serif;
          background: #060810;
          color: #E8E2D6;
          font-weight: 300;
          line-height: 1.6;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .yge-page::after {
          content:'';
          position:fixed; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events:none; z-index:999; opacity:.5;
        }

        /* HEADER */
        .yge-header {
          position:fixed; top:0; left:0; right:0; z-index:900;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 48px;
          background:rgba(6,8,16,0.92);
          backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .yge-logo { color:#D4A935; font-family:'Playfair Display',Georgia,serif; font-size:1.05rem; letter-spacing:.06em; }
        .yge-logo span { color:rgba(232,226,214,0.45); font-size:.85rem; font-family:'DM Sans',sans-serif; letter-spacing:.1em; }
        .yge-lang-btns { display:flex; gap:8px; }
        .yge-lang-btn {
          padding:6px 18px; border:1px solid rgba(255,255,255,0.07); background:transparent;
          color:rgba(232,226,214,0.45); font-family:'DM Sans',sans-serif; font-size:.72rem; letter-spacing:.15em;
          text-transform:uppercase; cursor:pointer; transition:all .25s; text-decoration:none;
        }
        .yge-lang-btn.active, .yge-lang-btn:hover { border-color:#D4A935; color:#D4A935; }

        /* HERO */
        .yge-hero {
          min-height:100vh;
          display:flex; flex-direction:column; justify-content:center;
          padding:100px 80px 80px;
          position:relative; overflow:hidden;
        }
        .yge-hero-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 50% at 80% 20%, rgba(212,169,53,.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 10% 80%, rgba(192,57,43,.09) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(26,58,107,.08) 0%, transparent 60%);
        }
        .yge-hero-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .yge-eyebrow {
          font-size:.68rem; letter-spacing:.35em; text-transform:uppercase;
          color:#D4A935; margin-bottom:24px;
          display:flex; align-items:center; gap:16px;
          opacity:0; animation:yge-fadeUp .8s .2s forwards;
        }
        .yge-eyebrow::before { content:''; display:block; width:36px; height:1px; background:#D4A935; }
        .yge-hero-title {
          font-family:'Playfair Display',Georgia,serif; font-size:clamp(3rem,7vw,7rem);
          font-weight:900; line-height:.92; color:#F5F0E8; margin-bottom:8px;
          opacity:0; animation:yge-fadeUp .9s .35s forwards;
        }
        .yge-hero-title-zh {
          font-family:'Noto Serif SC',serif; font-size:clamp(1.4rem,3vw,3rem);
          font-weight:300; color:#D4A935; margin-bottom:36px; letter-spacing:.08em;
          opacity:0; animation:yge-fadeUp .9s .5s forwards;
        }
        .yge-hero-desc {
          max-width:620px; font-size:.95rem; color:rgba(232,226,214,0.45); line-height:1.8; margin-bottom:12px;
          opacity:0; animation:yge-fadeUp .9s .6s forwards;
        }
        .yge-hero-desc strong { color:#E8E2D6; font-weight:500; }
        .yge-hero-desc-zh {
          max-width:620px; font-family:'Noto Serif SC',serif; font-size:.88rem; color:rgba(212,169,53,.55);
          line-height:1.9; margin-bottom:48px;
          opacity:0; animation:yge-fadeUp .9s .7s forwards;
        }
        .yge-stats {
          display:flex; gap:48px; flex-wrap:wrap;
          opacity:0; animation:yge-fadeUp .9s .85s forwards;
        }
        .yge-stat-n { font-family:'Playfair Display',serif; font-size:2.4rem; color:#F0C84A; font-weight:700; line-height:1; }
        .yge-stat-l { font-size:.6rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(232,226,214,0.45); margin-top:6px; }
        .yge-stat-lz { font-family:'Noto Serif SC',serif; font-size:.62rem; color:rgba(212,169,53,.45); display:block; margin-top:2px; }
        .yge-cta {
          margin-top:48px;
          opacity:0; animation:yge-fadeUp .9s 1s forwards;
        }
        .yge-cta-btn {
          display:inline-flex; align-items:center; gap:12px;
          background:#D4A935; color:#060810;
          font-family:'DM Sans',sans-serif; font-weight:600; font-size:.82rem;
          letter-spacing:.1em; text-transform:uppercase; text-decoration:none;
          padding:14px 32px; transition:all .3s;
        }
        .yge-cta-btn:hover { background:#F0C84A; transform:translateY(-2px); }
        .yge-cta-btn.outline { background:transparent; color:#D4A935; border:1px solid #D4A935; }
        .yge-cta-btn.outline:hover { background:rgba(212,169,53,.1); }

        /* SECTIONS */
        .yge-section { padding:100px 80px; position:relative; }
        .yge-divider { border:none; height:1px; background:linear-gradient(to right, transparent, #D4A935, transparent); opacity:.2; margin:0; }
        .yge-label {
          font-size:.62rem; letter-spacing:.35em; text-transform:uppercase;
          color:#D4A935; margin-bottom:16px;
          display:flex; align-items:center; gap:12px;
        }
        .yge-label::before { content:''; display:block; width:20px; height:1px; background:#D4A935; }
        .yge-s-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,4vw,3.4rem); font-weight:700; color:#F5F0E8; line-height:1.05; margin-bottom:8px; }
        .yge-s-title em { font-style:italic; color:#D4A935; }
        .yge-s-title-zh { font-family:'Noto Serif SC',serif; font-size:clamp(.9rem,2vw,1.4rem); color:rgba(212,169,53,.5); letter-spacing:.1em; margin-bottom:48px; }

        /* REVEAL */
        .yge-reveal {
          opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s ease;
        }

        /* SHOCK GRID */
        .yge-shock-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:3px; margin-bottom:64px; }
        .yge-shock-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07);
          padding:36px 28px; position:relative; overflow:hidden;
          transition:border-color .3s;
        }
        .yge-shock-card:hover { border-color:rgba(212,169,53,.35); }
        .yge-shock-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:#D4A935; }
        .yge-shock-num { font-family:'Playfair Display',serif; font-size:2.6rem; font-weight:900; color:#F0C84A; line-height:1; margin-bottom:12px; display:block; }
        .yge-shock-lbl { font-size:.8rem; color:#E8E2D6; margin-bottom:6px; }
        .yge-shock-lbl-zh { font-family:'Noto Serif SC',serif; font-size:.72rem; color:rgba(232,226,214,0.45); }
        .yge-shock-detail { margin-top:14px; font-size:.78rem; line-height:1.7; }
        .yge-shock-detail strong { font-weight:600; }

        /* VIDEO */
        .yge-video-wrap {
          background: #0C0E18;
          border:1px solid rgba(255,255,255,0.07);
          padding:8px;
          margin-bottom:80px;
        }
        .yge-video-wrap iframe { display:block; width:100%; aspect-ratio:16/9; border:none; }
        .yge-video-caption { font-size:.72rem; color:rgba(232,226,214,0.45); padding:12px 16px; letter-spacing:.05em; }

        /* CARDS SECTION */
        .yge-cards-section { background:#0C0E18; border-top:1px solid rgba(255,255,255,0.07); }
        .yge-cards-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px; }
        .yge-pillar-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07);
          padding:48px 44px; position:relative; overflow:hidden;
          transition:background .3s;
        }
        .yge-pillar-card:hover { background:rgba(255,255,255,.02); }
        .yge-pillar-accent { position:absolute; top:0; left:0; width:3px; height:100%; }
        .yge-pillar-card.defi .yge-pillar-accent { background:#E74C3C; }
        .yge-pillar-card.erreur .yge-pillar-accent { background:#E67E22; }
        .yge-pillar-card.opport .yge-pillar-accent { background:#27AE60; }
        .yge-pillar-card.solution .yge-pillar-accent { background:#2E86C1; }
        .yge-pillar-icon { font-size:1.8rem; margin-bottom:8px; }
        .yge-pillar-h { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:700; color:#F5F0E8; }
        .yge-pillar-h-zh { font-family:'Noto Serif SC',serif; font-size:.88rem; color:rgba(232,226,214,0.45); letter-spacing:.1em; margin-bottom:36px; }
        .yge-item-list { list-style:none; display:flex; flex-direction:column; }
        .yge-item { padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.07); display:grid; grid-template-columns:20px 1fr; gap:14px; align-items:start; }
        .yge-item:last-child { border-bottom:none; }
        .yge-item-dot { width:6px; height:6px; border-radius:50%; margin-top:6px; flex-shrink:0; }
        .yge-pillar-card.defi .yge-item-dot { background:#E74C3C; }
        .yge-pillar-card.erreur .yge-item-dot { background:#E67E22; }
        .yge-pillar-card.opport .yge-item-dot { background:#27AE60; }
        .yge-pillar-card.solution .yge-item-dot { background:#2E86C1; }
        .yge-item-fr { font-size:.88rem; color:#E8E2D6; line-height:1.65; margin-bottom:5px; }
        .yge-item-fr strong { color:#F5F0E8; font-weight:500; }
        .yge-item-zh { font-family:'Noto Serif SC',serif; font-size:.78rem; color:rgba(232,226,214,0.45); line-height:1.7; }

        /* PROJECTS TABLE */
        .yge-projects-section { background:#060810; }
        .yge-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .yge-projects-table { width:100%; min-width:700px; border-collapse:collapse; margin-top:24px; font-size:.84rem; }
        .yge-projects-table thead tr { border-bottom:1px solid #D4A935; }
        .yge-projects-table th {
          padding:14px 16px; text-align:left;
          font-size:.62rem; letter-spacing:.2em; text-transform:uppercase;
          color:#D4A935; font-weight:400;
        }
        .yge-projects-table td { padding:16px; border-bottom:1px solid rgba(255,255,255,0.07); vertical-align:top; }
        .yge-projects-table tr:hover td { background:rgba(212,169,53,.03); }
        .yge-td-proj { color:#F5F0E8; font-weight:400; }
        .yge-td-proj-zh { font-family:'Noto Serif SC',serif; font-size:.75rem; color:rgba(232,226,214,0.45); margin-top:4px; }
        .yge-td-mw { color:#F0C84A; font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; }
        .yge-td-cost { color:#E8E2D6; }
        .yge-tag {
          font-size:.58rem; letter-spacing:.12em; text-transform:uppercase;
          padding:4px 10px; border-radius:2px; display:inline-block;
        }
        .yge-tag-urgent { background:rgba(192,57,43,.2); color:#E74C3C; border:1px solid rgba(192,57,43,.3); }
        .yge-tag-strategic { background:rgba(39,174,96,.15); color:#27AE60; border:1px solid rgba(39,174,96,.25); }
        .yge-tag-ppp { background:rgba(46,134,193,.15); color:#2E86C1; border:1px solid rgba(46,134,193,.25); }

        /* URGENCY BANNER */
        .yge-urgency {
          background:linear-gradient(135deg, #C0392B 0%, #8B1A16 100%);
          padding:56px 64px;
          display:flex; align-items:center; justify-content:space-between; gap:40px;
        }
        .yge-ub-eyebrow { font-size:.62rem; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:14px; }
        .yge-ub-title { font-family:'Playfair Display',serif; font-size:clamp(1.4rem,2.5vw,2.2rem); font-weight:700; color:white; line-height:1.2; margin-bottom:8px; }
        .yge-ub-title-zh { font-family:'Noto Serif SC',serif; font-size:clamp(.8rem,1.5vw,1.1rem); color:rgba(255,255,255,.55); letter-spacing:.1em; }
        .yge-ub-body { font-size:.87rem; color:rgba(255,255,255,.65); max-width:480px; line-height:1.8; margin-top:16px; }
        .yge-ub-body strong { color:white; font-weight:600; }
        .yge-ub-nums { display:flex; gap:48px; flex-shrink:0; }
        .yge-ub-n { font-family:'Playfair Display',serif; font-size:3rem; font-weight:900; color:white; line-height:1; display:block; }
        .yge-ub-l { font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,.5); display:block; margin-top:6px; }
        .yge-ub-lz { font-family:'Noto Serif SC',serif; font-size:.58rem; color:rgba(255,255,255,.35); display:block; margin-top:3px; }

        /* PITCH SECTION */
        .yge-pitch-section {
          background:linear-gradient(135deg, #0A0C14 0%, #080A12 100%);
          border-top:1px solid rgba(255,255,255,0.07);
          position:relative; overflow:hidden;
        }
        .yge-pitch-section::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,169,53,.06) 0%, transparent 60%);
        }
        .yge-pitch-inner { position:relative; z-index:1; }
        .yge-pitch-header { text-align:center; margin-bottom:72px; }
        .yge-pitch-badge {
          display:inline-block; font-size:.65rem; letter-spacing:.3em; text-transform:uppercase;
          color:#D4A935; border:1px solid rgba(212,169,53,.4); padding:8px 20px; margin-bottom:28px;
        }
        .yge-pitch-title { font-family:'Playfair Display',serif; font-size:clamp(2.4rem,5vw,5rem); font-weight:900; color:#F5F0E8; line-height:.95; }
        .yge-pitch-title span { color:#D4A935; }
        .yge-pitch-title-zh { font-family:'Noto Serif SC',serif; font-size:clamp(1rem,2.5vw,2rem); color:rgba(212,169,53,.5); letter-spacing:.12em; margin-top:12px; }
        .yge-pitch-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px; margin-bottom:64px; }
        .yge-pitch-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07);
          padding:40px 32px; text-align:center;
          transition:border-color .3s, background .3s;
        }
        .yge-pitch-card:hover { border-color:rgba(212,169,53,.4); background:rgba(212,169,53,0.10); }
        .yge-pitch-card-icon { font-size:2.4rem; margin-bottom:20px; display:block; }
        .yge-pitch-card-h { font-family:'Playfair Display',serif; font-size:1.2rem; color:#F5F0E8; margin-bottom:6px; }
        .yge-pitch-card-h-zh { font-family:'Noto Serif SC',serif; font-size:.78rem; color:#D4A935; letter-spacing:.1em; margin-bottom:16px; }
        .yge-pitch-card-body { font-size:.82rem; color:rgba(232,226,214,0.45); line-height:1.75; }

        /* BLOCKQUOTE */
        .yge-blockquote {
          border-left:3px solid #D4A935; padding:24px 28px;
          background:rgba(212,169,53,0.10); margin:32px auto;
          font-family:'Playfair Display',serif; font-size:1.1rem; color:#F0C84A; font-style:italic; line-height:1.6;
          max-width:800px;
        }
        .yge-blockquote cite { display:block; font-family:'DM Sans',sans-serif; font-size:.72rem; font-style:normal; color:rgba(232,226,214,0.45); margin-top:12px; letter-spacing:.1em; }

        /* CONCLUSION */
        .yge-conclusion { background:#0C0E18; border-top:1px solid rgba(255,255,255,0.07); }
        .yge-conclusion-inner { max-width:800px; }
        .yge-conclusion-body { font-size:.95rem; color:rgba(232,226,214,0.45); line-height:1.9; margin-bottom:16px; }
        .yge-conclusion-body strong { color:#E8E2D6; font-weight:500; }
        .yge-conclusion-body-zh { font-family:'Noto Serif SC',serif; font-size:.87rem; color:rgba(212,169,53,.45); line-height:2; margin-bottom:32px; }

        /* FOOTER */
        .yge-footer {
          padding:48px 80px; border-top:1px solid rgba(255,255,255,0.07); background:#060810;
          display:flex; justify-content:space-between; align-items:center; gap:32px; flex-wrap:wrap;
        }
        .yge-ft-brand { font-family:'Playfair Display',serif; color:#D4A935; font-size:1.2rem; }
        .yge-ft-info { font-size:.72rem; color:rgba(232,226,214,0.45); text-align:right; line-height:1.8; }
        .yge-ft-info strong { color:#E8E2D6; font-weight:400; }

        /* MOBILE CARDS for projects table */
        .yge-proj-cards { display:none; }
        .yge-proj-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07); border-radius:8px;
          padding:20px; margin-bottom:12px;
        }
        .yge-proj-card-name { color:#F5F0E8; font-weight:500; font-size:.9rem; margin-bottom:4px; }
        .yge-proj-card-zh { font-family:'Noto Serif SC',serif; font-size:.72rem; color:rgba(232,226,214,0.45); margin-bottom:12px; }
        .yge-proj-card-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:.8rem; color:rgba(232,226,214,0.45); }
        .yge-proj-card-row span:last-child { color:#E8E2D6; }

        /* RESPONSIVE */
        @media(max-width:768px) {
          .yge-header { padding:14px 20px; }
          .yge-hero, .yge-section { padding:70px 24px; }
          .yge-footer { padding:40px 24px; flex-direction:column; text-align:center; }
          .yge-ft-info { text-align:center; }
          .yge-shock-grid, .yge-cards-grid, .yge-pitch-grid { grid-template-columns:1fr; }
          .yge-urgency { flex-direction:column; padding:36px 28px; }
          .yge-ub-nums { gap:28px; flex-wrap:wrap; }
          .yge-stats { gap:28px; }
          .yge-hero-title { font-size:clamp(2.5rem,10vw,4rem); }
          .yge-pillar-card { padding:32px 24px; }
          .yge-pitch-card { padding:28px 20px; }
          .yge-table-scroll { display:none; }
          .yge-proj-cards { display:block; }
          .yge-conclusion { padding:60px 24px; }
        }

        @media(min-width:769px) and (max-width:1024px) {
          .yge-hero, .yge-section { padding:80px 40px; }
          .yge-shock-grid { grid-template-columns:repeat(2,1fr); }
          .yge-pitch-grid { grid-template-columns:1fr 1fr; }
          .yge-header { padding:14px 32px; }
        }
      `}</style>

      <div className="yge-page">
        {/* HEADER */}
        <div className="yge-header">
          <div className="yge-logo">YCIH × Gabon <span>/ 加蓬能源危机与投资机遇</span></div>
          <div className="yge-lang-btns">
            <span className="yge-lang-btn active">FR</span>
            <Link to="/ycih/gabon/energie/zh" className="yge-lang-btn">中文</Link>
          </div>
        </div>

        {/* HERO */}
        <section className="yge-hero">
          <div className="yge-hero-bg"></div>
          <div className="yge-hero-grid"></div>
          <div className="yge-eyebrow">Note stratégique — Crise énergétique du Gabon &amp; opportunités d'investissement</div>
          <h1 className="yge-hero-title">Gabon<br /><em style={{color:'#D4A935'}}>Énergie</em></h1>
          <div className="yge-hero-title-zh">加蓬能源危机与 YCIH 战略机遇</div>
          <p className="yge-hero-desc">
            Le Gabon dispose d'un potentiel hydroélectrique de <strong>6 000 MW</strong> — parmi les plus denses d'Afrique subsaharienne. Pourtant, Libreville souffre de délestages chroniques, d'un taux de perte en eau de 40 % et d'une dette de plus de 100 milliards FCFA envers la SEEG. Une crise systémique qui appelle une réponse industrielle à grande échelle. <strong>C'est exactement ce que YCIH sait construire.</strong>
          </p>
          <p className="yge-hero-desc-zh">一场系统性危机，一扇为 YCIH 而开的战略之门</p>

          <div className="yge-stats">
            <div>
              <div className="yge-stat-n">6 000</div>
              <div className="yge-stat-l">MW de potentiel hydroélectrique</div>
              <span className="yge-stat-lz">水电潜力（兆瓦）</span>
            </div>
            <div>
              <div className="yge-stat-n">39</div>
              <div className="yge-stat-l">MW seulement atteignent Libreville</div>
              <span className="yge-stat-lz">实际到达利伯维尔的电力</span>
            </div>
            <div>
              <div className="yge-stat-n">40%</div>
              <div className="yge-stat-l">de pertes sur le réseau eau</div>
              <span className="yge-stat-lz">供水管网损耗率</span>
            </div>
            <div>
              <div className="yge-stat-n">3 321</div>
              <div className="yge-stat-l">Mds FCFA budget investissement 2026</div>
              <span className="yge-stat-lz">2026年国家投资预算（十亿非洲法郎）</span>
            </div>
          </div>

          <div className="yge-cta">
            <a href="https://www.youtube.com/watch?v=3ShTO8fhqkg" target="_blank" rel="noopener noreferrer" className="yge-cta-btn">
              ▶ &nbsp;Regarder la vidéo source
            </a>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* CHIFFRES CHOCS */}
        <section className="yge-section" style={{background:'#060810', padding:'80px'}}>
          <div className="yge-label yge-reveal" ref={addRevealRef}>Chiffres chocs — Le diagnostic</div>
          <h2 className="yge-s-title yge-reveal" ref={addRevealRef}>Un paradoxe <em>gabonais</em></h2>
          <div className="yge-s-title-zh yge-reveal" ref={addRevealRef}>丰富的资源，残酷的现实</div>

          <div className="yge-shock-grid yge-reveal" ref={addRevealRef}>
            <div className="yge-shock-card">
              <span className="yge-shock-num">128 MW</span>
              <div className="yge-shock-lbl">Capacité théorique barrages de l'Imbî</div>
              <div className="yge-shock-lbl-zh">因比水坝理论装机容量</div>
              <div className="yge-shock-detail" style={{color:'#E74C3C'}}>→ Seuls <strong>39 MW</strong> arrivent à Libreville (vétusté + saturation des lignes)</div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">200 MW</span>
              <div className="yge-shock-lbl">Besoin réel de Libreville aujourd'hui</div>
              <div className="yge-shock-lbl-zh">利伯维尔当前实际需求</div>
              <div className="yge-shock-detail" style={{color:'#E67E22'}}>Déficit structurel de <strong>161 MW</strong> sur la capitale</div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">160 MW</span>
              <div className="yge-shock-lbl">Barrage de Poubara — production isolée</div>
              <div className="yge-shock-lbl-zh">普巴拉水坝发电量（孤立无法输出）</div>
              <div className="yge-shock-detail" style={{color:'#D4A935'}}>Aucune ligne HT vers Libreville. <strong>800 km à construire.</strong></div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">15 Mds</span>
              <div className="yge-shock-lbl">FCFA réclamés par Karpowership</div>
              <div className="yge-shock-lbl-zh">卡帕瓦希普公司追索金额（法郎）</div>
              <div className="yge-shock-detail" style={{color:'#E74C3C'}}>Ultimatum du 17 mars 2026 : coupure de <strong>150 MW</strong> à Libreville-Sud</div>
            </div>
          </div>

          {/* VIDEO */}
          <div className="yge-video-wrap yge-reveal" ref={addRevealRef}>
            <iframe src="https://www.youtube.com/embed/3ShTO8fhqkg" allowFullScreen title="Crise énergétique Gabon"></iframe>
            <div className="yge-video-caption">🎬 Source : Chaîne YouTube GSW — « Autopsie d'un système à bout de souffle » · Analyse indépendante de la crise énergétique gabonaise</div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* ANALYSE STRATEGIQUE */}
        <section className="yge-cards-section yge-section">
          <div style={{maxWidth:900, marginBottom:64}} className="yge-reveal" ref={addRevealRef}>
            <div className="yge-label">Analyse stratégique en 4 axes</div>
            <h2 className="yge-s-title">Ce que dit <em>vraiment</em> la vidéo</h2>
            <div className="yge-s-title-zh">战略机遇的四个维度</div>
          </div>

          <div className="yge-cards-grid">
            {/* DEFIS */}
            <div className="yge-pillar-card defi yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">⚡</div>
              <div className="yge-pillar-h">Les Défis</div>
              <div className="yge-pillar-h-zh">加蓬面临的能源挑战</div>
              <ul className="yge-item-list">
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Réseau bloqué dans les années 80.</strong> Les barrages de Kingelé (57 MW, 1973) et Tchimbélé (68 MW, 1980) ont été dimensionnés pour 250 000 habitants. Libreville en compte aujourd'hui 2 millions.</div>
                    <div className="yge-item-zh">电网停滞于八十年代。金格雷和钦贝雷两座水坝仅为25万人口设计。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Déficit de 161 MW sur Libreville.</strong> La ville a besoin de 200 MW, seuls 39 MW arrivent effectivement depuis les barrages.</div>
                    <div className="yge-item-zh">利伯维尔161兆瓦缺口。城市需要200兆瓦，实际仅有39兆瓦。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Barrage de Poubara isolé.</strong> 160 MW produits dans le Haut-Ogooué, aucune ligne haute tension pour les acheminer à Libreville. 800 km de dorsale à construire.</div>
                    <div className="yge-item-zh">普巴拉水坝孤立无援。160兆瓦电力无法外送。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Eau : 40 % de pertes.</strong> Sur 10 litres produits, 4 se perdent dans le sol. Réseau vétuste, non rénové depuis des décennies.</div>
                    <div className="yge-item-zh">供水损耗40%。管网老化数十年。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Crise de trésorerie aiguë.</strong> Ultimatum Karpowership (mars 2026) : 150 MW coupés sur Libreville-Sud faute de 15 Mds FCFA non payés.</div>
                    <div className="yge-item-zh">急性流动性危机。2026年3月最后通牒。</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* ERREURS */}
            <div className="yge-pillar-card erreur yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">⚠️</div>
              <div className="yge-pillar-h">Les Erreurs stratégiques</div>
              <div className="yge-pillar-h-zh">40年积累的决策失误</div>
              <ul className="yge-item-list">
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>L'arrêt prématuré des investissements (années 90).</strong> La dévaluation du franc CFA (1994) et les difficultés financières ont mis fin aux grands chantiers. L'âge d'or pétrolier n'a pas servi à bâtir l'autonomie énergétique.</div>
                    <div className="yge-item-zh">90年代过早停止投资。石油黄金时代的财富未能转化为能源自主权。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>La privatisation mal conçue de 1997.</strong> L'État confie la distribution à Veolia mais ne tient pas son engagement d'investir dans la production. Résultat : 20 ans de sous-investissement bilatéral.</div>
                    <div className="yge-item-zh">1997年设计缺陷的私有化。造成20年双边投资不足。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Karpowership : un pansement au prix d'un hôpital.</strong> Solution d'urgence coûteuse (plusieurs milliards FCFA/mois) sans plan de sortie. Aucune confiance des partenaires faute de paiement.</div>
                    <div className="yge-item-zh">以医院的代价换取创可贴。昂贵的应急方案却无退出计划。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Instabilité institutionnelle.</strong> 3 directeurs de la SEEG et 3 ministres de l'Énergie en moins de 2 ans depuis la transition. Paralysie des décisions et fuite de l'expertise technique.</div>
                    <div className="yge-item-zh">机构不稳定。不到2年更换3位总监和3位部长。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Le pari photovoltaïque inadapté.</strong> Le Gabon, pays équatorial et forestier, n'a pas l'exposition solaire suffisante. Tout projet solaire massif implique une déforestation majeure pour un rendement faible.</div>
                    <div className="yge-item-zh">不适合的太阳能押注。加蓬日照不足。</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* OPPORTUNITES */}
            <div className="yge-pillar-card opport yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">🏗️</div>
              <div className="yge-pillar-h">Opportunités pour YCIH</div>
              <div className="yge-pillar-h-zh">YCIH的战略介入点</div>
              <ul className="yge-item-list">
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Barrage de Boué — 300 MW.</strong> Le projet phare de la transition. Ticket d'entrée estimé à ~800 M€. YCIH, spécialiste des grands ouvrages hydroélectriques (Mékong, Laos), est le partenaire naturel pour ce chantier de référence.</div>
                    <div className="yge-item-zh">布韦水坝—300兆瓦。云南建投是天然的理想合作伙伴。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Dorsale électrique nationale — 800 km.</strong> Relier Poubara à Libreville par une ligne à très haute tension. Coût estimé 150–250 Mds FCFA. Cœur de métier YCIH : transport d'énergie longue distance.</div>
                    <div className="yge-item-zh">全国电力主干网—800公里。云南建投已有长距离能源输送经验。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Centrales à gaz modulaires — 1 200 MW.</strong> Libreville (500–600 MW), Port-Gentil (200–300 MW), pôle Sud (200 MW). Investissement total ~1,2 Md$ (800 Mds FCFA). YCIH peut concevoir, financer et livrer ce programme clé en main.</div>
                    <div className="yge-item-zh">模块化燃气电站—1200兆瓦。云南建投可提供交钥匙工程方案。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Réhabilitation du réseau d'eau — 78 Mds FCFA BAD.</strong> Programme Pépal en cours, partenariat Suez à 200 M€. YCIH peut intervenir sur les infrastructures civiles : stations de pompage, conduites, châteaux d'eau.</div>
                    <div className="yge-item-zh">供水管网改造—非行已投780亿法郎。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Zone Économique Spéciale de Libreville.</strong> Le modèle SEZ Saysettha (Laos) appliqué au Gabon. YCIH peut proposer une ZES énergie-industrie intégrant production électrique, eau industrielle et connectivité logistique.</div>
                    <div className="yge-item-zh">利伯维尔经济特区。将万象赛色塔模式移植加蓬。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Budget 2026 : 3 321 Mds FCFA d'investissement.</strong> Dont 412 Mds pour les TP, 307,8 Mds pour l'eau/énergie, 2 100 Mds annoncés sur 7 ans. Un marché public massif en gré à gré, accessible dès maintenant.</div>
                    <div className="yge-item-zh">2026年预算：3321亿法郎。目前采用议标方式采购。</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* SOLUTIONS */}
            <div className="yge-pillar-card solution yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">🔑</div>
              <div className="yge-pillar-h">Solutions recommandées</div>
              <div className="yge-pillar-h-zh">加蓬的能源转型路径</div>
              <ul className="yge-item-list">
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Axe 1 — Hydroélectricité.</strong> Livraison Kingelé Aval (35 MW, fin 2026), lancement immédiat de Boué (300 MW, ~800 M€). Les pères fondateurs avaient raison : le salut passe par les barrages.</div>
                    <div className="yge-item-zh">方向一—水电开发。出路在于水坝。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Axe 2 — Centrales à gaz modulaires.</strong> Viser 1 200 MW installés. Configuration recommandée : blocs de 40 à 125 MW avec turbines multiples. Permet la redondance et la flexibilité horaire. Durée de vie : +25 ans.</div>
                    <div className="yge-item-zh">方向二—模块化燃气电站。目标装机1200兆瓦。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Axe 3 — Autoroute de l'énergie (800 km).</strong> Ligne THT Poubara–Libreville : 150–250 Mds FCFA. Indispensable pour relier les barrages de l'intérieur aux zones de consommation.</div>
                    <div className="yge-item-zh">方向三—能源高速公路（800公里）。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Axe 4 — Réforme de la gouvernance.</strong> Stabiliser le management (un directeur, un ministre, un plan), protéger l'exécution des remous politiques, valoriser l'expertise technique interne.</div>
                    <div className="yge-item-zh">方向四—治理改革。稳定管理层。</div>
                  </div>
                </li>
                <li className="yge-item">
                  <div className="yge-item-dot"></div>
                  <div>
                    <div className="yge-item-fr"><strong>Vision 2045 — Exportateur d'énergie.</strong> Avec 1 000 MW supplémentaires, le Gabon peut devenir hub régional et exporter vers le Congo, le Cameroun et la Guinée équatoriale. De la pénurie à l'abondance.</div>
                    <div className="yge-item-zh">2045愿景—能源出口国。从匮乏到富足。</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* PROJETS CHIFFRES */}
        <section className="yge-projects-section yge-section">
          <div className="yge-label yge-reveal" ref={addRevealRef}>Projets identifiés — Coûts d'objectifs</div>
          <h2 className="yge-s-title yge-reveal" ref={addRevealRef}>Le carnet de commandes <em>potentiel</em></h2>
          <div className="yge-s-title-zh yge-reveal" ref={addRevealRef}>YCIH的潜在工程清单</div>

          {/* Desktop table */}
          <div className="yge-table-scroll yge-reveal" ref={addRevealRef}>
            <table className="yge-projects-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Puissance</th>
                  <th>Coût estimé</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div className="yge-td-proj">Barrage de Boué (hydroélectrique)</div><div className="yge-td-proj-zh">布韦水电站</div></td>
                  <td><span className="yge-td-mw">300 MW</span></td>
                  <td className="yge-td-cost">~800 M€ (~525 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-strategic">Stratégique</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Dorsale THT Poubara–Libreville (800 km)</div><div className="yge-td-proj-zh">超高压输电干线（800公里）</div></td>
                  <td><span className="yge-td-mw">160 MW</span><br /><small style={{color:'rgba(232,226,214,0.45)',fontSize:'.7rem'}}>libérés</small></td>
                  <td className="yge-td-cost">150–250 Mds FCFA</td>
                  <td><span className="yge-tag yge-tag-urgent">Urgence absolue</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Centrales à gaz — Libreville (Estuaire)</div><div className="yge-td-proj-zh">燃气电站—利伯维尔</div></td>
                  <td><span className="yge-td-mw">500–600 MW</span></td>
                  <td className="yge-td-cost">~500–600 M$ (~330 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-urgent">Priorité no.1</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Centrales à gaz — Port-Gentil</div><div className="yge-td-proj-zh">燃气电站—让蒂尔港</div></td>
                  <td><span className="yge-td-mw">200–300 MW</span></td>
                  <td className="yge-td-cost">~200–300 M$</td>
                  <td><span className="yge-tag yge-tag-strategic">Industriel</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Centrales à gaz — Pôle Sud (Mayumba–Moanda)</div><div className="yge-td-proj-zh">燃气电站—南部极点</div></td>
                  <td><span className="yge-td-mw">200 MW</span></td>
                  <td className="yge-td-cost">~200 M$</td>
                  <td><span className="yge-tag yge-tag-ppp">Minier & Port</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Kingelé Aval (hydroélectrique — PPP en cours)</div><div className="yge-td-proj-zh">金格雷下游水坝（PPP进行中）</div></td>
                  <td><span className="yge-td-mw">35 MW</span></td>
                  <td className="yge-td-cost">Meridiam/FGIS</td>
                  <td><span className="yge-tag yge-tag-ppp">Livraison 2026</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">Réhabilitation réseau eau — Libreville</div><div className="yge-td-proj-zh">供水管网改造（PEPPAL+苏伊士）</div></td>
                  <td><span className="yge-td-mw">—</span></td>
                  <td className="yge-td-cost">200 M€ (~131 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-ppp">PPP en cours</span></td>
                </tr>
                <tr style={{background:'rgba(212,169,53,.04)'}}>
                  <td><div className="yge-td-proj" style={{color:'#F0C84A',fontWeight:500}}>TOTAL POTENTIEL YCIH</div></td>
                  <td><span className="yge-td-mw" style={{color:'#F0C84A'}}>1 400+ MW</span></td>
                  <td className="yge-td-cost" style={{color:'#F0C84A',fontWeight:500}}>~2–2,5 Mds $ (1 300–1 650 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-strategic">Marché ouvert</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="yge-proj-cards">
            {[
              { name:'Barrage de Boué', zh:'布韦水电站', mw:'300 MW', cost:'~800 M€', tag:'Stratégique', cls:'yge-tag-strategic' },
              { name:'Dorsale THT (800 km)', zh:'超高压输电干线', mw:'160 MW', cost:'150–250 Mds FCFA', tag:'Urgence absolue', cls:'yge-tag-urgent' },
              { name:'Centrales gaz — Libreville', zh:'燃气电站—利伯维尔', mw:'500–600 MW', cost:'~500–600 M$', tag:'Priorité no.1', cls:'yge-tag-urgent' },
              { name:'Centrales gaz — Port-Gentil', zh:'燃气电站—让蒂尔港', mw:'200–300 MW', cost:'~200–300 M$', tag:'Industriel', cls:'yge-tag-strategic' },
              { name:'Centrales gaz — Pôle Sud', zh:'燃气电站—南部极点', mw:'200 MW', cost:'~200 M$', tag:'Minier & Port', cls:'yge-tag-ppp' },
              { name:'Kingelé Aval (PPP)', zh:'金格雷下游水坝', mw:'35 MW', cost:'Meridiam/FGIS', tag:'Livraison 2026', cls:'yge-tag-ppp' },
              { name:'Réhabilitation eau', zh:'供水管网改造', mw:'—', cost:'200 M€', tag:'PPP en cours', cls:'yge-tag-ppp' },
              { name:'TOTAL POTENTIEL YCIH', zh:'YCIH潜在总规模', mw:'1 400+ MW', cost:'~2–2,5 Mds $', tag:'Marché ouvert', cls:'yge-tag-strategic' },
            ].map((p, i) => (
              <div className="yge-proj-card" key={i} style={i === 7 ? {borderColor:'rgba(212,169,53,.3)'} : {}}>
                <div className="yge-proj-card-name" style={i === 7 ? {color:'#F0C84A'} : {}}>{p.name}</div>
                <div className="yge-proj-card-zh">{p.zh}</div>
                <div className="yge-proj-card-row"><span>Puissance</span><span className="yge-td-mw" style={{fontSize:'.9rem'}}>{p.mw}</span></div>
                <div className="yge-proj-card-row"><span>Coût</span><span>{p.cost}</span></div>
                <div style={{marginTop:8}}><span className={`yge-tag ${p.cls}`}>{p.tag}</span></div>
              </div>
            ))}
          </div>
        </section>

        <hr className="yge-divider" />

        {/* URGENCY BANNER */}
        <div className="yge-urgency yge-reveal" ref={addRevealRef}>
          <div>
            <div className="yge-ub-eyebrow">Alerte — Mars 2026</div>
            <div className="yge-ub-title">Karpowership coupe 150 MW.<br />Le Gabon a besoin d'une solution maintenant.</div>
            <div className="yge-ub-title-zh">卡帕瓦希普切断150兆瓦供电。加蓬需要立即解决方案。</div>
            <p className="yge-ub-body">Dans un courrier officiel daté du 17 mars 2026, l'opérateur turc a notifié la suspension totale de 150 MW sur Libreville-Sud. L'État gabonais est en défaut de paiement. La fenêtre est ouverte pour un partenaire de remplacement crédible et capitalisé. <strong>YCIH arrive au bon moment.</strong></p>
          </div>
          <div className="yge-ub-nums">
            <div>
              <span className="yge-ub-n">150</span>
              <span className="yge-ub-l">MW coupés</span>
              <span className="yge-ub-lz">已断电兆瓦</span>
            </div>
            <div>
              <span className="yge-ub-n">15</span>
              <span className="yge-ub-l">Mds FCFA dus</span>
              <span className="yge-ub-lz">欠缴金额</span>
            </div>
            <div>
              <span className="yge-ub-n">2M</span>
              <span className="yge-ub-l">Gabonais impactés</span>
              <span className="yge-ub-lz">受影响居民</span>
            </div>
          </div>
        </div>

        <hr className="yge-divider" />

        {/* PITCH YCIH */}
        <section className="yge-pitch-section yge-section">
          <div className="yge-pitch-inner">
            <div className="yge-pitch-header yge-reveal" ref={addRevealRef}>
              <div className="yge-pitch-badge">Proposition de valeur — YCIH au Gabon</div>
              <h2 className="yge-pitch-title">Pourquoi <span>YCIH</span><br />est la réponse</h2>
              <div className="yge-pitch-title-zh">为什么YCIH是加蓬能源问题的最优解</div>
            </div>

            <div className="yge-pitch-grid yge-reveal" ref={addRevealRef}>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🏔️</span>
                <div className="yge-pitch-card-h">Expertise hydroélectrique prouvée</div>
                <div className="yge-pitch-card-h-zh">水电工程专业实力已获验证</div>
                <p className="yge-pitch-card-body">YCIH a co-développé la Zone SEZ Saysettha (Laos, 11,5 km², 128 M$ de capital) et réhabilité des infrastructures en Asie du Sud-Est. Ses filiales ont construit barrages, centrales et réseaux dans des écosystèmes tropicaux comparables au Gabon.</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🏛️</span>
                <div className="yge-pitch-card-h">Acteur d'État, interlocuteur d'État</div>
                <div className="yge-pitch-card-h-zh">国有企业对接国家主权项目</div>
                <p className="yge-pitch-card-body">Entreprise publique provinciale du Yunnan (SASAC), YCIH est le partenaire naturel pour des projets d'État sensibles. Sa capacité à structurer des financements souverains (China Development Bank, Ex-Im Bank) est un atout décisif.</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">⚙️</span>
                <div className="yge-pitch-card-h">Modularité & ingénierie de précision</div>
                <div className="yge-pitch-card-h-zh">模块化方案与精密工程能力</div>
                <p className="yge-pitch-card-body">La vidéo recommande des blocs modulaires 40–125 MW pour éviter le point de défaillance unique. C'est exactement la spécialité de YCIH Steel Structure : conception, fabrication et assemblage de systèmes énergétiques complexes et redondants.</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🌍</span>
                <div className="yge-pitch-card-h">Présence africaine via YOIC</div>
                <div className="yge-pitch-card-h-zh">通过YOIC子公司拓展非洲业务</div>
                <p className="yge-pitch-card-body">YOIC (Yunnan Provincial Overseas Investment Co.) est déjà déployée en Asie du Sud-Est. L'Afrique centrale est la prochaine frontière logique — le Gabon, porte d'entrée de la CEMAC, offre un hub idéal pour déployer les capacités YCIH.</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">💰</span>
                <div className="yge-pitch-card-h">Financement concessionnel souverain</div>
                <div className="yge-pitch-card-h-zh">中国政策性优惠贷款优势</div>
                <p className="yge-pitch-card-body">Suez emprunte à 8,15 % sur 15 ans : le Gabon remboursera le double. YCIH peut structurer des financements via China Ex-Im Bank à des taux concessionnels de 2–4 %, allégeant massivement la dette souveraine gabonaise.</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🤝</span>
                <div className="yge-pitch-card-h">Modèle SEZ — clé en main</div>
                <div className="yge-pitch-card-h-zh">经济特区交钥匙模式</div>
                <p className="yge-pitch-card-body">Reproduire le modèle SEZ Saysettha au Gabon : une zone intégrée énergie–eau–logistique–industrie. YCIH conçoit, finance, construit et opère. Le Gabon apporte le foncier, les concessions et la stabilité réglementaire.</p>
              </div>
            </div>

            <div className="yge-reveal" ref={addRevealRef}><blockquote className="yge-blockquote">
              « Les solutions existent. Les études techniques ont été faites, elles sont chiffrées, connues et finançables. Il ne manque plus que la sérénité et la persévérance pour les mettre en œuvre. »
              <cite>— Analyse GSW, Chaîne YouTube · Gabon, mars 2026</cite>
            </blockquote></div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* CONCLUSION */}
        <section className="yge-conclusion yge-section" style={{padding:80}}>
          <div className="yge-conclusion-inner yge-reveal" ref={addRevealRef}>
            <div className="yge-label">Conclusion & Appel à l'action</div>
            <h2 className="yge-s-title">Le moment <em>YCIH</em>, c'est maintenant</h2>
            <div className="yge-s-title-zh" style={{marginBottom:32}}>战略窗口期已开启</div>

            <p className="yge-conclusion-body">
              La crise énergétique du Gabon est l'une des plus documentées d'Afrique centrale. Elle n'est pas une fatalité — c'est un vide industriel à combler. L'État gabonais dispose désormais d'un budget d'investissement sans précédent de <strong>3 321 milliards FCFA pour 2026</strong>, d'une volonté politique claire sous le général Oligui Nguema, et d'une procédure d'achat en <strong>gré à gré</strong> qui permet d'agir vite. Le marché est ouvert. Le partenaire de confiance manque.
            </p>
            <p className="yge-conclusion-body-zh">
              加蓬能源危机是中部非洲记录最翔实的危机之一。它不是宿命，而是一个亟待填补的工业真空。市场已经敞开，只缺一个值得信赖的合作伙伴。
            </p>

            <p className="yge-conclusion-body">
              <strong>YCIH dispose de tout ce qu'il faut :</strong> l'expertise hydroélectrique, la capacité de financement souverain, l'expérience en zone tropicale, le modèle SEZ clé en main, et la légitimité d'acteur d'État. Venir sur place à Libreville, c'est transformer une crise en chantier du siècle.
            </p>

            <div style={{marginTop:40}}>
              <a href="https://www.youtube.com/watch?v=3ShTO8fhqkg" target="_blank" rel="noopener noreferrer" className="yge-cta-btn outline">
                ▶ &nbsp;Voir la vidéo
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="yge-footer">
          <div className="yge-ft-brand">YCIH × Gabon <span style={{color:'rgba(232,226,214,0.45)',fontSize:'.75rem',fontFamily:"'DM Sans',sans-serif"}}>/ 云南建投 × 加蓬</span></div>
          <div className="yge-ft-info">
            <div><strong>Sources :</strong> Transcription YouTube GSW · PNDT 2024–2026 · LFI 2026 Gabon · Budget.gouv.ga</div>
            <div style={{marginTop:6,color:'rgba(232,226,214,.25)',fontSize:'.65rem'}}>Document préparé par Futur Sowax / Oh My Group · Libreville, Gabon · 2026</div>
          </div>
        </footer>
      </div>
    </>
  );
}
