import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroHeart from '../assets/hero_heart.jpg';

// ─── Light-theme colour tokens ──────────────────────────────────
const C = {
    bg:           '#F7F9FC',          // cool off-white
    bgNav:        '#FFFFFF',
    bgCard:       '#FFFFFF',
    bgChip:       '#F0F4F8',
    bgMetric:     '#F0F4F8',
    border:       '#E2E8F0',
    borderTeal:   'rgba(8,145,178,0.25)',
    text:         '#0D1117',          // near-black
    textSub:      '#374151',
    textMuted:    '#6B7280',
    textDim:      '#9CA3AF',
    teal:         '#119BB8',
    tealLight:    'rgba(17,155,184,0.08)',
    tealBorder:   'rgba(17,155,184,0.2)',
    heartBg:      'transparent',
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: C.bg,
            overflowX: 'hidden',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: C.text,
        }}>

            {/* ── Google Fonts + scoped styles ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

                .lp-heading { font-family: 'Space Grotesk', 'Inter', sans-serif; }

                .lp-nav-link {
                    color: ${C.textMuted};
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.15s;
                    letter-spacing: 0.01em;
                }
                .lp-nav-link:hover { color: ${C.text}; }

                .lp-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: ${C.teal};
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 11px 22px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: background 0.15s, box-shadow 0.15s, transform 0.12s;
                    letter-spacing: 0.01em;
                }
                .lp-btn-primary:hover {
                    background: #0e7490;
                    box-shadow: 0 4px 18px rgba(8,145,178,0.22);
                    transform: translateY(-1px);
                }

                .lp-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: ${C.tealLight};
                    border: 1px solid ${C.tealBorder};
                    border-radius: 6px;
                    padding: 5px 13px;
                    font-size: 11.5px;
                    color: ${C.teal};
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .lp-metric {
                    background: ${C.bgMetric};
                    border: 1px solid ${C.border};
                    border-radius: 10px;
                    padding: 14px 16px;
                    min-width: 134px;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .lp-metric:hover {
                    border-color: ${C.borderTeal};
                    box-shadow: 0 2px 12px rgba(8,145,178,0.08);
                }

                /* heart — no dark frame; image's white bg dissolves via multiply */
                .lp-heart-frame {
                    position: relative;
                    border-radius: 0;
                    overflow: visible;
                    border: none;
                    box-shadow: none;
                    background: transparent;
                    line-height: 0;
                }

                .lp-heart-img {
                    display: block;
                    width: 100%;
                    max-width: 500px;
                    height: auto;
                    animation: lpHeartFloat 5s ease-in-out infinite;
                    /* multiply: near-white img bg disappears into the page bg */
                    mix-blend-mode: multiply;
                    /* soft drop-shadow gives the heart depth without a box */
                    filter: drop-shadow(0 24px 40px rgba(80,40,20,0.13))
                            drop-shadow(0 6px 16px rgba(17,155,184,0.10));
                }

                /* overlay chips — light bg friendly */
                .lp-overlay-chip {
                    position: absolute;
                    background: rgba(255,255,255,0.88);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(17,155,184,0.2);
                    border-radius: 7px;
                    padding: 7px 13px;
                    color: #0D1117;
                    font-size: 11.5px;
                    font-family: 'Inter', sans-serif;
                    white-space: nowrap;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
                }

                @keyframes lpFadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes lpFadeRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes lpHeartFloat {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-10px); }
                }

                .lp-left  { animation: lpFadeUp    0.65s ease both; }
                .lp-right { animation: lpFadeRight  0.85s ease both; }

                @media (max-width: 880px) {
                    .lp-hero-grid { grid-template-columns: 1fr !important; }
                    .lp-right { margin-top: 40px; }
                }
            `}</style>

            {/* ── NAV ─────────────────────────────────────────────── */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 48px',
                height: '64px',
                background: C.bgNav,
                borderBottom: `1px solid ${C.border}`,
                position: 'sticky',
                top: 0,
                zIndex: 30,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                        <path d="M16 3L3 9v7c0 7.18 5.58 13.89 13 15 7.42-1.11 13-7.82 13-15V9L16 3z"
                              fill="none" stroke={C.teal} strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M9 16h4l2-4 2 8 2-4h2"
                              stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="lp-heading" style={{ fontSize: '16px', fontWeight: 700, color: C.text, letterSpacing: '-0.2px' }}>
                        MEDISUM
                    </span>
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {['Product', 'Solutions', 'About'].map(item => (
                        <a key={item} href="#" className="lp-nav-link">{item}</a>
                    ))}
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'none', border: 'none',
                            color: C.textMuted, fontSize: '14px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
                        Login
                    </button>
                    <button className="lp-btn-primary" onClick={() => navigate('/dashboard')}>
                        Get started
                    </button>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────── */}
            <section
                className="lp-hero-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    padding: '0 48px',
                    gap: '64px',
                    maxWidth: '1280px',
                    margin: '0 auto',
                }}>

                {/* LEFT */}
                <div className="lp-left" style={{ paddingRight: '8px' }}>

                    <div className="lp-pill" style={{ marginBottom: '28px' }}>
                        <svg width="7" height="7" viewBox="0 0 10 10" fill={C.teal}>
                            <circle cx="5" cy="5" r="5"/>
                        </svg>
                        Clinical AI · BioClinicalBERT
                    </div>

                    <h1 className="lp-heading" style={{
                        fontSize: 'clamp(34px, 3.8vw, 56px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        color: C.text,
                        marginBottom: '20px',
                        letterSpacing: '-1.2px',
                    }}>
                        Intelligent Clinical
                        <br />
                        Notes,{' '}
                        <span style={{ color: C.teal }}>without</span>
                        <br />
                        the busywork.
                    </h1>

                    <p style={{
                        fontSize: '15.5px',
                        lineHeight: 1.72,
                        color: C.textSub,
                        marginBottom: '36px',
                        maxWidth: '460px',
                    }}>
                        Medisum extracts structured facts from clinical notes using BioClinicalBERT, then generates accurate discharge summaries — so clinicians can focus on patients, not paperwork.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <button className="lp-btn-primary" onClick={() => navigate('/dashboard')}>
                            Wellness Dashboard
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M7 17L17 7M17 7H7M17 7v10"/>
                            </svg>
                        </button>

                        {/* Accuracy chip */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: C.bgChip,
                            border: `1px solid ${C.border}`,
                            borderRadius: '8px',
                            padding: '9px 16px',
                        }}>
                            <span style={{ fontSize: '12px', color: C.textDim }}>Clinical Summary</span>
                            <div style={{ width: '1px', height: '14px', background: C.border }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>98% Accuracy</span>
                            <span style={{
                                fontSize: '11px', fontWeight: 700, color: C.teal,
                                background: C.tealLight, padding: '2px 7px', borderRadius: '4px',
                            }}>AI</span>
                        </div>
                    </div>

                    {/* Metric cards */}
                    <div style={{ marginTop: '52px' }}>
                        <p style={{
                            fontSize: '11px', color: C.textDim,
                            textTransform: 'uppercase', letterSpacing: '0.8px',
                            fontWeight: 600, marginBottom: '14px',
                        }}>
                            Live System Status
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <MetricCard label="BioClinicalBERT" value="Active" sub="NLP Extraction" teal={C.teal} />
                            <MetricCard label="Gemini AI" value="Online" sub="3.5 flash-lite" teal={C.teal} />
                            <MetricCard label="System Load" value="Low" sub="" teal={C.teal} isBar />
                        </div>
                    </div>

                    {/* Stat row */}
                    <div style={{ display: 'flex', gap: '36px', marginTop: '48px' }}>
                        <StatNum value="98%" label="AI Accuracy" text={C.text} muted={C.textDim} />
                        <StatNum value="500+" label="Active Users" text={C.text} muted={C.textDim} />
                    </div>
                </div>

                {/* RIGHT — Heart */}
                <div className="lp-right" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div className="lp-heart-frame">
                        <img
                            src={heroHeart}
                            alt="Clinical AI Heart Visualization"
                            className="lp-heart-img"
                        />

                        {/* Clinical data overlays — light chip style */}
                        <div className="lp-overlay-chip" style={{ top: '14%', left: '-12px' }}>
                            <span style={{ color: C.teal, fontWeight: 700 }}>● </span>
                            <span style={{ color: '#6B7280' }}>Heart Rate · </span>
                            <span style={{ fontWeight: 600, color: '#0D1117' }}>78 bpm</span>
                        </div>
                        <div className="lp-overlay-chip" style={{ bottom: '18%', left: '-12px' }}>
                            <span style={{ color: C.teal, fontWeight: 700 }}>● </span>
                            <span style={{ color: '#6B7280' }}>NLP Confidence · </span>
                            <span style={{ fontWeight: 600, color: '#0D1117' }}>96.4%</span>
                        </div>
                        <div className="lp-overlay-chip" style={{ bottom: '18%', right: '-12px' }}>
                            <span style={{ color: C.teal, fontWeight: 700 }}>● </span>
                            <span style={{ color: '#6B7280' }}>Facts extracted · </span>
                            <span style={{ fontWeight: 600, color: '#0D1117' }}>33</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TECH STRIP ──────────────────────────────────────── */}
            <div style={{
                borderTop: `1px solid ${C.border}`,
                background: C.bgNav,
                padding: '20px 48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
                maxWidth: '1280px',
                margin: '0 auto',
            }}>
                {['BioClinicalBERT', 'Google Gemini', 'Supabase', 'React', 'TypeScript', 'Node.js'].map(b => (
                    <span key={b} style={{
                        fontSize: '12px', fontWeight: 700,
                        color: C.textDim, letterSpacing: '0.6px', textTransform: 'uppercase',
                    }}>{b}</span>
                ))}
            </div>
        </div>
    );
};

// ── Sub-components ───────────────────────────────────────────────

const MetricCard: React.FC<{
    label: string; value: string; sub: string; teal: string; isBar?: boolean;
}> = ({ label, value, sub, teal, isBar }) => (
    <div className="lp-metric">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: teal, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
        {isBar ? (
            <div style={{ display: 'flex', gap: '3px', marginTop: '7px' }}>
                {[1, 1, 1, 0.2, 0.2].map((o, i) => (
                    <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: teal, opacity: o }} />
                ))}
            </div>
        ) : (
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{sub}</div>
        )}
    </div>
);

const StatNum: React.FC<{ value: string; label: string; text: string; muted: string }> = ({ value, label, text, muted }) => (
    <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: text, lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
        <div style={{ fontSize: '12px', color: muted, fontWeight: 500, marginTop: '3px' }}>{label}</div>
    </div>
);

export default LandingPage;
