// G · Splash — variants with wave/ripple texture in the largest tiles,
// plus the system applied to other screens.

// Shared G palette (single source of truth)
const G_DEEP = '#0d3a52';
const G_AQUA = '#37a3c4';
const G_SKY  = '#cfeaf3';
const G_CORAL = '#ff6f50';
const G_BG = '#eaf4f7';

// ────────────────────────────────────────────────────────────
// Texture generators — three takes on "ripples / waves, not surfing"
// ────────────────────────────────────────────────────────────

// G1 · Ripple: concentric arcs from one drop-point
const rippleBG = (base = G_AQUA) => ({
  background: `
    radial-gradient(circle at 85% 18%,
      transparent 0,
      rgba(255,255,255,0.10) 36px,
      transparent 38px,
      rgba(255,255,255,0.08) 72px,
      transparent 74px,
      rgba(255,255,255,0.06) 116px,
      transparent 118px,
      rgba(255,255,255,0.045) 168px,
      transparent 170px,
      rgba(255,255,255,0.03) 228px,
      transparent 230px,
      rgba(255,255,255,0.02) 296px,
      transparent 298px),
    ${base}
  `,
});

// G2 · Surface waves: horizontal sine pattern as SVG repeat
const wavesBG = (base = G_AQUA) => ({
  backgroundImage: `
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='28' viewBox='0 0 120 28'%3E%3Cpath d='M0 14 Q 30 4 60 14 T 120 14' stroke='rgba(255,255,255,0.18)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='28' viewBox='0 0 120 28'%3E%3Cpath d='M0 14 Q 30 24 60 14 T 120 14' stroke='rgba(255,255,255,0.10)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")
  `,
  backgroundRepeat: 'repeat',
  backgroundSize: '120px 28px, 120px 28px',
  backgroundPosition: '0 0, 60px 14px',
  backgroundColor: base,
});

// G3 · Depth: soft horizontal bands suggesting water layers
const depthBG = (base = G_AQUA) => ({
  background: `
    linear-gradient(180deg,
      rgba(255,255,255,0.00) 0%,
      rgba(255,255,255,0.10) 12%,
      rgba(255,255,255,0.00) 22%,
      rgba(255,255,255,0.06) 42%,
      rgba(255,255,255,0.00) 56%,
      rgba(255,255,255,0.09) 76%,
      rgba(255,255,255,0.00) 90%),
    ${base}
  `,
});

// ────────────────────────────────────────────────────────────
// Shared chrome for variant artboards (header + stats + result)
// ────────────────────────────────────────────────────────────
function GVariantShell({ name, blurb, heroStyle, demoNote }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: G_BG,
      padding: 32,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: G_DEEP,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5e7a8a' }}>
        <span>{name}</span>
        <span>{blurb}</span>
      </div>

      {/* Hero — with wave texture */}
      <div style={{
        marginTop: 22,
        ...heroStyle,
        border: `2px solid ${G_DEEP}`,
        borderRadius: 24,
        boxShadow: `5px 6px 0 ${G_DEEP}`,
        padding: '26px 28px 28px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', color: G_DEEP, padding: '5px 12px', borderRadius: 999,
          fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
          position: 'relative',
        }}>● Live now</span>
        <h1 style={{
          fontFamily: '"Instrument Serif", serif', fontWeight: 400,
          fontSize: 72, lineHeight: 1.0, letterSpacing: '-0.02em',
          margin: '14px 0 0',
          position: 'relative',
        }}>
          Valencia <span style={{
            background: G_CORAL,
            padding: '0 16px', borderRadius: 14,
            boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
            border: `2px solid ${G_DEEP}`,
            display: 'inline-block',
            lineHeight: 1.02,
          }}>2026</span>
        </h1>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 22, marginTop: 8, opacity: 0.95, position: 'relative' }}>
          Championship results
        </div>
      </div>

      {/* Stats — kept plain so texture only lives in the hero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 22 }}>
        {[
          { v: '1,842', k: 'Athletes', coral: false },
          { v: '34', k: 'Nations', coral: false },
          { v: '86', k: 'Clubs', coral: false },
          { v: '9', k: 'Records', coral: true },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.coral ? G_CORAL : 'white',
            color: s.coral ? 'white' : G_DEEP,
            border: `2px solid ${G_DEEP}`,
            borderRadius: 20,
            padding: '16px 16px 18px',
            boxShadow: `3px 4px 0 ${G_DEEP}`,
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 40, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Result */}
      <div style={{
        marginTop: 20,
        background: 'white',
        border: `2px solid ${G_DEEP}`,
        borderRadius: 16,
        boxShadow: `3px 4px 0 ${G_DEEP}`,
        padding: '16px 18px',
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto',
        gap: 14,
        alignItems: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: G_CORAL, border: `2px solid ${G_DEEP}`,
          display: 'grid', placeItems: 'center',
          fontFamily: '"Instrument Serif", serif', fontSize: 22, color: 'white',
        }}>1</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Diego Fonseca · 1500m Free</div>
          <div style={{ fontSize: 11.5, color: '#6e7a85' }}>Berlin Tritonen 🇩🇪 · Men 40-44</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 28 }}>17:48</div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, color: '#6e7a85' }}>.22</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 10, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        {demoNote}
      </div>
    </div>
  );
}

function DirGRipple() {
  return <GVariantShell
    name="G1 · Ripple"
    blurb="concentric arcs from one drop-point"
    heroStyle={rippleBG()}
    demoNote='"A stone dropped in. Quiet, deliberate."'
  />;
}

function DirGSurface() {
  return <GVariantShell
    name="G2 · Surface"
    blurb="gentle horizontal water-surface waves"
    heroStyle={wavesBG()}
    demoNote='"Looking down at the pool. Calm surface."'
  />;
}

function DirGDepth() {
  return <GVariantShell
    name="G3 · Depth"
    blurb="soft horizontal bands · atmospheric"
    heroStyle={depthBG()}
    demoNote='"Felt, not seen. Pure atmospheric depth."'
  />;
}

// ────────────────────────────────────────────────────────────
// G STYLE APPLIED TO OTHER SCREENS
// Using G2 · Surface waves for the big hero (most evocative).
// ────────────────────────────────────────────────────────────

// Shared mini chrome
function GTopBar({ active = 'Results' }) {
  const items = ['Clubs', 'Tournaments', 'Results', 'About'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px',
      background: 'white',
      border: `2px solid ${G_DEEP}`,
      borderRadius: 20,
      boxShadow: `3px 4px 0 ${G_DEEP}`,
      marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: G_AQUA, border: `2px solid ${G_DEEP}` }}></div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18 }}>
          IGLA<span style={{ color: G_CORAL }}>+</span> Records
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {items.map(i => (
          <span key={i} style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
            background: i === active ? G_DEEP : 'transparent',
            color: i === active ? 'white' : G_DEEP,
            border: i === active ? `2px solid ${G_DEEP}` : '2px solid transparent',
          }}>{i}</span>
        ))}
      </div>
    </div>
  );
}

// ─── CLUBS PAGE in G style ───
function GClubsScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: G_BG, padding: 22,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: G_DEEP, overflow: 'hidden',
    }}>
      <GTopBar active="Clubs" />

      {/* Hero with surface wave texture */}
      <div style={{
        ...wavesBG(),
        border: `2px solid ${G_DEEP}`,
        borderRadius: 22,
        boxShadow: `5px 6px 0 ${G_DEEP}`,
        padding: '22px 24px',
        color: 'white',
        marginBottom: 16,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: G_DEEP, padding: '4px 10px', borderRadius: 999, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          16 clubs · 11 countries
        </span>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 54, lineHeight: 1, letterSpacing: '-0.02em', margin: '10px 0 0' }}>
          Find your <span style={{ background: G_CORAL, padding: '0 14px', borderRadius: 12, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', border: `2px solid ${G_DEEP}`, display: 'inline-block', lineHeight: 1.04 }}>family</span>
        </h1>
      </div>

      {/* Region pill tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['All 16', 'Europe 7', 'N. America 4', 'Asia 2', 'Oceania 1', 'Africa 1'].map((r, i) => (
          <span key={r} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: i === 0 ? G_DEEP : 'white',
            color: i === 0 ? 'white' : G_DEEP,
            border: `2px solid ${G_DEEP}`,
          }}>{r}</span>
        ))}
      </div>

      {/* Club cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { f: '🇺🇸', n: 'West Hollywood Aquatics', city: 'Los Angeles', members: 218, accent: G_CORAL, gold: 14 },
          { f: '🇫🇷', n: 'À Contre-Courant', city: 'Paris', members: 184, accent: G_AQUA, gold: 11 },
          { f: '🇬🇧', n: 'London Out To Swim', city: 'London', members: 312, accent: G_AQUA, gold: 9 },
          { f: '🇩🇪', n: 'Berlin Tritonen', city: 'Berlin', members: 196, accent: G_AQUA, gold: 8 },
          { f: '🇸🇪', n: 'Stockholm Stingrays', city: 'Stockholm', members: 124, accent: G_AQUA, gold: 5 },
          { f: '🇯🇵', n: 'Tokyo Tritons', city: 'Tokyo', members: 108, accent: G_AQUA, gold: 3 },
        ].map((c, i) => (
          <div key={i} style={{
            background: 'white',
            border: `2px solid ${G_DEEP}`,
            borderRadius: 16,
            boxShadow: `3px 4px 0 ${G_DEEP}`,
            overflow: 'hidden',
          }}>
            <div style={{ height: 8, background: c.accent, borderBottom: `2px solid ${G_DEEP}` }}></div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 19, lineHeight: 1.05 }}>{c.n}</div>
                  <div style={{ fontSize: 10.5, color: '#6e7a85', marginTop: 2 }}>📍 {c.city}</div>
                </div>
                <span style={{ fontSize: 22 }}>{c.f}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1.5px dashed ${G_DEEP}33` }}>
                <div>
                  <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22 }}>{c.members}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e7a85' }}>Members</div>
                </div>
                <span style={{
                  background: G_CORAL, color: 'white',
                  padding: '3px 9px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  border: `1.5px solid ${G_DEEP}`,
                }}>{c.gold} G</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOURNAMENTS PAGE in G style ───
function GTournamentsScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: G_BG, padding: 22,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: G_DEEP, overflow: 'hidden',
    }}>
      <GTopBar active="Tournaments" />

      {/* Hero — next up card, with deeper aqua + surface waves */}
      <div style={{
        ...wavesBG(G_DEEP),
        border: `2px solid ${G_DEEP}`,
        borderRadius: 22,
        boxShadow: `5px 6px 0 ${G_DEEP}`,
        padding: '22px 24px 24px',
        color: 'white',
        marginBottom: 16,
        position: 'relative',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: G_DEEP, padding: '4px 10px', borderRadius: 999, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          Next up · 2027
        </span>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', margin: '10px 0 4px' }}>
          Montréal <span style={{ background: G_CORAL, padding: '0 14px', borderRadius: 12, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', border: `2px solid ${G_DEEP}`, display: 'inline-block', lineHeight: 1.04 }}>2027</span>
        </h1>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>🇨🇦 Jul 30 – Aug 5 · Parc Olympique</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.25)' }}>
          {[['1,500+', 'Athletes'], ['32', 'Nations'], ['70', 'Clubs']].map(([v, k]) => (
            <div key={k}>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 28, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, marginTop: 4 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { y: '2026', n: 'Valencia', f: '🇪🇸', co: 'Gay Games XII', status: 'live', stat: '1,842 · 34 · 86', rec: 9 },
          { y: '2025', n: 'Washington DC', f: '🇺🇸', co: 'IGLA+ Championship', status: 'past', stat: '1,214 · 26 · 58', rec: 6 },
          { y: '2024', n: 'Buenos Aires', f: '🇦🇷', co: 'IGLA+ Championship', status: 'past', stat: '980 · 22 · 47', rec: 4 },
          { y: '2023', n: 'London', f: '🇬🇧', co: 'IGLA+ Championship', status: 'past', stat: '1,108 · 28 · 62', rec: 7 },
        ].map((r, i) => (
          <div key={i} style={{
            background: 'white',
            border: `2px solid ${G_DEEP}`,
            borderRadius: 14,
            boxShadow: `3px 4px 0 ${G_DEEP}`,
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: '54px 1fr auto auto',
            gap: 14,
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, lineHeight: 1, color: r.status === 'live' ? G_CORAL : G_DEEP }}>{r.y}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.f} {r.n}</div>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 12, color: '#6e7a85', marginTop: 1 }}>{r.co} · {r.stat}</div>
            </div>
            {r.status === 'live' ? (
              <span style={{ background: G_CORAL, color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: `1.5px solid ${G_DEEP}` }}>● Live</span>
            ) : (
              <span style={{ background: 'white', color: G_DEEP, padding: '4px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: `1.5px solid ${G_DEEP}` }}>Archive</span>
            )}
            <div style={{ textAlign: 'right', minWidth: 36 }}>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, color: r.rec ? G_CORAL : '#a8b4bd' }}>{r.rec || '—'}</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e7a85' }}>Rec</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ATHLETE PROFILE in G style ───
function GAthleteScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: G_BG, padding: 22,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: G_DEEP, overflow: 'hidden',
    }}>
      <GTopBar active="Results" />

      {/* Athlete hero — surface waves, name as the splash */}
      <div style={{
        ...wavesBG(),
        border: `2px solid ${G_DEEP}`,
        borderRadius: 22,
        boxShadow: `5px 6px 0 ${G_DEEP}`,
        padding: '22px 24px 26px',
        color: 'white',
        marginBottom: 14,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: G_DEEP, padding: '4px 10px', borderRadius: 999, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          Athlete profile
        </span>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 58, lineHeight: 1, letterSpacing: '-0.02em', margin: '10px 0 0' }}>
          Mateo Reyes
        </h1>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>
          <span># West Hollywood Aquatics</span>
          <span>📍 Los Angeles</span>
          <span>📅 Since 2019</span>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { v: '4', k: 'Tournaments' },
          { v: '8', k: 'Events' },
          { v: '5', k: 'Golds' },
          { v: '1', k: 'Records', coral: true },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.coral ? G_CORAL : 'white',
            color: s.coral ? 'white' : G_DEEP,
            border: `2px solid ${G_DEEP}`,
            borderRadius: 16,
            padding: '12px 14px',
            boxShadow: `3px 4px 0 ${G_DEEP}`,
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Timeline cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { y: '2026', t: 'Valencia 🇪🇸', sw: ['50 Free 23.41 ★', '100 Fly 56.12', '200 IM 2:12.84'], wp: 'WH2O · 1st Div A' },
          { y: '2025', t: 'Palm Springs 🇺🇸', sw: ['50 Free 23.78', '100 Fly 56.91'], wp: null },
        ].map((e, i) => (
          <div key={i} style={{
            background: 'white',
            border: `2px solid ${G_DEEP}`,
            borderRadius: 16,
            boxShadow: `3px 4px 0 ${G_DEEP}`,
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: '60px 1fr',
            gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, lineHeight: 1, color: i === 0 ? G_CORAL : G_DEEP }}>{e.y}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6e7a85', marginTop: 4 }}>{e.t}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: G_AQUA, marginBottom: 4 }}>● Swimming</div>
                {e.sw.map((s, j) => <div key={j} style={{ fontSize: 12, padding: '1px 0', fontFamily: '"Geist Mono", monospace' }}>{s}</div>)}
              </div>
              {e.wp && (
                <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px dashed ' + G_DEEP + '33' }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: G_CORAL, marginBottom: 4 }}>◎ Water polo</div>
                  <div style={{ fontSize: 12 }}>{e.wp}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RESULTS TABLE in G style ───
function GResultsScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: G_BG, padding: 22,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: G_DEEP, overflow: 'hidden',
    }}>
      <GTopBar active="Results" />

      {/* Hero */}
      <div style={{
        ...wavesBG(),
        border: `2px solid ${G_DEEP}`,
        borderRadius: 22,
        boxShadow: `5px 6px 0 ${G_DEEP}`,
        padding: '22px 24px',
        color: 'white',
        marginBottom: 14,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: G_DEEP, padding: '4px 10px', borderRadius: 999, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          All-time records · since 1987
        </span>
        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em', margin: '10px 0 0' }}>
          Every <span style={{ background: G_CORAL, padding: '0 14px', borderRadius: 12, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', border: `2px solid ${G_DEEP}`, display: 'inline-block', lineHeight: 1.04 }}>record</span>, ever.
        </h1>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Search…', 'Event ▾', 'Age ▾', 'Gender ▾', '★ Held now'].map((p, i) => (
          <span key={p} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: i === 4 ? G_CORAL : 'white',
            color: i === 4 ? 'white' : G_DEEP,
            border: `2px solid ${G_DEEP}`,
            flex: i === 0 ? '1 1 160px' : '0 0 auto',
            textAlign: 'left',
          }}>{p}</span>
        ))}
      </div>

      {/* Records — chunky cards (one row per record) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { e: '1500m Free', cat: 'Men 40-44', who: 'Diego Fonseca · BTN', t: '17:48.22', y: '2026', hot: true },
          { e: '50m Free', cat: 'Men 30-34', who: 'Mateo Reyes · WH2O', t: '00:23.41', y: '2026', hot: true },
          { e: '50m Free', cat: 'Women 35-39', who: 'Priya Aggarwal · LOTS', t: '00:26.74', y: '2026', hot: true },
          { e: '100m Fly', cat: 'Mixed 30-34', who: 'C. Beaulieu · ACC', t: '01:01.23', y: '2026', hot: true },
          { e: '200m Breast', cat: 'Women 40-44', who: 'A. Karlsson · SST', t: '02:39.18', y: '2026', hot: true },
          { e: '400m Free', cat: 'Women 30-34', who: 'L. Moreno · ACC', t: '04:32.09', y: '2025' },
        ].map((r, i) => (
          <div key={i} style={{
            background: 'white',
            border: `2px solid ${G_DEEP}`,
            borderRadius: 14,
            boxShadow: `2px 3px 0 ${G_DEEP}`,
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '28px 1fr 1fr auto auto',
            gap: 14,
            alignItems: 'center',
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%',
              background: r.hot ? G_CORAL : 'white',
              border: `2px solid ${G_DEEP}`,
              display: 'grid', placeItems: 'center',
              color: r.hot ? 'white' : G_DEEP,
              fontSize: 10, fontWeight: 700,
            }}>★</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.e}</div>
              <div style={{ fontSize: 11, color: '#6e7a85', marginTop: 1 }}>{r.cat}</div>
            </div>
            <div style={{ fontSize: 11.5, color: '#3a4a55' }}>{r.who}</div>
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{r.t}</span>
            <span style={{
              fontFamily: '"Geist Mono", monospace', fontSize: 10, color: '#6e7a85',
              background: G_BG, padding: '2px 8px', borderRadius: 999,
              border: `1.5px solid ${G_DEEP}33`,
            }}>'{r.y.slice(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  DirGRipple, DirGSurface, DirGDepth,
  GClubsScreen, GTournamentsScreen, GAthleteScreen, GResultsScreen,
});
