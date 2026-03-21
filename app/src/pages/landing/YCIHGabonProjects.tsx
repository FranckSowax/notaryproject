import { useEffect, useRef } from 'react';

export function YCIHGabonProjects() {
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

        @keyframes ygp-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes ygp-star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .ygp-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .ygp-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #334155;
          line-height: 1.6;
          min-height: 100vh;
        }

        .ygp-header {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          height: 80px;
          padding: 0 2rem;
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
          width: 100%;
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
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #f59e0b, #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ygp-lang-switch {
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
          font-size: 0.875rem;
          transition: all 0.3s ease;
          text-decoration: none;
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

        .ygp-lang-btn:not(.active) {
          background: transparent;
          color: #94a3b8;
        }

        .ygp-lang-btn:hover:not(.active) {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .ygp-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .ygp-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .ygp-reveal:nth-child(2) { transition-delay: 0.1s; }
        .ygp-reveal:nth-child(3) { transition-delay: 0.2s; }
        .ygp-reveal:nth-child(4) { transition-delay: 0.3s; }
        .ygp-reveal:nth-child(5) { transition-delay: 0.4s; }

        /* Hero */
        .ygp-hero {
          background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
          background-size: 200% 200%;
          animation: ygp-gradient-shift 8s ease infinite;
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

        .ygp-hero-content { position: relative; z-index: 1; }

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
        }

        .ygp-card-header.ycih {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-top: 4px solid #2563eb;
        }

        .ygp-card-header.energy { background: linear-gradient(135deg, #f59e0b, #ea580c); }
        .ygp-card-header.mining { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .ygp-card-header.housing { background: linear-gradient(135deg, #10b981, #059669); }
        .ygp-card-header.road { background: linear-gradient(135deg, #14b8a6, #0891b2); }
        .ygp-card-header.rail { background: linear-gradient(135deg, #64748b, #475569); }
        .ygp-card-header.bay { background: linear-gradient(135deg, #06b6d4, #2563eb); }
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
          flex-shrink: 0;
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

        .ygp-card-body { padding: 2rem; }

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
          transform: scale(1.03);
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

        /* Matrix */
        .ygp-matrix-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 3rem 2rem;
          border-radius: 24px;
          margin: 3rem 0;
        }

        .ygp-matrix-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .ygp-matrix-table {
          width: 100%;
          min-width: 540px;
          border-collapse: collapse;
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .ygp-matrix-table th {
          background: #1e293b;
          color: white;
          padding: 1.25rem 1rem;
          text-align: center;
          font-weight: 600;
        }

        .ygp-matrix-table th:first-child { text-align: left; }

        .ygp-matrix-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          text-align: center;
          transition: background 0.2s ease;
        }

        .ygp-matrix-table td:first-child {
          text-align: left;
          font-weight: 600;
          color: #1e293b;
        }

        .ygp-matrix-table tr:nth-child(even) { background: #f8fafc; }
        .ygp-matrix-table tr:hover { background: #FFF7ED; }

        .ygp-stars {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          color: #fbbf24;
          font-size: 1.25rem;
        }

        .ygp-matrix-table tr:hover .ygp-stars span:not(.ygp-star-empty) {
          animation: ygp-star-pulse 0.6s ease;
        }

        .ygp-star-empty { color: #d1d5db; }

        /* Mobile matrix cards — hidden on desktop */
        .ygp-matrix-cards { display: none; }

        .ygp-matrix-card {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ygp-matrix-card-rank {
          flex-shrink: 0;
        }

        .ygp-matrix-card-info {
          flex: 1;
          min-width: 0;
        }

        .ygp-matrix-card-name {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }

        .ygp-matrix-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #64748b;
          padding: 0.2rem 0;
        }

        .ygp-matrix-card-row .ygp-stars {
          font-size: 0.85rem;
          justify-content: flex-end;
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
          font-size: 0.875rem;
        }

        .ygp-priority-badge.high { background: #f59e0b; box-shadow: 0 2px 8px rgba(245,158,11,0.4); }
        .ygp-priority-badge.medium { background: #3b82f6; box-shadow: 0 2px 8px rgba(59,130,246,0.4); }
        .ygp-priority-badge.low { background: #64748b; box-shadow: 0 2px 8px rgba(100,116,139,0.4); }

        /* Context */
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
          color: white;
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

        /* Package */
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

        /* Section title */
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

        /* Footer */
        .ygp-footer {
          background: #0f172a;
          color: #94a3b8;
          padding: 2rem;
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

        /* Focus-visible for accessibility */
        .ygp-page a:focus-visible,
        .ygp-page button:focus-visible,
        .ygp-page [tabindex]:focus-visible {
          outline: 2px solid #f59e0b;
          outline-offset: 2px;
        }

        /* Responsive — Mobile (<768px) */
        @media (max-width: 767px) {
          .ygp-header { height: auto; padding: 0.75rem 1rem; }
          .ygp-header-content { flex-direction: column; text-align: center; gap: 0.5rem; }
          .ygp-logo { font-size: 1.15rem; }
          .ygp-lang-switch { padding: 0.25rem; }
          .ygp-lang-btn { padding: 0.4rem 1rem; font-size: 0.8rem; }

          .ygp-hero { min-height: auto; padding: 2.5rem 1.25rem; border-radius: 0; margin-bottom: 1.5rem; }
          .ygp-hero h1 { font-size: 1.75rem; }
          .ygp-hero p { font-size: 1rem; }
          .ygp-hero-badge { font-size: 0.75rem; padding: 0.35rem 0.75rem; }
          .ygp-hero-tags { gap: 0.5rem; }
          .ygp-hero-tags span { font-size: 0.75rem; padding: 0.4rem 0.75rem; }

          .ygp-main { padding: 1rem; }

          .ygp-card { border-radius: 16px; margin-bottom: 1.25rem; }
          .ygp-card-header { padding: 1rem 1.25rem; }
          .ygp-card-header-content { gap: 0.75rem; }
          .ygp-card-icon { width: 48px; height: 48px; font-size: 1.5rem; border-radius: 12px; }
          .ygp-card-title h3 { font-size: 1.15rem; }
          .ygp-card-title p { font-size: 0.85rem; }
          .ygp-card-badges { margin-top: 0.5rem; }
          .ygp-card-badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
          .ygp-card-image { height: 180px; }
          .ygp-card-body { padding: 1.25rem; }
          .ygp-card-grid { grid-template-columns: 1fr; gap: 1rem; }
          .ygp-info-box { padding: 1.25rem; border-radius: 12px; }
          .ygp-info-box h4 { font-size: 0.9rem; }
          .ygp-info-box p { font-size: 0.85rem; line-height: 1.6; }
          .ygp-tags { gap: 0.4rem; margin-top: 1rem; padding-top: 1rem; }
          .ygp-tag { font-size: 0.75rem; padding: 0.35rem 0.75rem; }

          .ygp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .ygp-stat-item { padding: 1rem; }
          .ygp-stat-value { font-size: 32px; }
          .ygp-stat-label { font-size: 0.75rem; }

          .ygp-context-grid { grid-template-columns: 1fr; gap: 1rem; }
          .ygp-context-card { padding: 1.25rem; border-radius: 16px; }

          .ygp-matrix-section { padding: 1.5rem 1rem; border-radius: 16px; margin: 2rem 0; }
          .ygp-matrix-section h2 { font-size: 1.25rem; }
          .ygp-matrix-scroll { display: none; }
          .ygp-matrix-cards { display: block; }
          .ygp-priority-badge { width: 28px; height: 28px; font-size: 0.75rem; }

          .ygp-package-section { padding: 2rem 1.25rem; border-radius: 16px; margin: 2rem 0; }
          .ygp-package-grid { grid-template-columns: 1fr; gap: 1rem; }
          .ygp-package-card { padding: 1.5rem; border-radius: 16px; }
          .ygp-package-card h4 { font-size: 1.25rem; }
          .ygp-package-card h5 { font-size: 1rem; }
          .ygp-package-card p { font-size: 0.85rem; }

          .ygp-section-title h2 { font-size: 1.5rem; }
          .ygp-section-title p { font-size: 0.875rem; }

          .ygp-footer { padding: 1.5rem 1rem; }
          .ygp-footer-content { flex-direction: column; text-align: center; font-size: 0.85rem; }
        }

        /* Responsive — Tablet (768px - 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
          .ygp-hero { padding: 3rem 2rem; min-height: auto; }
          .ygp-hero h1 { font-size: 2.25rem; }

          .ygp-card-grid { grid-template-columns: repeat(2, 1fr); }
          .ygp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ygp-context-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
          .ygp-package-grid { grid-template-columns: 1fr; }

          .ygp-matrix-table th { padding: 1rem 0.5rem; font-size: 0.85rem; }
          .ygp-matrix-table td { padding: 0.85rem 0.5rem; }

          .ygp-card-image { height: 240px; }
        }
      `}</style>

      <div className="ygp-page">
        {/* Header */}
        <header className="ygp-header">
          <div className="ygp-header-content">
            <div className="ygp-logo">YCIH GABON PROJECTS</div>
            <div className="ygp-lang-switch">
              <span className="ygp-lang-btn active">Francais</span>
              <a href="/ycih/gabon/zh" className="ygp-lang-btn">中文</a>
            </div>
          </div>
        </header>

        <div className="ygp-main">
          {/* Hero */}
          <div className="ygp-hero">
            <div className="ygp-hero-content">
              <div className="ygp-hero-badge">Opportunites d'Investissement</div>
              <h1>6 Projets Structurants<br/><span>pour YCIH au Gabon</span></h1>
              <p>Analyse strategique des opportunites d'investissement identifiees sur le terrain. Chaque projet est autofinance, rentable et aligne avec les competences d'YCIH.</p>
              <div className="ygp-hero-tags">
                <div className="ygp-hero-tag">6 Projets Identifies</div>
                <div className="ygp-hero-tag">Partenariat Equilibre</div>
                <div className="ygp-hero-tag">Rentabilite Assuree</div>
              </div>
            </div>
          </div>

          {/* YCIH Card */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header ycih">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🏢</div>
                <div className="ygp-card-title">
                  <h3>YCIH : Un Partenaire de Reference</h3>
                  <p>Yunnan Construction Investment Holding Group</p>
                </div>
              </div>
            </div>
            <div className="ygp-card-body">
              <p style={{marginBottom:'1.5rem', color:'#64748b'}}><strong>Yunnan Construction Investment Holding Group (YCIH)</strong> est l'un des plus grands groupes de construction en Chine, classe <strong>143eme</strong> au classement ENR 2024 des plus grands entrepreneurs internationaux. Avec plus de <strong>40 ans d'experience a l'international</strong>, YCIH est present dans <strong>21 pays</strong> et a realise plus de <strong>300 projets</strong> a travers le monde.</p>
              <div className="ygp-stats-grid">
                <div className="ygp-stat-item"><div className="ygp-stat-value">40+</div><div className="ygp-stat-label">Annees d'experience internationale</div></div>
                <div className="ygp-stat-item"><div className="ygp-stat-value">21</div><div className="ygp-stat-label">Pays d'intervention</div></div>
                <div className="ygp-stat-item"><div className="ygp-stat-value">300+</div><div className="ygp-stat-label">Projets internationaux</div></div>
                <div className="ygp-stat-item"><div className="ygp-stat-value">8</div><div className="ygp-stat-label">Prix Luban a l'international</div></div>
              </div>
              <div className="ygp-info-box highlight">
                <h4>Reference cle</h4>
                <p>La <strong>Zone de Developpement Integre de Saysettha</strong> au Laos, seule zone economique nationale chinoise au Laos, couvrant 11,5 km2 avec 3,6 milliards USD d'investissements. Ce modele de partenariat Etat-YCIH (25%-75%) est directement transposable au Gabon.</p>
              </div>
            </div>
          </div>

          {/* Context Card */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header context">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🌍</div>
                <div className="ygp-card-title">
                  <h3>Contexte Strategique Gabonais</h3>
                  <p>PNCD "Gabon 2026-2030"</p>
                </div>
              </div>
            </div>
            <div className="ygp-card-body">
              <p style={{marginBottom:'1.5rem', color:'#64748b'}}>Le Gabon, sous la presidence de <strong>Brice Clotaire Oligui Nguema</strong>, est engage dans un plan ambitieux de diversification economique. Le gouvernement met l'accent sur l'<strong>attractivite des investissements etrangers</strong> et propose des partenariats equilibres, sans subventions mais avec des garanties institutionnelles solides.</p>
              <div className="ygp-context-grid">
                <div className="ygp-context-card energy">
                  <div className="ygp-context-icon">⚡</div>
                  <h4>Crise Energetique</h4>
                  <p>Delestages chroniques, SEEG en difficulte. Mission 300 BAD en avril 2026.</p>
                </div>
                <div className="ygp-context-card mining">
                  <div className="ygp-context-icon">⛰️</div>
                  <h4>Boom Minier</h4>
                  <p>Nyanga : nouveau coffre-fort minier avec 3 grands projets en gestation.</p>
                </div>
                <div className="ygp-context-card housing">
                  <div className="ygp-context-icon">🏠</div>
                  <h4>Deficit de Logements</h4>
                  <p>Demande de dizaines de milliers d'unites. Terrains publics disponibles.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section title */}
          <div className="ygp-section-title" style={{color:'white', margin:'3rem 0 2rem'}}>
            <h2 style={{color:'white'}}>Les 6 Opportunites d'Investissement</h2>
            <p style={{color:'#94a3b8'}}>Chaque projet presente un modele economique viable, autofinance et aligne avec les competences d'YCIH.</p>
          </div>

          {/* Project 1: Energy */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header energy">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">⚡</div>
                <div className="ygp-card-title">
                  <h3>Production d'electricite</h3>
                  <p>Centrales thermiques au gaz et hydroelectricite</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 1</span><span className="ygp-card-badge">Projet 1</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-1.jpeg" alt="Centrale hydroelectrique et thermique au Gabon" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>Crise energetique severe (delestages chroniques, SEEG en difficulte). Le gouvernement accueillera en avril 2026 la 'Mission 300' de la BAD a Libreville. Le pays possede d'importantes ressources gazieres et un potentiel hydroelectrique sous-exploite.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Developper un programme integre energie : centrales hydroelectriques dans les provinces interieures (coeur de metier YCIH) et infrastructures pour centrales thermiques a gaz. La filiale Yunnan Construction Investment & Installation (60+ ans d'expertise electromecanique) serait le bras operationnel.</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Le Gabon cherche activement des partenaires pour sa transition energetique. La BAD (Mission 300, SEFA) et la SFI offrent des mecanismes de co-financement. Le 'Pacte national energetique' fournit la garantie institutionnelle. Autofinancement via contrats IPP.</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Contrats EPC + exploitation en concession IPP avec vente d'electricite a la SEEG/Etat sur 20-25 ans. Modele similaire aux projets YCIH au Myanmar. Retour sur investissement garanti par la demande energetique insufflee.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Expertise hydroelectrique historique</span>
                <span className="ygp-tag">Co-financement BAD/SFI disponible</span>
                <span className="ygp-tag">Marche captif (delestages)</span>
                <span className="ygp-tag">Ressources gazieres locales</span>
              </div>
            </div>
          </div>

          {/* Project 2: Nyanga */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header mining">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">⛰️</div>
                <div className="ygp-card-title">
                  <h3>Zone Economique Speciale de la Nyanga</h3>
                  <p>Modele Saysettha replicable</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 2</span><span className="ygp-card-badge">Projet 2</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-2.jpeg" alt="Zone Economique Speciale de la Nyanga" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>Le President Oligui Nguema a recu personnellement les operateurs miniers de la Nyanga. La province est qualifiee de 'nouveau coffre-fort minier' et 'levier strategique de diversification'. Trois grands projets miniers (fer, marbre, potasse) sont en gestation.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Repliquer le modele Saysettha (Laos) en co-developpant une zone industrielle et miniere via YOIC. Infrastructures routieres, zone de transformation des minerais, logements ouvriers, equipements electromecaniques. Filiales Steel Structure et YCIH Installation mobilisables.</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Priorite nationale explicite. Joint-venture Etat gabonais (25-30%) / YCIH-YOIC (70-75%) sur le modele LCJV au Laos. Mise a disposition de terrains et facilitation administrative. Pas de subvention, mais partenariat equilibre.</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Revenus de gestion de zone (loyers, services), participation aux benefices miniers, construction des infrastructures. Reference : Saysettha avec 68+ entreprises et 360M$ d'investissements. Le potentiel minier de la Nyanga est comparable.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Modele Saysettha eprouve</span>
                <span className="ygp-tag">3 projets miniers en gestation</span>
                <span className="ygp-tag">Partenariat Etat/YCIH equilibre</span>
                <span className="ygp-tag">Potentiel de diversification</span>
              </div>
            </div>
          </div>

          {/* Project 3: Housing */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header housing">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🏠</div>
                <div className="ygp-card-title">
                  <h3>Programme de Logements Residentiels et Sociaux</h3>
                  <p>Mise a disposition de terrains par l'Etat</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 3</span><span className="ygp-card-badge">Projet 3</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-3.jpeg" alt="Programme de logements residentiels au Gabon" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>Deficit structurel de logements massif au Gabon, particulierement a Libreville, Port-Gentil et Franceville. Le gouvernement a fait du logement social une priorite du PNCD 2026-2030. Demande estimee a plusieurs dizaines de milliers d'unites.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Developper un programme national de logements via YCIH No. 2 Construction et le Yunnan Provincial Building Research Institute (754 brevets). Constructions modulaires et prefabriquees pour reduire couts et delais. Technologies vertes adaptees au climat equatorial.</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Mise a disposition de terrains publics par l'Etat gabonais pour les programmes de logements. Facilitation administrative et acceleration des autorisations. Pas de subvention directe, mais valorisation du foncier public. Partenariats avec banques locales pour financement hypothecaire.</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Promotion immobiliere avec marge de 15-25% sur programmes residentiels. Marche captif avec demande soutenue. Revenus recurrents via gestion immobiliere. Modele scalable sur l'ensemble du territoire. Rentabilite assuree par le deficit structurel.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Terrains publics disponibles</span>
                <span className="ygp-tag">Deficit de logements massif</span>
                <span className="ygp-tag">Technologie modulaire YCIH</span>
                <span className="ygp-tag">Marche captif et scalable</span>
              </div>
            </div>
          </div>

          {/* Project 4: Road */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header road">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🛣️</div>
                <div className="ygp-card-title">
                  <h3>Reprise de la Route Transgabonaise</h3>
                  <p>Opportunite EPC immediate</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 4</span><span className="ygp-card-badge">Projet 4</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-4.jpeg" alt="Route Transgabonaise a travers la foret equatoriale" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>L'entreprise indienne AFCONS Infrastructure, contractualisee pour plus de 600 milliards de FCFA (~915M EUR), semble sur le depart suite au changement de regime. Le chantier majeur est en suspens.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Se positionner comme nouvel operateur EPC pour la reprise du chantier via Southwest Communications Construction Group (specialisee transport) et Yunnan Engineering Construction General Contracting. YCIH dispose d'une experience eprouvee en construction routiere a grande echelle.</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Projet priorite presidentielle. Societe Autoroutiere du Gabon comme partenaire. Financement via China Development Bank et prets concessionnels BRI. Contrat existant a reprendre, negociations en cours avec AFCONS.</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Contrat EPC de plusieurs centaines de milliards de FCFA. Possibilite de concession autoroutiere (peage) sur le modele BOT sur 20-30 ans. Revenus garantis par le trafic routier croissant entre Libreville et l'interieur du pays.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Contrat existant a reprendre</span>
                <span className="ygp-tag">Priorite presidentielle</span>
                <span className="ygp-tag">Financement BRI disponible</span>
                <span className="ygp-tag">Modele BOT possible</span>
              </div>
            </div>
          </div>

          {/* Project 5: Rail */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header rail">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🚂</div>
                <div className="ygp-card-title">
                  <h3>Modernisation du Reseau Ferroviaire</h3>
                  <p>Transgabonais - Setrag</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 5</span><span className="ygp-card-badge">Projet 5</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-5.jpeg" alt="Modernisation du reseau ferroviaire Transgabonais" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>Importance strategique du Centre de Gestion des Circulations (CGC) et besoins de modernisation du reseau reliant les zones minieres au port d'Owendo. Exigences accrues de competitivite, securite et regularite.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Programme de modernisation ferroviaire : rehabilitation des voies, systemes de signalisation, gares et infrastructures. Yunnan Provincial Building Research Institute detient des innovations en systemes de fixation ferroviaire.</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Le Transgabonais est gere par la Setrag (filiale d'Eramet). Partenariat tripartite Etat-Setrag-YCIH possible. Financement via prets chinois a taux preferentiel (BRI). Trafic ferroviaire croissant (manganese, bois, minerais de la Nyanga).</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Contrats d'ingenierie et de construction a forte valeur ajoutee. Fourniture d'equipements YCIH (fixations ferroviaires, structures metalliques). Viabilite economique garantie par l'augmentation du trafic minier.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Innovations YCIH en fixation ferroviaire</span>
                <span className="ygp-tag">Partenariat Setrag</span>
                <span className="ygp-tag">Trafic minier croissant</span>
                <span className="ygp-tag">Terrain montagneux similaire au Yunnan</span>
              </div>
            </div>
          </div>

          {/* Project 6: Bay */}
          <div className="ygp-card ygp-reveal" ref={addRevealRef}>
            <div className="ygp-card-header bay">
              <div className="ygp-card-header-content">
                <div className="ygp-card-icon">🏙️</div>
                <div className="ygp-card-title">
                  <h3>Amenagement de la Baie des Rois</h3>
                  <p>Projet phare de Libreville</p>
                  <div className="ygp-card-badges"><span className="ygp-card-badge">Priorite 6</span><span className="ygp-card-badge">Projet 6</span></div>
                </div>
              </div>
            </div>
            <div className="ygp-card-image">
              <img src="/images/projets/projet-6.jpeg" alt="Amenagement de la Baie des Rois a Libreville" />
            </div>
            <div className="ygp-card-body">
              <div className="ygp-card-grid">
                <div className="ygp-info-box highlight"><h4>Signal d'Opportunite</h4><p>Le Ministre du Tourisme a effectue une visite du projet d'amenagement urbain de la Baie des Rois. Budget 2026 d'Owendo porte a 6,2 milliards FCFA pour accelerer les infrastructures.</p></div>
                <div className="ygp-info-box"><h4>Proposition YCIH</h4><p>Se positionner comme developpeur-constructeur : front de mer, equipements culturels et touristiques, complexes commerciaux et residentiels. Expertise YCIH dans les projets mixtes (reference : Yunnan Culture & Arts Center, laureat Prix Luban).</p></div>
                <div className="ygp-info-box"><h4>Accompagnement Etatique</h4><p>Projet de prestige pour le gouvernement de transition. Cadre PPP avec la Mairie de Libreville et le Ministere du Tourisme. Mise a disposition de terrains strategiques en bord de mer.</p></div>
                <div className="ygp-info-box highlight"><h4>Rentabilite</h4><p>Revenus de promotion immobiliere, gestion d'actifs commerciaux, exploitation touristique. Projet de vitrine renforcant la notoriete YCIH en Afrique centrale. Potentiel de valorisation immobiliere exceptionnel.</p></div>
              </div>
              <div className="ygp-tags">
                <span className="ygp-tag">Projet de prestige gouvernemental</span>
                <span className="ygp-tag">Site strategique bord de mer</span>
                <span className="ygp-tag">Expertise projets mixtes YCIH</span>
                <span className="ygp-tag">Potentiel de notoriete regionale</span>
              </div>
            </div>
          </div>

          {/* Priority Matrix */}
          <div className="ygp-matrix-section ygp-reveal" ref={addRevealRef}>
            <div className="ygp-section-title">
              <h2>Matrice de Priorisation</h2>
              <p>Evaluation comparative des projets selon trois criteres cles</p>
            </div>
            {/* Desktop table */}
            <div className="ygp-matrix-scroll">
              <table className="ygp-matrix-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Competence YCIH</th>
                    <th>Soutien Etatique</th>
                    <th>Rentabilite</th>
                    <th>Priorite</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Energie (hydro + gaz)</td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★★</div></td><td><span className="ygp-priority-badge high">1</span></td></tr>
                  <tr><td>ZES Nyanga (mines)</td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★<span className="ygp-star-empty">★</span></div></td><td><span className="ygp-priority-badge high">2</span></td></tr>
                  <tr><td>Logements residentiels</td><td><div className="ygp-stars">★★★★<span className="ygp-star-empty">★</span></div></td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★<span className="ygp-star-empty">★</span></div></td><td><span className="ygp-priority-badge medium">3</span></td></tr>
                  <tr><td>Transgabonaise (route)</td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★★</div></td><td><div className="ygp-stars">★★★★★</div></td><td><span className="ygp-priority-badge medium">4</span></td></tr>
                  <tr><td>Ferroviaire</td><td><div className="ygp-stars">★★★★<span className="ygp-star-empty">★</span></div></td><td><div className="ygp-stars">★★★<span className="ygp-star-empty">★★</span></div></td><td><div className="ygp-stars">★★★<span className="ygp-star-empty">★★</span></div></td><td><span className="ygp-priority-badge low">5</span></td></tr>
                  <tr><td>Baie des Rois</td><td><div className="ygp-stars">★★★★<span className="ygp-star-empty">★</span></div></td><td><div className="ygp-stars">★★★<span className="ygp-star-empty">★★</span></div></td><td><div className="ygp-stars">★★★<span className="ygp-star-empty">★★</span></div></td><td><span className="ygp-priority-badge low">6</span></td></tr>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="ygp-matrix-cards">
              {[
                { name: 'Energie (hydro + gaz)', comp: '★★★★★', soutien: '★★★★★', rent: '★★★★★', p: 1, cls: 'high' },
                { name: 'ZES Nyanga (mines)', comp: '★★★★★', soutien: '★★★★★', rent: '★★★★☆', p: 2, cls: 'high' },
                { name: 'Logements residentiels', comp: '★★★★☆', soutien: '★★★★★', rent: '★★★★☆', p: 3, cls: 'medium' },
                { name: 'Transgabonaise (route)', comp: '★★★★★', soutien: '★★★★★', rent: '★★★★★', p: 4, cls: 'medium' },
                { name: 'Ferroviaire', comp: '★★★★☆', soutien: '★★★☆☆', rent: '★★★☆☆', p: 5, cls: 'low' },
                { name: 'Baie des Rois', comp: '★★★★☆', soutien: '★★★☆☆', rent: '★★★☆☆', p: 6, cls: 'low' },
              ].map((item) => (
                <div className="ygp-matrix-card" key={item.p}>
                  <div className="ygp-matrix-card-rank">
                    <span className={`ygp-priority-badge ${item.cls}`}>{item.p}</span>
                  </div>
                  <div className="ygp-matrix-card-info">
                    <div className="ygp-matrix-card-name">{item.name}</div>
                    <div className="ygp-matrix-card-row"><span>Competence</span><span className="ygp-stars">{item.comp}</span></div>
                    <div className="ygp-matrix-card-row"><span>Soutien</span><span className="ygp-stars">{item.soutien}</span></div>
                    <div className="ygp-matrix-card-row"><span>Rentabilite</span><span className="ygp-stars">{item.rent}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Section */}
          <div className="ygp-package-section ygp-reveal" ref={addRevealRef}>
            <div className="ygp-section-title" style={{color:'white'}}>
              <h2 style={{color:'white'}}>Package Integre "Gabon-Yunnan"</h2>
              <p style={{color:'#94a3b8'}}>Ces six projets forment un ecosysteme coherent dans le cadre de la Belt & Road Initiative</p>
            </div>
            <div className="ygp-package-grid">
              <div className="ygp-package-card">
                <div className="ygp-package-icon" style={{background:'linear-gradient(135deg, #f59e0b, #ea580c)'}}>⚡</div>
                <h4 style={{color:'#fbbf24'}}>#1 Energie</h4>
                <h5>Priorite Immediate</h5>
                <p>ADN hydroelectrique d'YCIH. Repond a l'urgence nationale. Co-financement BAD/SFI disponible.</p>
              </div>
              <div className="ygp-package-card">
                <div className="ygp-package-icon" style={{background:'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>⛰️</div>
                <h4 style={{color:'#60a5fa'}}>#2 Nyanga</h4>
                <h5>Diversification</h5>
                <p>Modele Saysettha eprouve. 3 projets miniers en gestation. Partenariat Etat/YCIH equilibre.</p>
              </div>
              <div className="ygp-package-card">
                <div className="ygp-package-icon" style={{background:'linear-gradient(135deg, #10b981, #059669)'}}>🏠</div>
                <h4 style={{color:'#34d399'}}>#3 Logements</h4>
                <h5>Impact Social</h5>
                <p>Terrains publics disponibles. Marche captif. Technologie modulaire YCIH.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="ygp-footer">
          <div className="ygp-footer-content">
            <div>
              <strong style={{color:'white'}}>YCIH Gabon Projects</strong>
              <p style={{marginTop:'0.5rem'}}>Analyse strategique pour YCIH</p>
            </div>
            <div>Mars 2026</div>
          </div>
        </footer>
      </div>
    </>
  );
}
