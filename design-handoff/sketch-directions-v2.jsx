// Refined directions — fusion of C (Pool Lanes) and D (Sport Playful)
// Aim: keep D's simplicity and chunky friendliness, bring more aquatic flavor.

// Shared mini-result card (same content across all three to compare cleanly)
function MiniResult({ borderColor, accent, label = 'Record broken' }) {
  return (
    <div style={{
      background: 'white',
      border: `2px solid ${borderColor}`,
      borderRadius: 16,
      boxShadow: `3px 4px 0 ${borderColor}`,
      padding: '16px 18px',
      display: 'grid',
      gridTemplateColumns: '40px 1fr auto',
      gap: 14,
      alignItems: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: accent, border: `2px solid ${borderColor}`,
        display: 'grid', placeItems: 'center',
        fontFamily: '"Instrument Serif", serif', fontSize: 22, color: 'white',
      }}>1</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Diego Fonseca · 1500m Free</div>
        <div style={{ fontSize: 11.5, color: '#6e7a85' }}>Berlin Tritonen 🇩🇪 · Men 40-44</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
          <span style={{ background: accent, color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>★ {label}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 28 }}>17:48</div>
        <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, color: '#6e7a85' }}>.22</div>
      </div>
    </div>
  );
}

// ============= E · POOL TILE =============
// D's chunky tile structure, but borders are deep-teal, palette is aqua,
// hero has a subtle ceramic-tile background pattern.
function DirPoolTile() {
  // Subtle 8x8 pool-tile grid, slightly darker grout lines
  const TILE = `
    linear-gradient(#cfe5ec 1px, transparent 1px) 0 0 / 14px 14px,
    linear-gradient(90deg, #cfe5ec 1px, transparent 1px) 0 0 / 14px 14px,
    linear-gradient(180deg, #e8f3f6, #d4e7ed)
  `;
  const DEEP = '#0e4b66';
  const AQUA = '#2596be';
  const SKY  = '#7ec3d8';
  const SAND = '#f6e6a8';
  const CORAL = '#ef6a4a';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f4faf9',
      padding: 28,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#0c2a3a',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5e7a8a' }}>
        <span>E · Pool Tile</span>
        <span>D's chunkiness · aqua palette · tile-pattern hero</span>
      </div>

      {/* Hero tile with pool-tile pattern */}
      <div style={{
        marginTop: 18,
        borderRadius: 20,
        overflow: 'hidden',
        border: `2px solid ${DEEP}`,
        boxShadow: `4px 5px 0 ${DEEP}`,
        background: 'white',
      }}>
        <div style={{ background: TILE, padding: '24px 24px 22px', position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DEEP, color: 'white', padding: '5px 12px', borderRadius: 999, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            ◐ Splashing now
          </span>
          <h1 style={{
            fontFamily: '"Instrument Serif", serif', fontWeight: 400,
            fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.02em',
            margin: '12px 0 4px',
            color: DEEP,
          }}>
            Valencia <span style={{
              background: CORAL, color: 'white',
              padding: '0 14px', borderRadius: 12,
              boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
            }}>2026</span>
          </h1>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 18, marginTop: 6, color: AQUA }}>
            Championship results
          </div>
        </div>
      </div>

      {/* Stat tiles — aqua-only with one coral */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
        {[
          { v: '1,842', k: 'Athletes', bg: SKY, ink: DEEP },
          { v: '34', k: 'Nations', bg: AQUA },
          { v: '86', k: 'Clubs', bg: DEEP },
          { v: '9', k: 'Records', bg: CORAL },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, color: s.ink || 'white',
            border: `2px solid ${DEEP}`,
            borderRadius: 16,
            padding: '14px 14px 16px',
            boxShadow: `3px 4px 0 ${DEEP}`,
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 6 }}>{s.k}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <MiniResult borderColor={DEEP} accent={CORAL} />
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Same energy as D, dressed up like a pool."
      </div>
    </div>
  );
}

// ============= F · LANE TRACKER =============
// D's chunky tiles + horizontal lane-line texture inside everything. Lane-number markers as motif.
function DirLaneTracker() {
  const DEEP = '#0e3a52';
  const AQUA = '#2b87a8';
  const FOAM = '#d4eaf2';
  const CORAL = '#ff7a59';
  const SAND = '#ffd66b';

  // Lane stripes used inside tiles
  const LANES = `repeating-linear-gradient(180deg,
    rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 18px,
    rgba(255,255,255,0.12) 18px, rgba(255,255,255,0.12) 19px)`;
  const LANES_DARK = `repeating-linear-gradient(180deg,
    rgba(14,58,82,0.0) 0px, rgba(14,58,82,0.0) 18px,
    rgba(14,58,82,0.10) 18px, rgba(14,58,82,0.10) 19px)`;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fbfdfd',
      padding: 28,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: DEEP,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5e7a8a' }}>
        <span>F · Lane Tracker</span>
        <span>D's tiles · lane-line texture · monospace lap markers</span>
      </div>

      {/* Hero tile — lane lines run through it horizontally */}
      <div style={{
        marginTop: 18,
        borderRadius: 20,
        border: `2px solid ${DEEP}`,
        boxShadow: `4px 5px 0 ${DEEP}`,
        background: `${LANES_DARK}, ${FOAM}`,
        padding: '24px 24px 22px',
        position: 'relative',
      }}>
        {/* Lane number markers on the left edge */}
        <div style={{ position: 'absolute', left: 8, top: 16, bottom: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: '"Geist Mono", monospace', fontSize: 9, color: 'rgba(14,58,82,0.45)', letterSpacing: '0.1em' }}>
          <span>L1</span><span>L4</span><span>L8</span>
        </div>
        <div style={{ paddingLeft: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DEEP, color: SAND, padding: '5px 12px', borderRadius: 999, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            ◐ Heat in progress
          </span>
          <h1 style={{
            fontFamily: '"Instrument Serif", serif', fontWeight: 400,
            fontSize: 58, lineHeight: 1.02, letterSpacing: '-0.02em',
            margin: '12px 0 0',
            color: DEEP,
          }}>
            Valencia <span style={{ fontStyle: 'italic', color: CORAL }}>2026</span>
          </h1>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 18, marginTop: 4, color: AQUA }}>
            Championship results
          </div>
        </div>
      </div>

      {/* Stat tiles — each carries the lane texture too */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
        {[
          { v: '1,842', k: 'Athletes', bg: AQUA, dark: true },
          { v: '34', k: 'Nations', bg: FOAM, ink: DEEP },
          { v: '86', k: 'Clubs', bg: DEEP, dark: true },
          { v: '9', k: 'Records', bg: CORAL, dark: true },
        ].map((s, i) => (
          <div key={i} style={{
            background: `${s.dark ? LANES : LANES_DARK}, ${s.bg}`,
            color: s.ink || 'white',
            border: `2px solid ${DEEP}`,
            borderRadius: 16,
            padding: '14px 14px 16px',
            boxShadow: `3px 4px 0 ${DEEP}`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 6, right: 8,
              fontFamily: '"Geist Mono", monospace', fontSize: 9, letterSpacing: '0.1em',
              opacity: s.dark ? 0.6 : 0.45,
            }}>L{i+1}</div>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 6 }}>{s.k}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <MiniResult borderColor={DEEP} accent={CORAL} label="New record" />
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Lane lines as a texture, not a metaphor."
      </div>
    </div>
  );
}

// ============= G · SPLASH =============
// Pure simplicity. D pared back: aqua + one coral pop, generous space.
function DirSplash() {
  const DEEP = '#0d3a52';
  const AQUA = '#37a3c4';
  const SKY  = '#cfeaf3';
  const CORAL = '#ff6f50';
  const BG = '#eaf4f7';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      padding: 32,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: DEEP,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5e7a8a' }}>
        <span>G · Splash</span>
        <span>D pared back · two colors · breathing room</span>
      </div>

      {/* Hero — single chunky tile, two-color */}
      <div style={{
        marginTop: 24,
        background: AQUA,
        border: `2px solid ${DEEP}`,
        borderRadius: 24,
        boxShadow: `5px 6px 0 ${DEEP}`,
        padding: '26px 28px 28px',
        color: 'white',
        position: 'relative',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', color: DEEP, padding: '5px 12px', borderRadius: 999,
          fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
        }}>● Live now</span>
        <h1 style={{
          fontFamily: '"Instrument Serif", serif', fontWeight: 400,
          fontSize: 72, lineHeight: 1.0, letterSpacing: '-0.02em',
          margin: '14px 0 0',
        }}>
          Valencia <span style={{
            background: CORAL,
            padding: '0 16px', borderRadius: 14,
            boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
            border: `2px solid ${DEEP}`,
            display: 'inline-block',
            lineHeight: 1.02,
          }}>2026</span>
        </h1>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 22, marginTop: 8, opacity: 0.92 }}>
          Championship results
        </div>
      </div>

      {/* Stats — pared to just two colors, big numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 22 }}>
        {[
          { v: '1,842', k: 'Athletes', coral: false },
          { v: '34', k: 'Nations', coral: false },
          { v: '86', k: 'Clubs', coral: false },
          { v: '9', k: 'Records', coral: true },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.coral ? CORAL : 'white',
            color: s.coral ? 'white' : DEEP,
            border: `2px solid ${DEEP}`,
            borderRadius: 20,
            padding: '16px 16px 18px',
            boxShadow: `3px 4px 0 ${DEEP}`,
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 40, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>{s.k}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <MiniResult borderColor={DEEP} accent={CORAL} />
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Simplest of the three. Quiet aqua, one warm pop."
      </div>
    </div>
  );
}

Object.assign(window, { DirPoolTile, DirLaneTracker, DirSplash });
