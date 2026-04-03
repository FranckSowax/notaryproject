import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export function YCIHGabonEnergieZH() {
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

        .yge-header {
          position:fixed; top:0; left:0; right:0; z-index:900;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 48px;
          background:rgba(6,8,16,0.92);
          backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .yge-logo { color:#D4A935; font-family:'Noto Serif SC',serif; font-size:1.05rem; letter-spacing:.06em; }
        .yge-logo span { color:rgba(232,226,214,0.45); font-size:.85rem; font-family:'DM Sans',sans-serif; letter-spacing:.1em; }
        .yge-lang-btns { display:flex; gap:8px; }
        .yge-lang-btn {
          padding:6px 18px; border:1px solid rgba(255,255,255,0.07); background:transparent;
          color:rgba(232,226,214,0.45); font-family:'DM Sans',sans-serif; font-size:.72rem; letter-spacing:.15em;
          text-transform:uppercase; cursor:pointer; transition:all .25s; text-decoration:none;
        }
        .yge-lang-btn.active, .yge-lang-btn:hover { border-color:#D4A935; color:#D4A935; }

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
          font-size:.68rem; letter-spacing:.2em;
          color:#D4A935; margin-bottom:24px;
          display:flex; align-items:center; gap:16px;
          font-family:'Noto Serif SC',serif;
          opacity:0; animation:yge-fadeUp .8s .2s forwards;
        }
        .yge-eyebrow::before { content:''; display:block; width:36px; height:1px; background:#D4A935; }
        .yge-hero-title {
          font-family:'Noto Serif SC',serif; font-size:clamp(2.5rem,6vw,6rem);
          font-weight:700; line-height:1; color:#F5F0E8; margin-bottom:8px;
          opacity:0; animation:yge-fadeUp .9s .35s forwards;
        }
        .yge-hero-title-sub {
          font-family:'DM Sans',sans-serif; font-size:clamp(.9rem,2vw,1.4rem);
          color:rgba(212,169,53,.55); margin-bottom:36px; letter-spacing:.08em;
          opacity:0; animation:yge-fadeUp .9s .5s forwards;
        }
        .yge-hero-desc {
          max-width:620px; font-family:'Noto Serif SC',serif; font-size:.88rem; color:rgba(232,226,214,0.45); line-height:1.9; margin-bottom:12px;
          opacity:0; animation:yge-fadeUp .9s .6s forwards;
        }
        .yge-hero-desc strong { color:#E8E2D6; font-weight:500; }
        .yge-hero-desc-sub {
          max-width:620px; font-size:.88rem; color:rgba(212,169,53,.55);
          font-family:'DM Sans',sans-serif; margin-bottom:48px;
          opacity:0; animation:yge-fadeUp .9s .7s forwards;
        }
        .yge-stats {
          display:flex; gap:48px; flex-wrap:wrap;
          opacity:0; animation:yge-fadeUp .9s .85s forwards;
        }
        .yge-stat-n { font-family:'Playfair Display',serif; font-size:2.4rem; color:#F0C84A; font-weight:700; line-height:1; }
        .yge-stat-l { font-size:.6rem; letter-spacing:.15em; color:rgba(232,226,214,0.45); margin-top:6px; font-family:'Noto Serif SC',serif; }
        .yge-cta {
          margin-top:48px;
          opacity:0; animation:yge-fadeUp .9s 1s forwards;
        }
        .yge-cta-btn {
          display:inline-flex; align-items:center; gap:12px;
          background:#D4A935; color:#060810;
          font-family:'Noto Serif SC',serif; font-weight:600; font-size:.82rem;
          letter-spacing:.1em; text-decoration:none;
          padding:14px 32px; transition:all .3s;
        }
        .yge-cta-btn:hover { background:#F0C84A; transform:translateY(-2px); }
        .yge-cta-btn.outline { background:transparent; color:#D4A935; border:1px solid #D4A935; }
        .yge-cta-btn.outline:hover { background:rgba(212,169,53,.1); }

        .yge-section { padding:100px 80px; position:relative; }
        .yge-divider { border:none; height:1px; background:linear-gradient(to right, transparent, #D4A935, transparent); opacity:.2; margin:0; }
        .yge-label {
          font-size:.65rem; letter-spacing:.2em;
          color:#D4A935; margin-bottom:16px;
          display:flex; align-items:center; gap:12px;
          font-family:'Noto Serif SC',serif;
        }
        .yge-label::before { content:''; display:block; width:20px; height:1px; background:#D4A935; }
        .yge-s-title { font-family:'Noto Serif SC',serif; font-size:clamp(1.6rem,3.5vw,3rem); font-weight:700; color:#F5F0E8; line-height:1.05; margin-bottom:8px; }
        .yge-s-title span { color:#D4A935; }
        .yge-s-title-sub { font-family:'DM Sans',sans-serif; font-size:clamp(.8rem,1.5vw,1.1rem); color:rgba(212,169,53,.5); letter-spacing:.08em; margin-bottom:48px; }

        .yge-reveal { opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s ease; }

        .yge-shock-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:3px; margin-bottom:64px; }
        .yge-shock-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07);
          padding:36px 28px; position:relative; overflow:hidden;
          transition:border-color .3s;
        }
        .yge-shock-card:hover { border-color:rgba(212,169,53,.35); }
        .yge-shock-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:#D4A935; }
        .yge-shock-num { font-family:'Playfair Display',serif; font-size:2.6rem; font-weight:900; color:#F0C84A; line-height:1; margin-bottom:12px; display:block; }
        .yge-shock-lbl { font-family:'Noto Serif SC',serif; font-size:.8rem; color:#E8E2D6; margin-bottom:6px; }
        .yge-shock-detail { margin-top:14px; font-family:'Noto Serif SC',serif; font-size:.74rem; line-height:1.7; }
        .yge-shock-detail strong { font-weight:600; }

        .yge-video-wrap {
          background: #0C0E18;
          border:1px solid rgba(255,255,255,0.07);
          padding:8px;
          margin-bottom:80px;
        }
        .yge-video-wrap iframe { display:block; width:100%; aspect-ratio:16/9; border:none; }
        .yge-video-caption { font-family:'Noto Serif SC',serif; font-size:.72rem; color:rgba(232,226,214,0.45); padding:12px 16px; letter-spacing:.05em; }

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
        .yge-pillar-h { font-family:'Noto Serif SC',serif; font-size:1.4rem; font-weight:700; color:#F5F0E8; }
        .yge-pillar-h-sub { font-family:'DM Sans',sans-serif; font-size:.82rem; color:rgba(232,226,214,0.45); margin-top:4px; margin-bottom:36px; }
        .yge-item-list { list-style:none; display:flex; flex-direction:column; }
        .yge-item { padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.07); display:grid; grid-template-columns:20px 1fr; gap:14px; align-items:start; }
        .yge-item:last-child { border-bottom:none; }
        .yge-item-dot { width:6px; height:6px; border-radius:50%; margin-top:6px; flex-shrink:0; }
        .yge-pillar-card.defi .yge-item-dot { background:#E74C3C; }
        .yge-pillar-card.erreur .yge-item-dot { background:#E67E22; }
        .yge-pillar-card.opport .yge-item-dot { background:#27AE60; }
        .yge-pillar-card.solution .yge-item-dot { background:#2E86C1; }
        .yge-item-zh { font-family:'Noto Serif SC',serif; font-size:.88rem; color:#E8E2D6; line-height:1.7; margin-bottom:5px; }
        .yge-item-zh strong { color:#F5F0E8; font-weight:500; }
        .yge-item-sub { font-size:.78rem; color:rgba(232,226,214,0.45); line-height:1.65; }

        .yge-projects-section { background:#060810; }
        .yge-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .yge-projects-table { width:100%; min-width:700px; border-collapse:collapse; margin-top:24px; font-size:.84rem; }
        .yge-projects-table thead tr { border-bottom:1px solid #D4A935; }
        .yge-projects-table th {
          padding:14px 16px; text-align:left;
          font-size:.62rem; letter-spacing:.2em; text-transform:uppercase;
          color:#D4A935; font-weight:400; font-family:'Noto Serif SC',serif;
        }
        .yge-projects-table td { padding:16px; border-bottom:1px solid rgba(255,255,255,0.07); vertical-align:top; }
        .yge-projects-table tr:hover td { background:rgba(212,169,53,.03); }
        .yge-td-proj { color:#F5F0E8; font-weight:400; font-family:'Noto Serif SC',serif; }
        .yge-td-mw { color:#F0C84A; font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; }
        .yge-td-cost { color:#E8E2D6; }
        .yge-tag {
          font-size:.58rem; letter-spacing:.12em; text-transform:uppercase;
          padding:4px 10px; border-radius:2px; display:inline-block; font-family:'Noto Serif SC',serif;
        }
        .yge-tag-urgent { background:rgba(192,57,43,.2); color:#E74C3C; border:1px solid rgba(192,57,43,.3); }
        .yge-tag-strategic { background:rgba(39,174,96,.15); color:#27AE60; border:1px solid rgba(39,174,96,.25); }
        .yge-tag-ppp { background:rgba(46,134,193,.15); color:#2E86C1; border:1px solid rgba(46,134,193,.25); }

        .yge-urgency {
          background:linear-gradient(135deg, #C0392B 0%, #8B1A16 100%);
          padding:56px 64px;
          display:flex; align-items:center; justify-content:space-between; gap:40px;
        }
        .yge-ub-eyebrow { font-size:.62rem; letter-spacing:.2em; color:rgba(255,255,255,.5); margin-bottom:14px; font-family:'Noto Serif SC',serif; }
        .yge-ub-title { font-family:'Noto Serif SC',serif; font-size:clamp(1.2rem,2.5vw,2rem); font-weight:700; color:white; line-height:1.3; margin-bottom:8px; }
        .yge-ub-title-sub { font-family:'DM Sans',sans-serif; font-size:clamp(.8rem,1.5vw,1rem); color:rgba(255,255,255,.55); }
        .yge-ub-body { font-family:'Noto Serif SC',serif; font-size:.84rem; color:rgba(255,255,255,.65); max-width:480px; line-height:1.8; margin-top:16px; }
        .yge-ub-body strong { color:white; font-weight:600; }
        .yge-ub-nums { display:flex; gap:48px; flex-shrink:0; }
        .yge-ub-n { font-family:'Playfair Display',serif; font-size:3rem; font-weight:900; color:white; line-height:1; display:block; }
        .yge-ub-l { font-size:.6rem; letter-spacing:.15em; color:rgba(255,255,255,.5); display:block; margin-top:6px; font-family:'Noto Serif SC',serif; }

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
          display:inline-block; font-size:.65rem; letter-spacing:.2em;
          color:#D4A935; border:1px solid rgba(212,169,53,.4); padding:8px 20px; margin-bottom:28px;
          font-family:'Noto Serif SC',serif;
        }
        .yge-pitch-title { font-family:'Noto Serif SC',serif; font-size:clamp(2rem,4.5vw,4.5rem); font-weight:700; color:#F5F0E8; line-height:.95; }
        .yge-pitch-title span { color:#D4A935; }
        .yge-pitch-title-sub { font-family:'DM Sans',sans-serif; font-size:clamp(.8rem,2vw,1.2rem); color:rgba(212,169,53,.5); letter-spacing:.08em; margin-top:12px; }
        .yge-pitch-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px; margin-bottom:64px; }
        .yge-pitch-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07);
          padding:40px 32px; text-align:center;
          transition:border-color .3s, background .3s;
        }
        .yge-pitch-card:hover { border-color:rgba(212,169,53,.4); background:rgba(212,169,53,0.10); }
        .yge-pitch-card-icon { font-size:2.4rem; margin-bottom:20px; display:block; }
        .yge-pitch-card-h { font-family:'Noto Serif SC',serif; font-size:1.1rem; color:#F5F0E8; margin-bottom:6px; }
        .yge-pitch-card-h-sub { font-family:'DM Sans',sans-serif; font-size:.75rem; color:#D4A935; letter-spacing:.08em; margin-bottom:16px; }
        .yge-pitch-card-body { font-family:'Noto Serif SC',serif; font-size:.76rem; color:rgba(212,169,53,.4); line-height:1.8; }

        .yge-blockquote {
          border-left:3px solid #D4A935; padding:24px 28px;
          background:rgba(212,169,53,0.10); margin:32px auto;
          max-width:800px;
        }
        .yge-blockquote p { font-family:'Noto Serif SC',serif; font-size:1rem; color:#F0C84A; line-height:1.8; }
        .yge-blockquote cite { display:block; font-family:'Noto Serif SC',serif; font-size:.72rem; font-style:normal; color:rgba(232,226,214,0.45); margin-top:12px; letter-spacing:.05em; }

        .yge-conclusion { background:#0C0E18; border-top:1px solid rgba(255,255,255,0.07); }
        .yge-conclusion-inner { max-width:800px; }
        .yge-conclusion-body { font-family:'Noto Serif SC',serif; font-size:.87rem; color:rgba(232,226,214,0.45); line-height:2; margin-bottom:16px; }
        .yge-conclusion-body strong { color:#E8E2D6; font-weight:500; }
        .yge-conclusion-body-sub { font-family:'DM Sans',sans-serif; font-size:.87rem; color:rgba(212,169,53,.45); line-height:1.9; margin-bottom:32px; }

        .yge-footer {
          padding:48px 80px; border-top:1px solid rgba(255,255,255,0.07); background:#060810;
          display:flex; justify-content:space-between; align-items:center; gap:32px; flex-wrap:wrap;
        }
        .yge-ft-brand { font-family:'Noto Serif SC',serif; color:#D4A935; font-size:1.2rem; }
        .yge-ft-info { font-family:'Noto Serif SC',serif; font-size:.72rem; color:rgba(232,226,214,0.45); text-align:right; line-height:1.8; }

        .yge-proj-cards { display:none; }
        .yge-proj-card {
          background:#111420; border:1px solid rgba(255,255,255,0.07); border-radius:8px;
          padding:20px; margin-bottom:12px;
        }
        .yge-proj-card-name { color:#F5F0E8; font-weight:500; font-size:.9rem; font-family:'Noto Serif SC',serif; margin-bottom:12px; }
        .yge-proj-card-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:.8rem; color:rgba(232,226,214,0.45); }
        .yge-proj-card-row span:last-child { color:#E8E2D6; }

        @media(max-width:768px) {
          .yge-header { padding:14px 20px; }
          .yge-hero, .yge-section { padding:70px 24px; }
          .yge-footer { padding:40px 24px; flex-direction:column; text-align:center; }
          .yge-ft-info { text-align:center; }
          .yge-shock-grid, .yge-cards-grid, .yge-pitch-grid { grid-template-columns:1fr; }
          .yge-urgency { flex-direction:column; padding:36px 28px; }
          .yge-ub-nums { gap:28px; flex-wrap:wrap; }
          .yge-stats { gap:28px; }
          .yge-hero-title { font-size:clamp(2rem,10vw,3.5rem); }
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
          <div className="yge-logo">YCIH × 加蓬 <span>/ Gabon Énergie — Opportunités</span></div>
          <div className="yge-lang-btns">
            <Link to="/ycih/gabon/energie" className="yge-lang-btn">FR</Link>
            <span className="yge-lang-btn active">中文</span>
          </div>
        </div>

        {/* HERO */}
        <section className="yge-hero">
          <div className="yge-hero-bg"></div>
          <div className="yge-hero-grid"></div>
          <div className="yge-eyebrow">战略简报 — 加蓬能源危机与投资机遇</div>
          <h1 className="yge-hero-title">加蓬<span style={{color:'#D4A935'}}>能源</span></h1>
          <div className="yge-hero-title-sub">Crise énergétique &amp; opportunités YCIH</div>
          <p className="yge-hero-desc">
            加蓬拥有高达<strong>6,000兆瓦</strong>的水电潜力，是撒哈拉以南非洲密度最高的国家之一。然而，利伯维尔长期遭受停电之苦，输水损耗率高达40%，国家对SEEG（能源水务公司）欠债超过1000亿非洲法郎。这场系统性危机迫切需要大规模工业解决方案——<strong>这正是云南建投集团（YCIH）的核心优势所在。</strong>
          </p>
          <p className="yge-hero-desc-sub">Une crise systémique, une porte stratégique ouverte pour YCIH</p>

          <div className="yge-stats">
            <div>
              <div className="yge-stat-n">6,000</div>
              <div className="yge-stat-l">水电潜力（兆瓦）</div>
            </div>
            <div>
              <div className="yge-stat-n">39</div>
              <div className="yge-stat-l">实际到达利伯维尔的电力（兆瓦）</div>
            </div>
            <div>
              <div className="yge-stat-n">40%</div>
              <div className="yge-stat-l">供水管网损耗率</div>
            </div>
            <div>
              <div className="yge-stat-n">3,321</div>
              <div className="yge-stat-l">2026年国家投资预算（十亿非洲法郎）</div>
            </div>
          </div>

          <div className="yge-cta">
            <a href="https://www.youtube.com/watch?v=3ShTO8fhqkg" target="_blank" rel="noopener noreferrer" className="yge-cta-btn">
              ▶ &nbsp;观看原始视频
            </a>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* 关键数据 */}
        <section className="yge-section" style={{background:'#060810', padding:'80px'}}>
          <div className="yge-label yge-reveal" ref={addRevealRef}>关键数据 — 诊断报告</div>
          <h2 className="yge-s-title yge-reveal" ref={addRevealRef}>加蓬的能源<span>悖论</span></h2>
          <div className="yge-s-title-sub yge-reveal" ref={addRevealRef}>Des ressources abondantes, une réalité cruelle</div>

          <div className="yge-shock-grid yge-reveal" ref={addRevealRef}>
            <div className="yge-shock-card">
              <span className="yge-shock-num">128 MW</span>
              <div className="yge-shock-lbl">因比水坝理论装机容量</div>
              <div className="yge-shock-detail" style={{color:'#E74C3C'}}>→ 实际仅<strong>39兆瓦</strong>抵达利伯维尔（设备老化+线路饱和）</div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">200 MW</span>
              <div className="yge-shock-lbl">利伯维尔当前实际需求</div>
              <div className="yge-shock-detail" style={{color:'#E67E22'}}>首都存在<strong>161兆瓦</strong>的结构性电力缺口</div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">160 MW</span>
              <div className="yge-shock-lbl">普巴拉水坝发电量（孤立无法输出）</div>
              <div className="yge-shock-detail" style={{color:'#D4A935'}}>无高压输电线路通往利伯维尔，<strong>需建800公里线路。</strong></div>
            </div>
            <div className="yge-shock-card">
              <span className="yge-shock-num">15 Mds</span>
              <div className="yge-shock-lbl">卡帕瓦希普公司追索金额</div>
              <div className="yge-shock-detail" style={{color:'#E74C3C'}}>2026年3月17日最后通牒：切断利伯维尔南部<strong>150兆瓦</strong>供电</div>
            </div>
          </div>

          {/* VIDEO */}
          <div className="yge-video-wrap yge-reveal" ref={addRevealRef}>
            <iframe src="https://www.youtube.com/embed/3ShTO8fhqkg" allowFullScreen title="加蓬能源危机"></iframe>
            <div className="yge-video-caption">🎬 来源：YouTube频道 GSW — 《气喘吁吁的系统解剖》· 加蓬能源危机独立分析</div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* 四维战略分析 */}
        <section className="yge-cards-section yge-section">
          <div style={{maxWidth:900, marginBottom:64}} className="yge-reveal" ref={addRevealRef}>
            <div className="yge-label">四维战略分析</div>
            <h2 className="yge-s-title">视频的<span>真实含义</span></h2>
            <div className="yge-s-title-sub">Quatre dimensions de l'opportunité stratégique</div>
          </div>

          <div className="yge-cards-grid">
            {/* 挑战 */}
            <div className="yge-pillar-card defi yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">⚡</div>
              <div className="yge-pillar-h">挑战</div>
              <div className="yge-pillar-h-sub">Les défis énergétiques du Gabon</div>
              <ul className="yge-item-list">
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>电网停滞于八十年代。</strong>金格雷（57兆瓦，1973年）和钦贝雷（68兆瓦，1980年）两座水坝仅为25万人口设计，而今利伯维尔已有200万居民。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>利伯维尔161兆瓦缺口。</strong>城市需要200兆瓦，实际仅有39兆瓦从水坝输出抵达。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>普巴拉水坝孤立无援。</strong>上奥果韦160兆瓦电力无法外送，缺乏800公里高压输电通道。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>供水损耗40%。</strong>每生产10升水，4升渗漏于地下。管网老化，数十年未经大规模改造。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>急性流动性危机。</strong>卡帕瓦希普最后通牒（2026年3月）：因欠缴150亿法郎，切断利伯维尔南部150兆瓦供电。</div></div></li>
              </ul>
            </div>

            {/* 战略失误 */}
            <div className="yge-pillar-card erreur yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">⚠️</div>
              <div className="yge-pillar-h">战略失误</div>
              <div className="yge-pillar-h-sub">40 ans d'erreurs de décision accumulées</div>
              <ul className="yge-item-list">
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>90年代过早停止投资。</strong>1994年非洲法郎贬值引发财政困难，大型基础设施建设就此中断。石油黄金时代的财富未能转化为能源自主权。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>1997年设计缺陷的私有化。</strong>国家将配电权委托给威立雅，却未履行投资发电端（大坝、电站）的承诺，造成20年双边投资不足。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>卡帕瓦希普：以医院的代价换取创可贴。</strong>昂贵的应急方案（每月数十亿法郎）却无退出计划，因拖欠款项导致合作伙伴信任彻底丧失。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>机构不稳定。</strong>过渡期不到2年内，SEEG更换3位总监、能源部换了3位部长，决策陷入瘫痪，技术专家大量流失。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>不适合的太阳能押注。</strong>加蓬是赤道森林国家，日照量不足以支撑大规模光伏。大型太阳能项目将导致严重毁林却产能低下。</div></div></li>
              </ul>
            </div>

            {/* YCIH的战略机遇 */}
            <div className="yge-pillar-card opport yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">🏗️</div>
              <div className="yge-pillar-h">YCIH的战略机遇</div>
              <div className="yge-pillar-h-sub">Points d'intervention stratégique pour YCIH</div>
              <ul className="yge-item-list">
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>布韦水坝—300兆瓦。</strong>过渡期标志性项目，投资约8亿欧元。云南建投在湄公河、老挝等地拥有大型水电工程经验，是天然的理想合作伙伴。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>全国电力主干网—800公里。</strong>连接普巴拉与利伯维尔的超高压输电线路，造价约1500至2500亿法郎。云南建投在东南亚已有长距离能源输送工程经验。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>模块化燃气电站—1200兆瓦。</strong>利伯维尔（500-600兆瓦）、让蒂尔港（200-300兆瓦）、南部极点（200兆瓦），总投资约12亿美元，云南建投可提供交钥匙工程方案。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>供水管网改造—非行已投780亿法郎。</strong>PEPPAL项目正在推进，苏伊士集团签署2亿欧元合同。云南建投可承接配套民用基础设施：泵站、管道、水塔等工程。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>利伯维尔经济特区。</strong>将万象赛色塔经济特区模式移植加蓬：云南建投可规划集电力生产、工业供水、物流连接于一体的能源工业特区。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>2026年财政预算：3321亿法郎投资额。</strong>其中公共工程412亿，水电307.8亿，7年规划2100亿。目前采用议标方式采购，现在入场是最佳时机。</div></div></li>
              </ul>
            </div>

            {/* 推荐解决方案 */}
            <div className="yge-pillar-card solution yge-reveal" ref={addRevealRef}>
              <div className="yge-pillar-accent"></div>
              <div className="yge-pillar-icon">🔑</div>
              <div className="yge-pillar-h">推荐解决方案</div>
              <div className="yge-pillar-h-sub">La trajectoire de transition énergétique du Gabon</div>
              <ul className="yge-item-list">
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>方向一—水电开发。</strong>金格雷下游（35兆瓦，2026年底竣工），立即启动布韦项目（300兆瓦，约8亿欧元）。建国先驱是对的：出路在于水坝。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>方向二—模块化燃气电站。</strong>目标装机1200兆瓦，推荐配置：40至125兆瓦机组+多台燃气轮机，实现冗余与小时级灵活调度，运行寿命25年以上。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>方向三—能源高速公路（800公里）。</strong>普巴拉至利伯维尔超高压输电线路：1500至2500亿法郎。将内陆水坝与消费区连通，实现从孤立岛群到全国统一电网的历史性跨越。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>方向四—治理改革。</strong>稳定管理层（一位总监、一位部长、一个计划），保护项目执行免受政治动荡干扰，重视内部技术专长。以方法论取代情绪化决策。</div></div></li>
                <li className="yge-item"><div className="yge-item-dot"></div><div><div className="yge-item-zh"><strong>2045愿景—能源出口国。</strong>新增1000兆瓦（Ax能源项目），加蓬可成为区域能源枢纽，向刚果、喀麦隆、赤道几内亚出口电力，实现从匮乏到富足的历史性转变。</div></div></li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* 已识别项目 */}
        <section className="yge-projects-section yge-section">
          <div className="yge-label yge-reveal" ref={addRevealRef}>已识别项目及目标成本</div>
          <h2 className="yge-s-title yge-reveal" ref={addRevealRef}><span>潜在</span>订单簿</h2>
          <div className="yge-s-title-sub yge-reveal" ref={addRevealRef}>Le carnet de commandes potentiel de YCIH</div>

          <div className="yge-table-scroll yge-reveal" ref={addRevealRef}>
            <table className="yge-projects-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>装机容量</th>
                  <th>估算成本</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div className="yge-td-proj">布韦水电站</div></td>
                  <td><span className="yge-td-mw">300 MW</span></td>
                  <td className="yge-td-cost">~800 M€ (~525 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-strategic">战略性</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">普巴拉—利伯维尔超高压输电线（800公里）</div></td>
                  <td><span className="yge-td-mw">160 MW</span><br /><small style={{color:'rgba(232,226,214,0.45)',fontSize:'.7rem'}}>释放</small></td>
                  <td className="yge-td-cost">150–250 Mds FCFA</td>
                  <td><span className="yge-tag yge-tag-urgent">绝对紧迫</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">利伯维尔燃气电站（河口省）</div></td>
                  <td><span className="yge-td-mw">500–600 MW</span></td>
                  <td className="yge-td-cost">~500–600 M$ (~330 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-urgent">优先级一</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">让蒂尔港燃气电站</div></td>
                  <td><span className="yge-td-mw">200–300 MW</span></td>
                  <td className="yge-td-cost">~200–300 M$</td>
                  <td><span className="yge-tag yge-tag-strategic">工业配套</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">南部极点燃气电站（马永巴—莫安达）</div></td>
                  <td><span className="yge-td-mw">200 MW</span></td>
                  <td className="yge-td-cost">~200 M$</td>
                  <td><span className="yge-tag yge-tag-ppp">矿业与港口</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">金格雷下游水电站（PPP项目进行中）</div></td>
                  <td><span className="yge-td-mw">35 MW</span></td>
                  <td className="yge-td-cost">Meridiam/FGIS</td>
                  <td><span className="yge-tag yge-tag-ppp">2026年交付</span></td>
                </tr>
                <tr>
                  <td><div className="yge-td-proj">利伯维尔供水管网改造（PEPPAL+苏伊士）</div></td>
                  <td><span className="yge-td-mw">—</span></td>
                  <td className="yge-td-cost">200 M€ (~131 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-ppp">PPP进行中</span></td>
                </tr>
                <tr style={{background:'rgba(212,169,53,.04)'}}>
                  <td><div className="yge-td-proj" style={{color:'#F0C84A',fontWeight:600}}>YCIH潜在总规模</div></td>
                  <td><span className="yge-td-mw" style={{color:'#F0C84A'}}>1 400+ MW</span></td>
                  <td className="yge-td-cost" style={{color:'#F0C84A',fontWeight:500}}>~2–2,5 Mds $ (1 300–1 650 Mds FCFA)</td>
                  <td><span className="yge-tag yge-tag-strategic">市场开放</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="yge-proj-cards">
            {[
              { name:'布韦水电站', mw:'300 MW', cost:'~800 M€', tag:'战略性', cls:'yge-tag-strategic' },
              { name:'超高压输电干线（800公里）', mw:'160 MW', cost:'150–250 Mds FCFA', tag:'绝对紧迫', cls:'yge-tag-urgent' },
              { name:'利伯维尔燃气电站', mw:'500–600 MW', cost:'~500–600 M$', tag:'优先级一', cls:'yge-tag-urgent' },
              { name:'让蒂尔港燃气电站', mw:'200–300 MW', cost:'~200–300 M$', tag:'工业配套', cls:'yge-tag-strategic' },
              { name:'南部极点燃气电站', mw:'200 MW', cost:'~200 M$', tag:'矿业与港口', cls:'yge-tag-ppp' },
              { name:'金格雷下游水电站', mw:'35 MW', cost:'Meridiam/FGIS', tag:'2026年交付', cls:'yge-tag-ppp' },
              { name:'供水管网改造', mw:'—', cost:'200 M€', tag:'PPP进行中', cls:'yge-tag-ppp' },
              { name:'YCIH潜在总规模', mw:'1 400+ MW', cost:'~2–2,5 Mds $', tag:'市场开放', cls:'yge-tag-strategic' },
            ].map((p, i) => (
              <div className="yge-proj-card" key={i} style={i === 7 ? {borderColor:'rgba(212,169,53,.3)'} : {}}>
                <div className="yge-proj-card-name" style={i === 7 ? {color:'#F0C84A'} : {}}>{p.name}</div>
                <div className="yge-proj-card-row"><span>装机容量</span><span className="yge-td-mw" style={{fontSize:'.9rem'}}>{p.mw}</span></div>
                <div className="yge-proj-card-row"><span>成本</span><span>{p.cost}</span></div>
                <div style={{marginTop:8}}><span className={`yge-tag ${p.cls}`}>{p.tag}</span></div>
              </div>
            ))}
          </div>
        </section>

        <hr className="yge-divider" />

        {/* URGENCY BANNER */}
        <div className="yge-urgency yge-reveal" ref={addRevealRef}>
          <div>
            <div className="yge-ub-eyebrow">紧急警示 — 2026年3月</div>
            <div className="yge-ub-title">卡帕瓦希普切断150兆瓦供电。<br />加蓬需要立即解决方案。</div>
            <div className="yge-ub-title-sub">Karpowership coupe 150 MW. Le Gabon a besoin d'une solution maintenant.</div>
            <p className="yge-ub-body">在2026年3月17日的官方函件中，土耳其运营商通知暂停向利伯维尔南部供应150兆瓦电力。加蓬国家陷入支付违约。此刻，一个有实力、有资本的替代合作伙伴的窗口已然开启。<strong>云南建投恰逢其时。</strong></p>
          </div>
          <div className="yge-ub-nums">
            <div>
              <span className="yge-ub-n">150</span>
              <span className="yge-ub-l">兆瓦断供</span>
            </div>
            <div>
              <span className="yge-ub-n">15</span>
              <span className="yge-ub-l">亿法郎欠款</span>
            </div>
            <div>
              <span className="yge-ub-n">2M</span>
              <span className="yge-ub-l">加蓬居民受影响</span>
            </div>
          </div>
        </div>

        <hr className="yge-divider" />

        {/* PITCH YCIH */}
        <section className="yge-pitch-section yge-section">
          <div className="yge-pitch-inner">
            <div className="yge-pitch-header yge-reveal" ref={addRevealRef}>
              <div className="yge-pitch-badge">价值主张 — 云南建投在加蓬</div>
              <h2 className="yge-pitch-title">为何<span>云南建投</span><br />是最优解</h2>
              <div className="yge-pitch-title-sub">Pourquoi YCIH est la solution optimale aux défis énergétiques du Gabon</div>
            </div>

            <div className="yge-pitch-grid yge-reveal" ref={addRevealRef}>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🏔️</span>
                <div className="yge-pitch-card-h">经过验证的水电专业能力</div>
                <div className="yge-pitch-card-h-sub">Expertise hydroélectrique éprouvée</div>
                <p className="yge-pitch-card-body">云南建投联合开发了老挝万象赛色塔特区（11.5平方公里，1.28亿美元资本），在与加蓬生态环境相似的热带地区建设过水坝、电站和电网。</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🏛️</span>
                <div className="yge-pitch-card-h">国有企业，对话国家级主体</div>
                <div className="yge-pitch-card-h-sub">Acteur étatique face à un projet souverain</div>
                <p className="yge-pitch-card-body">作为云南省属国有企业（省国资委监管），云南建投天然适合承接敏感的主权项目，能够对接国家开发银行、进出口银行等优惠融资，利率远低于私人市场的8-9%。</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">⚙️</span>
                <div className="yge-pitch-card-h">模块化与精密工程</div>
                <div className="yge-pitch-card-h-sub">Solutions modulaires & ingénierie de précision</div>
                <p className="yge-pitch-card-body">视频建议采用40-125兆瓦模块化机组以避免单点故障——这正是云南建投钢构公司及其子公司的核心专长：复杂冗余能源系统的设计、制造与组装。</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🌍</span>
                <div className="yge-pitch-card-h">通过YOIC布局非洲</div>
                <div className="yge-pitch-card-h-sub">Expansion africaine via la filiale YOIC</div>
                <p className="yge-pitch-card-body">YOIC（云南省海外投资公司）已在东南亚全面展开。中部非洲是下一个逻辑前沿——加蓬作为中非经货共同体的门户，是将云南建投能力部署至整个刚果盆地的理想枢纽。</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">💰</span>
                <div className="yge-pitch-card-h">主权优惠融资</div>
                <div className="yge-pitch-card-h-sub">Avantage des prêts concessionnels chinois</div>
                <p className="yge-pitch-card-body">苏伊士以8.15%利率贷款15年：2亿欧元投资最终偿还3.45亿欧元。云南建投可通过中国进出口银行以2-4%优惠利率融资，大幅减轻加蓬主权债务负担。</p>
              </div>
              <div className="yge-pitch-card">
                <span className="yge-pitch-card-icon">🤝</span>
                <div className="yge-pitch-card-h">特区模式——交钥匙工程</div>
                <div className="yge-pitch-card-h-sub">Modèle de zone économique spéciale clé en main</div>
                <p className="yge-pitch-card-body">将万象赛色塔模式复制到加蓬：一个集能源-供水-物流-工业于一体的综合特区。云南建投负责设计、融资、建设和运营；加蓬提供土地、特许权和政策稳定性，实现有据可查的双赢关系。</p>
              </div>
            </div>

            <div className="yge-reveal" ref={addRevealRef}><blockquote className="yge-blockquote">
              <p>「解决方案早已存在。技术研究已经完成，有据可查，有账可算，有资金可获。欠缺的只是平心静气的执行与持之以恒的坚守。」</p>
              <cite>— GSW频道分析 · 加蓬，2026年3月</cite>
            </blockquote></div>
          </div>
        </section>

        <hr className="yge-divider" />

        {/* 结论 */}
        <section className="yge-conclusion yge-section" style={{padding:80}}>
          <div className="yge-conclusion-inner yge-reveal" ref={addRevealRef}>
            <div className="yge-label">结论与行动呼吁</div>
            <h2 className="yge-s-title"><span>云南建投</span>的历史时刻，就是现在</h2>
            <div className="yge-s-title-sub" style={{marginBottom:32}}>La fenêtre stratégique est ouverte</div>

            <p className="yge-conclusion-body">
              加蓬能源危机是中部非洲记录最为详尽的危机之一。它不是宿命，而是一个亟待填补的工业真空。加蓬拥有史无前例的<strong>3321亿法郎2026年投资预算</strong>、奥利吉将军领导下明确的政治意愿，以及允许快速行动的<strong>议标采购程序</strong>。市场已然敞开，只缺一个值得信赖的合作伙伴。
            </p>
            <p className="yge-conclusion-body-sub">
              La crise énergétique du Gabon est l'une des mieux documentées d'Afrique centrale. Ce n'est pas une fatalité — c'est un vide industriel à combler.
            </p>

            <p className="yge-conclusion-body">
              <strong>云南建投具备一切所需：</strong>水电工程专业能力、主权融资实力、热带地区建设经验、交钥匙特区模式，以及国有企业的天然合法性。亲赴利伯维尔，就是将一场危机转变为世纪工程。
            </p>

            <div style={{marginTop:40}}>
              <a href="https://www.youtube.com/watch?v=3ShTO8fhqkg" target="_blank" rel="noopener noreferrer" className="yge-cta-btn outline">
                ▶ &nbsp;观看视频
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="yge-footer">
          <div className="yge-ft-brand">YCIH × 加蓬 <span style={{color:'rgba(232,226,214,0.45)',fontSize:'.75rem',fontFamily:"'DM Sans',sans-serif"}}>/ 云南建投 × Gabon</span></div>
          <div className="yge-ft-info">
            <div><strong>资料来源：</strong>YouTube GSW频道转录 · 加蓬PNDT 2024-2026 · 2026年财政法 · budget.gouv.ga</div>
            <div style={{marginTop:6,color:'rgba(212,169,53,.2)',fontSize:'.62rem'}}>由 Futur Sowax / Oh My Group 编制 · 利伯维尔，加蓬 · 2026年</div>
          </div>
        </footer>
      </div>
    </>
  );
}
