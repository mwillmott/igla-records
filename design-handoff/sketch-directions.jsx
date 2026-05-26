// Visual direction explorations — 4 distinct aesthetic treatments
// Each shows the same content (a tournament hero + stats + result row) so directions compare cleanly.

// ============= A · EDITORIAL CALM =============
// Refined, monochromatic, restrained. Big italic display type as the only flourish.
function DirEditorial() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f9f6f1',
      padding: 36,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#1d211f',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a7770', marginBottom: 28 }}>
        <span>A · Editorial Calm</span>
        <span>Restrained · Monochromatic · Serif-led</span>
      </div>

      {/* Hero */}
      <div style={{ borderTop: '1px solid #d9d1c0', paddingTop: 18 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#446b80', fontWeight: 500 }}>
          ● Live · June 14–21, 2026
        </span>
        <h1 style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontWeight: 400,
          fontSize: 68,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '14px 0 8px',
        }}>
          <span style={{ fontStyle: 'italic', color: '#2f5d7a' }}>Valencia 2026</span><br/>
          Championship Results
        </h1>
        <p style={{ color: '#5a5751', fontSize: 14.5, maxWidth: 440, margin: '12px 0 0' }}>
          Final standings, all-time records, and athlete histories — live from the Mediterranean.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #d9d1c0', borderBottom: '1px solid #d9d1c0', marginTop: 28 }}>
        {[
          { v: '1,842', k: 'Participants' },
          { v: '34', k: 'Nations' },
          { v: '86', k: 'Clubs' },
          { v: '9', k: 'New records', color: '#a64b34' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px 18px 16px 0', borderRight: i < 3 ? '1px solid #d9d1c0' : 'none' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: s.color || '#1d211f' }}>{s.v}</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a7770', marginTop: 8 }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Sample result row */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a7770', marginBottom: 8 }}>Featured result</div>
        <div style={{
          background: '#fffdf9',
          border: '1px solid #d9d1c0',
          borderRadius: 8,
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: '24px 1fr auto 1fr auto',
          gap: 16,
          alignItems: 'center',
        }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#cca85f', color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>1</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>1500m Freestyle</div>
            <div style={{ fontSize: 11, color: '#7a7770' }}>Men 40-44 · LCM</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Diego Fonseca</div>
            <div style={{ fontSize: 11, color: '#7a7770' }}>Berlin Tritonen 🇩🇪</div>
          </div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>17:48.22</div>
          <span style={{ background: '#f6e7d2', color: '#a36e1a', border: '1px solid #d9c08e', borderRadius: 99, padding: '3px 8px', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>★ Record</span>
        </div>
      </div>

      {/* Footer cues */}
      <div style={{ position: 'absolute', left: 36, right: 36, bottom: 28, paddingTop: 16, borderTop: '1px solid #d9d1c0', display: 'flex', gap: 18, fontSize: 11, color: '#7a7770', justifyContent: 'space-between' }}>
        <span>Inter Tight is not the body font — Geist Sans is. Display is Instrument Serif italic.</span>
        <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', color: '#a64b34' }}>"Quiet. Editorial. Like a print program."</span>
      </div>
    </div>
  );
}

// ============= B · MAGAZINE BOLD =============
// Sport magazine drama. Asymmetric. Huge type, color blocks, expressive numbers.
function DirMagazine() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#ffffff',
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#0d1b29',
      overflow: 'hidden',
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Left: massive hero block */}
      <div style={{ background: '#0d2438', color: 'white', padding: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          <span>B · Magazine Bold</span>
          <span>vol. 39 / 26</span>
        </div>

        {/* Huge year */}
        <div style={{
          fontFamily: '"Instrument Serif", serif',
          fontStyle: 'italic',
          fontSize: 220,
          lineHeight: 0.82,
          letterSpacing: '-0.04em',
          marginTop: 24,
          color: '#ff7a59',
        }}>2026</div>

        <div style={{
          fontFamily: '"Instrument Serif", serif',
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          marginTop: 18,
        }}>VALENCIA</div>

        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 16, color: 'rgba(255,255,255,0.7)' }}>
          IGLA+ · Gay Games XII · 🇪🇸
        </div>

        <div style={{ position: 'absolute', left: 32, right: 32, bottom: 28, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 18, lineHeight: 1.3 }}>
          "Nine records broken. One Mediterranean. Six days of swimming, polo, and pure noise."
        </div>
      </div>

      {/* Right: Stats grid + result */}
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0d2438', fontWeight: 700 }}>
          ── Day six. Final standings.
        </div>

        {/* Quartet stats — chunky asymmetric */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ padding: '18px 16px 18px 0', borderBottom: '2px solid #0d2438', borderRight: '2px solid #0d2438' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.85, letterSpacing: '-0.03em' }}>1,842</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5b6878', marginTop: 8 }}>Athletes</div>
          </div>
          <div style={{ padding: '18px 0 18px 16px', borderBottom: '2px solid #0d2438' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.85, letterSpacing: '-0.03em' }}>34</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5b6878', marginTop: 8 }}>Nations</div>
          </div>
          <div style={{ padding: '18px 16px 0 0', borderRight: '2px solid #0d2438' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.85, letterSpacing: '-0.03em' }}>86</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5b6878', marginTop: 8 }}>Clubs</div>
          </div>
          <div style={{ padding: '18px 0 0 16px' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.85, letterSpacing: '-0.03em', color: '#ff7a59' }}>9</div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5b6878', marginTop: 8 }}>Records</div>
          </div>
        </div>

        {/* Headline result */}
        <div style={{ marginTop: 'auto', background: '#fff6f2', border: '2px solid #ff7a59', padding: 20, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, left: 16, background: '#ff7a59', color: 'white', padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Record broken
          </div>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 42, lineHeight: 0.95, marginTop: 6 }}>17:48.22</div>
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500 }}>1500m Free · Men 40-44</div>
          <div style={{ fontSize: 12, color: '#5b6878', marginTop: 2 }}>Diego Fonseca · Berlin Tritonen 🇩🇪</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Dramatic. Confident. A sports-mag spread."
      </div>
    </div>
  );
}

// ============= C · POOL LANES =============
// Horizontal lane lines as the recurring visual motif. Rhythm via stripes.
function DirPoolLanes() {
  const LANE_BG = `repeating-linear-gradient(
    180deg,
    #ffffff 0px,
    #ffffff 64px,
    #e7eef2 64px,
    #e7eef2 65px
  )`;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: LANE_BG,
      padding: 32,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#142838',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Floating lane number markers — every other lane */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingTop: 38, fontFamily: '"Geist Mono", monospace', fontSize: 9, color: '#7891a1', letterSpacing: '0.1em' }}>
        {[1,2,3,4,5,6,7,8].map(n => <span key={n} style={{ paddingLeft: 8 }}>L{n}</span>)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5e7589', paddingLeft: 28 }}>
        <span>C · Pool Lanes</span>
        <span>Rhythmic · Pool-tile · Lane-marked</span>
      </div>

      {/* Hero — sits across "lanes 1-3" */}
      <div style={{ marginTop: 24, paddingLeft: 28 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1f6d96', color: 'white', padding: '5px 12px', borderRadius: 999, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
          ◐ Live now
        </span>
        <h1 style={{
          fontFamily: '"Instrument Serif", serif', fontWeight: 400,
          fontSize: 72, lineHeight: 1, letterSpacing: '-0.02em', margin: '12px 0 4px',
          color: '#142838',
        }}>
          <span style={{ fontStyle: 'italic', color: '#1f6d96' }}>Valencia 2026</span><br/>
          Championship Results
        </h1>
        <div style={{ fontSize: 12, color: '#5e7589', marginTop: 8 }}>June 14–21 · 1,842 athletes · 34 nations · 86 clubs</div>
      </div>

      {/* "Lane lap" indicators — bar chart of stats */}
      <div style={{ marginTop: 28, paddingLeft: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5e7589', marginBottom: 10 }}>Records by championship · lap times</div>
        {[
          { y: '2026', n: 9, max: 9, here: true },
          { y: '2025', n: 6, max: 9 },
          { y: '2024', n: 4, max: 9 },
          { y: '2023', n: 7, max: 9 },
          { y: '2022', n: 3, max: 9 },
        ].map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 30px', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px dashed #c7d3da' }}>
            <span className="sk-mono" style={{ fontSize: 11, color: '#5e7589', fontFamily: '"Geist Mono", monospace' }}>'{b.y.slice(2)}</span>
            <div style={{ height: 22, background: '#e7eef2', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0,
                width: `${(b.n / b.max) * 100}%`,
                background: b.here ? 'linear-gradient(90deg, #1f6d96, #ff7a59)' : '#92aab9',
                borderRadius: 4,
              }}></div>
              {/* lane tick lines */}
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent 0, transparent 19px, rgba(255,255,255,0.3) 19px, rgba(255,255,255,0.3) 20px)' }}></div>
            </div>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: b.here ? '#ff7a59' : '#142838' }}>{b.n}</span>
          </div>
        ))}
      </div>

      {/* Result strip — laid out like a lane */}
      <div style={{ marginTop: 22, padding: '14px 18px', background: '#1f6d96', color: 'white', borderRadius: 8, marginLeft: 28, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, background: 'repeating-linear-gradient(0deg, white 0px, white 6px, transparent 6px, transparent 14px)', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}></div>
        <div style={{ paddingLeft: 14, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.7 }}>Lane 4 · Heat 3</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>Diego Fonseca <span style={{ opacity: 0.7, fontWeight: 400 }}>· Berlin Tritonen</span></div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>1500m Freestyle · Men 40-44</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 22, fontWeight: 500 }}>17:48.22</div>
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>★ NEW RECORD</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Rhythmic, swim-coded. Stripes are functional."
      </div>
    </div>
  );
}

// ============= D · SPORT PLAYFUL =============
// Pride energy: chunky type, big colorful blocks, friendly pills, rounded everything.
function DirSportPlayful() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff8ec',
      padding: 28,
      fontFamily: '"Geist", system-ui, sans-serif',
      color: '#1c1e2a',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#766753' }}>
        <span>D · Sport Playful</span>
        <span>Friendly · Chunky · Color-blocked</span>
      </div>

      {/* Multi-color band hero */}
      <div style={{ marginTop: 18, borderRadius: 24, overflow: 'hidden', background: 'white', border: '2px solid #1c1e2a' }}>
        <div style={{ display: 'flex', height: 12 }}>
          <div style={{ flex: 1, background: '#ff5c8a' }}></div>
          <div style={{ flex: 1, background: '#ff9b3d' }}></div>
          <div style={{ flex: 1, background: '#ffd23f' }}></div>
          <div style={{ flex: 1, background: '#7ad27c' }}></div>
          <div style={{ flex: 1, background: '#3da5d9' }}></div>
          <div style={{ flex: 1, background: '#8a6dd0' }}></div>
        </div>
        <div style={{ padding: '24px 24px 22px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1c1e2a', color: '#ffd23f', padding: '5px 12px', borderRadius: 999, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            ◉ Splashing now
          </span>
          <h1 style={{
            fontFamily: '"Instrument Serif", serif', fontWeight: 400,
            fontSize: 60, lineHeight: 1, letterSpacing: '-0.02em',
            margin: '12px 0 4px',
          }}>
            Valencia <span style={{ background: '#ffd23f', padding: '0 12px', borderRadius: 12, boxDecorationBreak: 'clone' }}>2026</span>
          </h1>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 20, marginTop: 6, color: '#3da5d9' }}>
            Championship results
          </div>
        </div>
      </div>

      {/* Big chunky stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
        {[
          { v: '1,842', k: 'Athletes', bg: '#3da5d9' },
          { v: '34', k: 'Nations', bg: '#7ad27c' },
          { v: '86', k: 'Clubs', bg: '#ffd23f', ink: '#1c1e2a' },
          { v: '9', k: 'Records', bg: '#ff5c8a' },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, color: s.ink || 'white',
            border: '2px solid #1c1e2a',
            borderRadius: 16,
            padding: '14px 14px 16px',
            boxShadow: '3px 4px 0 #1c1e2a',
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 6 }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* Big result card */}
      <div style={{
        marginTop: 18,
        background: 'white',
        border: '2px solid #1c1e2a',
        borderRadius: 16,
        boxShadow: '3px 4px 0 #1c1e2a',
        padding: '16px 18px',
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto',
        gap: 14,
        alignItems: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#ffd23f', border: '2px solid #1c1e2a',
          display: 'grid', placeItems: 'center',
          fontFamily: '"Instrument Serif", serif', fontSize: 22,
        }}>1</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Diego Fonseca · 1500m Free</div>
          <div style={{ fontSize: 11.5, color: '#766753' }}>Berlin Tritonen 🇩🇪 · Men 40-44</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            <span style={{ background: '#ff5c8a', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>★ Record</span>
            <span style={{ background: '#3da5d9', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Gold</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 28 }}>17:48</div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, color: '#766753' }}>.22</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 16, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 13, color: '#a64b34' }}>
        "Pride energy. Chunky and fun without going neon."
      </div>
    </div>
  );
}

Object.assign(window, { DirEditorial, DirMagazine, DirPoolLanes, DirSportPlayful });
