import { useEffect, useRef } from 'react';

export function YCIHGabonProjectsZH() {
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #334155;
            line-height: 1.6;
        }

        /* Header */
        .ygp-header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            padding: 0 2rem;
            height: 80px;
            display: flex;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            backdrop-filter: blur(12px);
        }

        .ygp-header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .ygp-logo {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(90deg, #f59e0b, #ea580c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 0.5px;
        }

        .ygp-lang-switcher {
            display: flex;
            gap: 0.5rem;
            background: rgba(255,255,255,0.1);
            padding: 0.5rem;
            border-radius: 12px;
        }

        .ygp-lang-btn {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            background: transparent;
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.875rem;
        }

        .ygp-lang-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .ygp-lang-btn:focus-visible {
            outline: 2px solid #f59e0b;
            outline-offset: 2px;
        }

        .ygp-lang-btn.active {
            background: linear-gradient(135deg, #f59e0b, #ea580c);
            color: white;
            box-shadow: 0 2px 8px rgba(245,158,11,0.4);
        }

        .ygp-lang-btn:hover:not(.active) {
            background: rgba(255,255,255,0.1);
            color: white;
        }

        /* Main Content */
        .ygp-main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        @keyframes ygpFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ygpGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Hero */
        .ygp-hero {
            background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
            background-size: 200% 200%;
            animation: ygpGradientShift 8s ease infinite;
            color: white;
            min-height: 100vh;
            padding: 4rem 2rem;
            border-radius: 24px;
            margin-bottom: 3rem;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        .ygp-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
            border-radius: 50%;
        }

        .ygp-hero::after {
            content: '';
            position: absolute;
            bottom: -50%;
            left: -20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%);
            border-radius: 50%;
        }

        .ygp-hero-content {
            position: relative;
            z-index: 1;
        }

        .ygp-hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(245,158,11,0.2);
            color: #fbbf24;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .ygp-hero h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .ygp-hero h1 span {
            background: linear-gradient(90deg, #fbbf24, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .ygp-hero p {
            font-size: 1.25rem;
            color: #94a3b8;
            max-width: 800px;
            margin-bottom: 2rem;
        }

        .ygp-hero-tags {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .ygp-hero-tag {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.1);
            padding: 0.75rem 1.25rem;
            border-radius: 12px;
            font-size: 0.875rem;
        }

        /* Cards */
        .ygp-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .ygp-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }

        .ygp-card-header {
            padding: 1.5rem 2rem;
            color: white;
            position: relative;
        }

        .ygp-card-header.energy { background: linear-gradient(135deg, #f59e0b, #ea580c); }
        .ygp-card-header.mining { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .ygp-card-header.housing { background: linear-gradient(135deg, #10b981, #059669); }
        .ygp-card-header.road { background: linear-gradient(135deg, #14b8a6, #0891b2); }
        .ygp-card-header.rail { background: linear-gradient(135deg, #64748b, #475569); }
        .ygp-card-header.bay { background: linear-gradient(135deg, #06b6d4, #2563eb); }
        .ygp-card-header.ycih { background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-top: 4px solid #3b82f6; }
        .ygp-card-header.context { background: linear-gradient(135deg, #f59e0b, #ea580c); }

        .ygp-card-image {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
        }

        .ygp-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .ygp-card:hover .ygp-card-image img {
          transform: scale(1.05);
        }

        .ygp-card-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, rgba(255,255,255,0.9), transparent);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .ygp-card-image { height: 200px; }
        }

        .ygp-card-header-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .ygp-card-icon {
            width: 64px;
            height: 64px;
            background: rgba(255,255,255,0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }

        .ygp-card-title h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .ygp-card-title p {
            opacity: 0.9;
            font-size: 1rem;
        }

        .ygp-card-badges {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }

        .ygp-card-badge {
            background: rgba(255,255,255,0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .ygp-card-body {
            padding: 2rem;
        }

        .ygp-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .ygp-info-box {
            padding: 1.75rem;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .ygp-info-box:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }

        .ygp-info-box.highlight {
            background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.1));
            border-color: rgba(245,158,11,0.3);
        }

        .ygp-info-box h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: #1e293b;
        }

        .ygp-info-box p {
            font-size: 0.9375rem;
            color: #64748b;
            line-height: 1.7;
        }

        .ygp-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
        }

        .ygp-tag {
            background: #f1f5f9;
            color: #475569;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ygp-tag:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        /* Stats */
        .ygp-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .ygp-stat-item {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            padding: 1.25rem;
            border-radius: 16px;
            text-align: center;
            transition: transform 0.2s ease;
        }

        .ygp-stat-item:hover {
            transform: scale(1.05);
        }

        .ygp-stat-value {
            font-size: 48px;
            font-weight: 800;
            color: #2563eb;
            line-height: 1;
        }

        .ygp-stat-label {
            font-size: 0.875rem;
            color: #64748b;
            margin-top: 0.5rem;
        }

        /* Matrix Table */
        .ygp-matrix-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 3rem 2rem;
            border-radius: 24px;
            margin: 3rem 0;
        }

        .ygp-matrix-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .ygp-matrix-table th {
            background: #1e293b;
            color: white;
            padding: 1.25rem 1rem;
            text-align: center;
            font-weight: 600;
        }

        .ygp-matrix-table th:first-child {
            text-align: left;
        }

        .ygp-matrix-table td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            text-align: center;
        }

        .ygp-matrix-table td:first-child {
            text-align: left;
            font-weight: 600;
            color: #1e293b;
        }

        .ygp-matrix-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .ygp-matrix-table tr:hover {
            background: #FFF7ED;
        }

        @keyframes ygpStarPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }

        .ygp-stars {
            display: flex;
            justify-content: center;
            gap: 0.25rem;
        }

        .ygp-star {
            color: #fbbf24;
            font-size: 1.25rem;
            transition: transform 0.2s ease;
        }

        .ygp-matrix-table tr:hover .ygp-star:not(.empty) {
            animation: ygpStarPulse 0.6s ease infinite;
        }

        .ygp-star.empty {
            color: #d1d5db;
        }

        .ygp-priority-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-weight: 700;
            color: white;
        }

        .ygp-priority-badge.high { background: #f59e0b; box-shadow: 0 2px 8px rgba(245,158,11,0.4); }
        .ygp-priority-badge.medium { background: #3b82f6; box-shadow: 0 2px 8px rgba(59,130,246,0.4); }
        .ygp-priority-badge.low { background: #64748b; box-shadow: 0 2px 8px rgba(100,116,139,0.4); }

        /* Package Section */
        .ygp-package-section {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 4rem 2rem;
            border-radius: 24px;
            margin: 3rem 0;
            position: relative;
            overflow: hidden;
        }

        .ygp-package-section::before {
            content: '';
            position: absolute;
            top: -30%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
            border-radius: 50%;
        }

        .ygp-package-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
            position: relative;
            z-index: 1;
        }

        .ygp-package-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .ygp-package-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .ygp-package-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            margin-bottom: 1rem;
        }

        .ygp-package-card h4 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .ygp-package-card h5 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            opacity: 0.9;
        }

        .ygp-package-card p {
            font-size: 0.9375rem;
            opacity: 0.7;
            line-height: 1.6;
        }

        /* Footer */
        .ygp-footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 2rem;
            text-align: center;
            margin-top: 3rem;
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .ygp-footer-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        /* Section Title */
        .ygp-section-title {
            text-align: center;
            margin-bottom: 2rem;
        }

        .ygp-section-title h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }

        .ygp-section-title p {
            color: #64748b;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Context Cards */
        .ygp-context-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .ygp-context-card {
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid;
        }

        .ygp-context-card.energy {
            background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.1));
            border-color: rgba(245,158,11,0.3);
        }

        .ygp-context-card.mining {
            background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(29,78,216,0.1));
            border-color: rgba(59,130,246,0.3);
        }

        .ygp-context-card.housing {
            background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1));
            border-color: rgba(16,185,129,0.3);
        }

        .ygp-context-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .ygp-context-card.energy .ygp-context-icon { background: #f59e0b; }
        .ygp-context-card.mining .ygp-context-icon { background: #3b82f6; }
        .ygp-context-card.housing .ygp-context-icon { background: #10b981; }

        .ygp-context-card h4 {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }

        .ygp-context-card p {
            font-size: 0.9375rem;
            color: #64748b;
        }

        /* Reveal animation */
        .ygp-reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .ygp-reveal:nth-child(2) { transition-delay: 0.1s; }
        .ygp-reveal:nth-child(3) { transition-delay: 0.2s; }
        .ygp-reveal:nth-child(4) { transition-delay: 0.3s; }
        .ygp-reveal:nth-child(5) { transition-delay: 0.4s; }
        .ygp-reveal:nth-child(6) { transition-delay: 0.5s; }

        /* Focus-visible accessibility */
        .ygp-card:focus-visible,
        .ygp-package-card:focus-visible,
        .ygp-tag:focus-visible,
        .ygp-hero-tag:focus-visible,
        .ygp-context-card:focus-visible {
            outline: 2px solid #f59e0b;
            outline-offset: 2px;
        }

        /* Responsive - Mobile */
        @media (max-width: 768px) {
            .ygp-hero h1 {
                font-size: 32px;
            }

            .ygp-hero {
                min-height: auto;
                padding: 16px;
            }

            .ygp-main-content {
                padding: 16px;
            }

            .ygp-card-grid {
                grid-template-columns: 1fr;
            }

            .ygp-stats-grid {
                grid-template-columns: 1fr;
            }

            .ygp-package-grid {
                grid-template-columns: 1fr;
            }

            .ygp-context-grid {
                grid-template-columns: 1fr;
            }

            .ygp-matrix-table {
                font-size: 0.875rem;
            }

            .ygp-matrix-table th,
            .ygp-matrix-table td {
                padding: 0.75rem 0.5rem;
            }

            .ygp-header-content {
                flex-direction: column;
                text-align: center;
            }
        }

        /* Responsive - Tablet */
        @media (min-width: 768px) and (max-width: 1024px) {
            .ygp-stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .ygp-package-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      {/* Header */}
      <header className="ygp-header">
        <div className="ygp-header-content">
          <div className="ygp-logo">YCIH GABON PROJECTS</div>
          <div className="ygp-lang-switcher">
            <span className="ygp-lang-btn active">中文</span>
            <a href="/ycih/gabon" className="ygp-lang-btn">FR</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ygp-main-content">
        {/* Hero */}
        <div className="ygp-hero ygp-reveal" ref={addRevealRef}>
          <div className="ygp-hero-content">
            <div className="ygp-hero-badge">加蓬投资机会</div>
            <h1>YCIH加蓬六大<br/><span>战略投资项目</span></h1>
            <p>基于实地调研的投资机遇战略分析。每个项目均可自负盈亏、收益可观，且与YCIH核心能力高度契合。</p>
            <div className="ygp-hero-tags">
              <div className="ygp-hero-tag">六大已识别项目</div>
              <div className="ygp-hero-tag">平衡合作模式</div>
              <div className="ygp-hero-tag">收益有保障</div>
            </div>
          </div>
        </div>

        {/* YCIH Card */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header ycih">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🏢</div>
              <div className="ygp-card-title">
                <h3>云南建投集团：值得信赖的合作伙伴</h3>
                <p>Yunnan Construction Investment Holding Group</p>
              </div>
            </div>
          </div>
          <div className="ygp-card-body">
            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
              <strong>云南省建设投资控股集团有限公司（YCIH/云南建投）</strong>是中国最大的建筑集团之一，在2024年ENR全球最大250家国际承包商排名中位列<strong>第143位</strong>，连续15年上榜。拥有<strong>40多年海外经营经验</strong>，业务遍及<strong>21个国家</strong>，完成了<strong>300多个国际工程项目</strong>。
            </p>

            <div className="ygp-stats-grid">
              <div className="ygp-stat-item">
                <div className="ygp-stat-value">40+</div>
                <div className="ygp-stat-label">年海外经营经验</div>
              </div>
              <div className="ygp-stat-item">
                <div className="ygp-stat-value">21</div>
                <div className="ygp-stat-label">个业务覆盖国家</div>
              </div>
              <div className="ygp-stat-item">
                <div className="ygp-stat-value">300+</div>
                <div className="ygp-stat-label">个国际工程项目</div>
              </div>
              <div className="ygp-stat-item">
                <div className="ygp-stat-value">8</div>
                <div className="ygp-stat-label">项境外鲁班奖</div>
              </div>
            </div>

            <div className="ygp-info-box highlight">
              <h4>标杆项目</h4>
              <p><strong>老挝万象赛色塔综合开发区</strong>，中国在老挝唯一的国家级境外经贸合作区，占地11.5平方公里，总投资36亿美元。这种国家-YCIH合作模式（25%-75%）可直接复制到加蓬。</p>
            </div>
          </div>
        </div>

        {/* Context Card */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header context">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🌍</div>
              <div className="ygp-card-title">
                <h3>加蓬战略背景</h3>
                <p>2026-2030国家发展计划</p>
              </div>
            </div>
          </div>
          <div className="ygp-card-body">
            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
              在<strong>布里斯·克洛泰尔·奥利吉·恩圭马</strong>总统领导下，加蓬正积极推进雄心勃勃的经济多元化计划（<strong>2026-2030国家发展计划</strong>）。政府高度重视<strong>吸引外国投资</strong>，提出平衡合作模式，无补贴但提供坚实的制度保障。
            </p>

            <div className="ygp-context-grid">
              <div className="ygp-context-card energy">
                <div className="ygp-context-icon">⚡</div>
                <h4>能源危机</h4>
                <p>频繁停电，SEEG公司困境。非洲开发银行300使命将于2026年4月启动。</p>
              </div>
              <div className="ygp-context-card mining">
                <div className="ygp-context-icon">⛰️</div>
                <h4>矿业繁荣</h4>
                <p>尼扬加：新矿业宝库，三大项目正在酝酿。</p>
              </div>
              <div className="ygp-context-card housing">
                <div className="ygp-context-icon">🏠</div>
                <h4>住房短缺</h4>
                <p>需求达数万套。公共土地可用。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="ygp-section-title ygp-reveal" ref={addRevealRef}>
          <h2>六大投资机会</h2>
          <p>每个项目均具备可行的经济模式、自负盈亏，且与YCIH核心能力高度契合。</p>
        </div>

        {/* Project 1: Energy */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header energy">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">⚡</div>
              <div className="ygp-card-title">
                <h3>电力生产项目</h3>
                <p>燃气热电站与水电站</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 1</span>
                  <span className="ygp-card-badge">项目 1</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-1.jpeg" alt="加蓬水电站和热电站" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>加蓬面临严重能源危机（频繁停电、SEEG公司陷入困境）。政府将于2026年4月在利伯维尔接待非洲开发银行「300使命」代表团。该国拥有丰富的天然气资源和未充分开发的水电潜力。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>开发综合能源项目：在各省建设水电站（YCIH核心业务）以及燃气热电站基础设施。云南建投安装公司（60多年机电专业经验）将作为运营主体。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>加蓬积极寻求能源转型合作伙伴。非洲开发银行（300使命、SEFA）和国际金融公司提供联合融资机制。《国家能源公约》提供制度保障。通过IPP合同实现自负盈亏。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>EPC合同+IPP特许经营运营，向SEEG/国家售电20-25年。模式与YCIH在缅甸项目类似（仰光和曼德勒太阳能）。能源需求旺盛保证投资回报。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">水电专业历史悠久</span>
              <span className="ygp-tag">非洲开发银行/国际金融公司联合融资</span>
              <span className="ygp-tag">市场刚需（停电问题）</span>
              <span className="ygp-tag">本地天然气资源</span>
            </div>
          </div>
        </div>

        {/* Project 2: Nyanga */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header mining">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">⛰️</div>
              <div className="ygp-card-title">
                <h3>尼扬加经济特区</h3>
                <p>可复制赛色塔模式</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 2</span>
                  <span className="ygp-card-badge">项目 2</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-2.jpeg" alt="尼扬加经济特区" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>恩圭马总统亲自接见尼扬加矿业运营商。该省被称为「新矿业宝库」和「经济多元化战略杠杆」。三大矿业项目（铁矿、大理石、钾盐）正在酝酿中。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>复制老挝赛色塔模式，通过YOIC子公司共同开发工业矿业特区。包括：道路基础设施、矿产加工区、工人住房、矿山机电设备。可调动钢结构和YCIH安装等子公司资源。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>国家明确优先发展。加蓬国家（25-30%）/YCIH-YOIC（70-75%）合资企业，参照老挝LCJV模式。提供土地和行政便利。无补贴，但合作平衡。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>园区管理收入（租金、服务）、矿业利润分成、基础设施建设。参考：赛色塔已入驻68+企业，投资3.6亿美元。尼扬加矿业潜力相当。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">赛色塔模式已验证</span>
              <span className="ygp-tag">三大矿业项目酝酿中</span>
              <span className="ygp-tag">国家/YCIH平衡合作</span>
              <span className="ygp-tag">多元化潜力</span>
            </div>
          </div>
        </div>

        {/* Project 3: Housing */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header housing">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🏠</div>
              <div className="ygp-card-title">
                <h3>住宅与社会住房项目</h3>
                <p>国家提供建设用地</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 3</span>
                  <span className="ygp-card-badge">项目 3</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-3.jpeg" alt="加蓬住宅开发项目" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>加蓬住房结构性短缺严重，特别是在利伯维尔、让蒂尔港和弗朗斯维尔。政府将社会住房列为2026-2030国家发展计划优先事项。需求估计达数万套。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>通过YCIH二建公司和云南省建筑科学研究院（754项专利）开发全国住房项目。模块化预制建筑降低成本和工期。适应赤道气候的绿色技术。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>加蓬国家提供公共建设用地用于住房项目。行政便利和审批加速。无直接补贴，但公共土地增值。与当地银行合作提供抵押贷款。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>房地产开发利润率15-25%。市场刚需需求旺盛。物业管理持续收入。模式可在全国推广。结构性短缺保证盈利。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">公共土地可用</span>
              <span className="ygp-tag">住房严重短缺</span>
              <span className="ygp-tag">YCIH模块化技术</span>
              <span className="ygp-tag">市场刚需可扩展</span>
            </div>
          </div>
        </div>

        {/* Project 4: Road */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header road">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🛣️</div>
              <div className="ygp-card-title">
                <h3>横贯加蓬公路接管与完工</h3>
                <p>EPC即时机遇</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 4</span>
                  <span className="ygp-card-badge">项目 4</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-4.jpeg" alt="横贯加蓬公路" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>印度AFCONS基础设施公司签约金额超过6000亿中非法郎（约9.15亿欧元），因政权更迭似乎即将退出。这一重大公路项目施工暂停。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>通过西南交通建设集团（交通专业）和云南工程建设总承包公司作为新EPC运营商接管项目。YCIH拥有大规模公路建设成熟经验。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>总统优先项目。加蓬高速公路公司为合作伙伴。国家开发银行和一带一路优惠贷款融资。现有合同可接管，与AFCONS谈判进行中。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>EPC合同金额数千亿中非法郎。可采用BOT模式（建设-运营-移交）经营高速公路20-30年。利伯维尔与内陆交通增长保证收入。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">现有合同可接管</span>
              <span className="ygp-tag">总统优先项目</span>
              <span className="ygp-tag">一带一路融资可用</span>
              <span className="ygp-tag">可采用BOT模式</span>
            </div>
          </div>
        </div>

        {/* Project 5: Rail */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header rail">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🚂</div>
              <div className="ygp-card-title">
                <h3>横贯加蓬铁路网现代化</h3>
                <p>横贯加蓬铁路-Setrag</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 5</span>
                  <span className="ygp-card-badge">项目 5</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-5.jpeg" alt="横贯加蓬铁路现代化" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>调度管理中心（CGC）战略重要性凸显，连接矿区与奥文多港的铁路网需要现代化。竞争力、安全性和准点率要求日益提高。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>铁路现代化计划：轨道修复、信号系统、车站及配套设施。云南省建筑科学研究院拥有铁路扣件系统创新技术。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>横贯加蓬铁路由Setrag（埃赫曼子公司）运营。可能建立国家-Setrag-YCIH三方合作。中国优惠贷款融资（一带一路）。铁路货运增长（锰、木材、尼扬加矿产）。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>高附加值工程合同。YCIH设备供应（铁路扣件、钢结构）。矿业货运增长保证经济可行性。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">YCIH铁路扣件创新</span>
              <span className="ygp-tag">Setrag合作</span>
              <span className="ygp-tag">矿业货运增长</span>
              <span className="ygp-tag">山地地形与云南相似</span>
            </div>
          </div>
        </div>

        {/* Project 6: Bay */}
        <div className="ygp-card ygp-reveal" ref={addRevealRef}>
          <div className="ygp-card-header bay">
            <div className="ygp-card-header-content">
              <div className="ygp-card-icon">🏙️</div>
              <div className="ygp-card-title">
                <h3>国王湾城市开发</h3>
                <p>利伯维尔旗舰项目</p>
                <div className="ygp-card-badges">
                  <span className="ygp-card-badge">优先级 6</span>
                  <span className="ygp-card-badge">项目 6</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ygp-card-image">
            <img src="/images/projets/projet-6.jpeg" alt="利伯维尔国王湾滨水开发" />
          </div>
          <div className="ygp-card-body">
            <div className="ygp-card-grid">
              <div className="ygp-info-box highlight">
                <h4>机遇信号</h4>
                <p>旅游部长视察国王湾城市开发项目。奥文多市2026年预算增至62亿中非法郎以加速基础设施建设。</p>
              </div>
              <div className="ygp-info-box">
                <h4>YCIH方案</h4>
                <p>作为开发商-建设商定位：海滨、文化及旅游设施、商业和住宅综合体。YCIH拥有综合体项目经验（参考：云南文化艺术中心，鲁班奖得主）。</p>
              </div>
              <div className="ygp-info-box">
                <h4>政府支持</h4>
                <p>过渡政府旗舰项目。可与利伯维尔市政府和旅游部建立PPP框架。提供海滨战略用地。</p>
              </div>
              <div className="ygp-info-box highlight">
                <h4>盈利能力</h4>
                <p>房地产开发收入、商业资产管理、旅游运营。提升YCIH在中非地区知名度的标杆项目。房地产增值潜力卓越。</p>
              </div>
            </div>
            <div className="ygp-tags">
              <span className="ygp-tag">政府旗舰项目</span>
              <span className="ygp-tag">海滨战略位置</span>
              <span className="ygp-tag">YCIH综合体项目经验</span>
              <span className="ygp-tag">区域知名度潜力</span>
            </div>
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="ygp-matrix-section ygp-reveal" ref={addRevealRef}>
          <div className="ygp-section-title">
            <h2>优先级矩阵</h2>
            <p>基于三大关键标准的项目对比评估</p>
          </div>
          <table className="ygp-matrix-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>YCIH契合度</th>
                <th>政府支持</th>
                <th>盈利能力</th>
                <th>优先级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>能源（水电+燃气）</td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><span className="ygp-priority-badge high">1</span></td>
              </tr>
              <tr>
                <td>尼扬加经济特区（矿业）</td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★<span className="ygp-star empty">★</span></div></td>
                <td><span className="ygp-priority-badge high">2</span></td>
              </tr>
              <tr>
                <td>住宅与社会住房</td>
                <td><div className="ygp-stars">★★★★<span className="ygp-star empty">★</span></div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★<span className="ygp-star empty">★</span></div></td>
                <td><span className="ygp-priority-badge medium">3</span></td>
              </tr>
              <tr>
                <td>横贯加蓬公路</td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><div className="ygp-stars">★★★★★</div></td>
                <td><span className="ygp-priority-badge medium">4</span></td>
              </tr>
              <tr>
                <td>铁路</td>
                <td><div className="ygp-stars">★★★★<span className="ygp-star empty">★</span></div></td>
                <td><div className="ygp-stars">★★★<span className="ygp-star empty">★★</span></div></td>
                <td><div className="ygp-stars">★★★<span className="ygp-star empty">★★</span></div></td>
                <td><span className="ygp-priority-badge low">5</span></td>
              </tr>
              <tr>
                <td>国王湾</td>
                <td><div className="ygp-stars">★★★★<span className="ygp-star empty">★</span></div></td>
                <td><div className="ygp-stars">★★★<span className="ygp-star empty">★★</span></div></td>
                <td><div className="ygp-stars">★★★<span className="ygp-star empty">★★</span></div></td>
                <td><span className="ygp-priority-badge low">6</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Package Section */}
        <div className="ygp-package-section ygp-reveal" ref={addRevealRef}>
          <div className="ygp-section-title" style={{ color: 'white' }}>
            <h2>「加蓬-云南」综合项目包</h2>
            <p style={{ color: '#94a3b8' }}>这六大项目在一带一路倡议框架下形成协同生态系统</p>
          </div>
          <div className="ygp-package-grid">
            <div className="ygp-package-card">
              <div className="ygp-package-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>⚡</div>
              <h4 style={{ color: '#fbbf24' }}>#1 能源</h4>
              <h5>最优先项目</h5>
              <p>YCIH水电基因。应对国家紧急需求。非洲开发银行/国际金融公司联合融资。</p>
            </div>
            <div className="ygp-package-card">
              <div className="ygp-package-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>⛰️</div>
              <h4 style={{ color: '#60a5fa' }}>#2 尼扬加</h4>
              <h5>多元化</h5>
              <p>赛色塔模式已验证。三大矿业项目酝酿中。国家/YCIH平衡合作。</p>
            </div>
            <div className="ygp-package-card">
              <div className="ygp-package-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>🏠</div>
              <h4 style={{ color: '#34d399' }}>#3 住房</h4>
              <h5>社会影响</h5>
              <p>公共土地可用。市场刚需。YCIH模块化技术。</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="ygp-footer">
        <div className="ygp-footer-content">
          <div>
            <strong style={{ color: 'white' }}>YCIH Gabon Projects</strong>
            <p style={{ marginTop: '0.5rem' }}>加蓬投资机会战略分析</p>
          </div>
          <div>
            2026年3月
          </div>
        </div>
      </footer>
    </>
  );
}
