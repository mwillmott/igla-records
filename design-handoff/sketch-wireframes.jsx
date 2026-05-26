// Page wireframes — mid-fi sketch of each page in the IA

// Shared wireframe components
function WFTop() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--sk-line)', background: 'var(--sk-paper)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--sk-ink)' }}></div>
        <div className="sk-display" style={{ fontSize: 16, fontWeight: 500 }}>IGLA<span style={{ color: 'var(--sk-coral)' }}>+</span> Records</div>
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--sk-ink-2)' }}>
        <span>Clubs</span>
        <span>Tournaments</span>
        <span style={{ color: 'var(--sk-ink)', fontWeight: 600 }}>Results</span>
        <span>About</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--sk-fill)' }}></div>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sk-ink-2)' }}></div>
      </div>
    </div>
  );
}

function WFHeader({ kicker, title, italic, lede }) {
  return (
    <div style={{ padding: '24px 24px 22px', borderBottom: '1px solid var(--sk-line)' }}>
      <span className="sk-pill" style={{ background: 'var(--sk-aqua-soft)', borderColor: 'var(--sk-aqua)', color: 'var(--sk-aqua)', fontSize: 10 }}>● {kicker}</span>
      <h1 className="sk-h1" style={{ fontSize: 38, marginTop: 14 }}>
        {italic && <span className="sk-italic" style={{ color: 'var(--sk-coral)' }}>{italic} </span>}
        {title}
      </h1>
      {lede && <div className="sk-line-text" style={{ width: '80%', marginTop: 14 }}></div>}
      {lede && <div className="sk-line-text" style={{ width: '60%', marginTop: 6 }}></div>}
    </div>
  );
}

function WFKpi({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, borderBottom: '1px solid var(--sk-line)' }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: '14px 20px', borderRight: i < items.length-1 ? '1px solid var(--sk-line)' : 'none' }}>
          <div className="sk-display" style={{ fontSize: 26, color: it.color || 'var(--sk-ink)' }}>{it.v}</div>
          <div className="sk-section-label" style={{ marginTop: 4 }}>{it.k}</div>
        </div>
      ))}
    </div>
  );
}

// ----------- 1) RESULTS — all-time records hub -----------
function WFResults() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />
        <WFHeader
          kicker="All-time records · since 1987"
          italic="Every"
          title="record, ever."
          lede
        />
        <WFKpi items={[
          { v: '184', k: 'Total records' },
          { v: '9', k: 'Set this year', color: 'var(--sk-coral)' },
          { v: '38', k: 'Years tracked' },
          { v: '52', k: 'Holding clubs' },
        ]} />

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderBottom: '1px solid var(--sk-line)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="sk-card-flat" style={{ height: 28, flex: '1 1 180px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--sk-ink-3)' }}>
            🔎 Search event, athlete, club…
          </div>
          <span className="sk-pill">Event ▾</span>
          <span className="sk-pill">Age ▾</span>
          <span className="sk-pill">Gender ▾</span>
          <span className="sk-pill">Tournament ▾</span>
          <span className="sk-pill coral">★ Currently held</span>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px 4px' }}>
          <span className="sk-pill active">Swimming records · 142</span>
          <span className="sk-pill">Water polo titles · 42</span>
        </div>

        {/* Records table */}
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 60px 80px 1fr 70px 28px', gap: 12, padding: '8px 4px', fontSize: 9.5, color: 'var(--sk-ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--sk-line)' }}>
            <span></span><span>Event</span><span>Course</span><span>Category</span><span>Held by</span><span style={{ textAlign: 'right' }}>Time</span><span></span>
          </div>
          {[
            { e: '1500m Free', c: 'LCM', cat: 'Men 40-44', who: 'Diego Fonseca · BTN', t: '17:48.22', year: '2026', hot: true },
            { e: '50m Free', c: 'LCM', cat: 'Men 30-34', who: 'Mateo Reyes · WH2O', t: '00:23.41', year: '2026', hot: true },
            { e: '100m Back', c: 'LCM', cat: 'Men 45-49', who: 'Marcus Holloway · WH2O', t: '01:05.92', year: '2026', hot: true },
            { e: '200m Breast', c: 'LCM', cat: 'Women 40-44', who: 'Astrid Karlsson · SST', t: '02:39.18', year: '2026', hot: true },
            { e: '50m Free', c: 'LCM', cat: 'Women 35-39', who: 'Priya Aggarwal · LOTS', t: '00:26.74', year: '2026', hot: true },
            { e: '100m Fly', c: 'LCM', cat: 'Mixed 30-34', who: 'C. Beaulieu · ACC', t: '01:01.23', year: '2026', hot: true },
            { e: '400m Free', c: 'LCM', cat: 'Women 30-34', who: 'L. Moreno · ACC', t: '04:32.09', year: '2025' },
            { e: '200m IM', c: 'LCM', cat: 'Men 25-29', who: 'B. de Vries · AAP', t: '02:11.18', year: '2024' },
            { e: '50m Breast', c: 'LCM', cat: 'Men 25-29', who: 'F. Whitman · SWM', t: '00:28.86', year: '2023' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '20px 1fr 60px 80px 1fr 70px 28px',
              gap: 12, padding: '10px 4px', fontSize: 11,
              borderBottom: '1px solid var(--sk-line)',
              background: r.hot ? 'linear-gradient(90deg, rgba(199,89,57,0.06), transparent 70%)' : 'transparent',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--sk-coral)', fontSize: 10 }}>{r.hot ? '★' : ''}</span>
              <span style={{ fontWeight: 500 }}>{r.e}</span>
              <span className="sk-mono" style={{ fontSize: 10, color: 'var(--sk-ink-2)' }}>{r.c}</span>
              <span style={{ color: 'var(--sk-ink-2)' }}>{r.cat}</span>
              <span style={{ color: 'var(--sk-ink-2)' }}>{r.who}</span>
              <span className="sk-mono" style={{ textAlign: 'right', fontWeight: 500 }}>{r.t}</span>
              <span className="sk-mono" style={{ color: 'var(--sk-ink-3)', fontSize: 10, textAlign: 'right' }}>'{r.year.slice(2)}</span>
            </div>
          ))}
        </div>

        {/* Annotation */}
        <div className="sk-note" style={{ position: 'absolute', left: 24, bottom: 16, maxWidth: 220, fontSize: 12 }}>
          ★ rows = the record still stands as of the latest tournament. Click any row → athlete profile.
        </div>
      </div>
    </div>
  );
}

// ----------- 2) CLUBS LIST -----------
function WFClubs() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />
        <WFHeader kicker="16 clubs · 11 countries" italic="Find your" title="family." lede />
        <WFKpi items={[
          { v: '16', k: 'Member clubs' }, { v: '2,418', k: 'Members' },
          { v: '11', k: 'Countries' }, { v: '6', k: 'Aquatic sports', color: 'var(--sk-coral)' },
        ]} />

        {/* Featured */}
        <div style={{ margin: '18px 20px', padding: 18, background: 'linear-gradient(120deg, #e9eff5, #f6e6dc)', borderRadius: 10, position: 'relative' }}>
          <span className="sk-pill coral" style={{ fontSize: 9 }}>★ Top club · Valencia 2026</span>
          <div className="sk-display" style={{ fontSize: 26, marginTop: 8 }}>West Hollywood Aquatics</div>
          <div style={{ fontSize: 11, color: 'var(--sk-ink-2)' }}>🇺🇸 Los Angeles · est. 1985 · 218 members</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11 }}>
            <span><b>14</b> gold</span><span><b>9</b> silver</span><span><b>7</b> bronze</span><span style={{ color: 'var(--sk-coral)' }}><b>4</b> records</span>
          </div>
        </div>

        {/* Region tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 12px', flexWrap: 'wrap' }}>
          <span className="sk-pill active">All 16</span>
          <span className="sk-pill">Europe 7</span>
          <span className="sk-pill">N. America 4</span>
          <span className="sk-pill">Asia 2</span>
          <span className="sk-pill">Oceania 1</span>
          <span className="sk-pill">S. America 1</span>
          <span className="sk-pill">Africa 1</span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
          {[
            { f: '🇫🇷', n: 'À Contre-Courant', city: 'Paris', m: 184, c: 'var(--sk-aqua)' },
            { f: '🇬🇧', n: 'London Out To Swim', city: 'London', m: 312, c: '#7d5fbf' },
            { f: '🇩🇪', n: 'Berlin Tritonen', city: 'Berlin', m: 196, c: '#a44' },
            { f: '🇸🇪', n: 'Stockholm Stingrays', city: 'Stockholm', m: 124, c: 'var(--sk-gold)' },
            { f: '🇯🇵', n: 'Tokyo Tritons', city: 'Tokyo', m: 108, c: '#c75' },
            { f: '🇩🇰', n: 'Copenhagen Mermen', city: 'Copenhagen', m: 96, c: 'var(--sk-mint)' },
          ].map((c, i) => (
            <div key={i} className="sk-card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 4, background: c.c }}></div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="sk-display" style={{ fontSize: 17 }}>{c.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--sk-ink-3)' }}>📍 {c.city}</div>
                  </div>
                  <span style={{ fontSize: 18 }}>{c.f}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <span className="sk-pill" style={{ fontSize: 9, padding: '2px 7px' }}>Swim</span>
                  <span className="sk-pill" style={{ fontSize: 9, padding: '2px 7px' }}>Polo</span>
                </div>
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--sk-line)', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="sk-display" style={{ fontSize: 18 }}>{c.m}</span>
                  <span style={{ fontSize: 9, color: 'var(--sk-ink-3)' }}>MEMBERS</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------- 3) CLUB DETAIL (NEW) -----------
function WFClubDetail() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />

        {/* Breadcrumb */}
        <div style={{ padding: '10px 20px', fontSize: 10.5, color: 'var(--sk-ink-3)', borderBottom: '1px solid var(--sk-line)' }}>
          ← Clubs / <span style={{ color: 'var(--sk-ink-2)' }}>À Contre-Courant</span>
        </div>

        {/* Club header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: '22px 20px', borderBottom: '1px solid var(--sk-line)', alignItems: 'end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🇫🇷</span>
              <span className="sk-section-label">Paris, France · est. 1996</span>
            </div>
            <h1 className="sk-h1" style={{ fontSize: 38 }}>À Contre-Courant</h1>
            <div className="sk-italic sk-display" style={{ fontSize: 16, color: 'var(--sk-ink-2)', marginTop: 6 }}>
              "Nager à contre-courant, fièrement."
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="sk-pill" style={{ background: 'var(--sk-paper)', borderColor: 'var(--sk-line-2)' }}>♥ Follow</span>
            <span className="sk-pill" style={{ background: 'var(--sk-paper)', borderColor: 'var(--sk-line-2)' }}>↗ Visit</span>
          </div>
        </div>

        {/* Lifetime KPI */}
        <WFKpi items={[
          { v: '31', k: 'Championships' },
          { v: '11', k: 'Gold', color: 'var(--sk-gold)' },
          { v: '12', k: 'Silver' },
          { v: '8', k: 'Bronze' },
          { v: '3', k: 'Records', color: 'var(--sk-coral)' },
        ]} />

        {/* Section: Tournament history */}
        <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="sk-display" style={{ fontSize: 22, margin: 0 }}>Tournament history</h2>
          <span className="sk-section-label">Most recent first · click any to view</span>
        </div>

        {/* Vertical list of tournaments, with mini stats per row */}
        <div style={{ padding: '0 20px 20px' }}>
          {[
            { y: '2026', t: 'Valencia', f: '🇪🇸', medals: '3G · 2S · 1B', records: 1, finish: '2nd Division A', current: true },
            { y: '2025', t: 'Washington DC', f: '🇺🇸', medals: '2G · 3S · 2B', records: 0, finish: '4th Division A' },
            { y: '2024', t: 'Buenos Aires', f: '🇦🇷', medals: '4G · 2S · 1B', records: 1, finish: '1st Division B' },
            { y: '2023', t: 'London', f: '🇬🇧', medals: '1G · 2S · 3B', records: 0, finish: '3rd Division A' },
            { y: '2022', t: 'Palm Springs', f: '🇺🇸', medals: '1G · 1S · 1B', records: 0, finish: '3rd Division B' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '50px 30px 1fr auto auto', gap: 14,
              padding: '12px 8px', borderBottom: '1px solid var(--sk-line)', alignItems: 'center'
            }}>
              <span className="sk-display" style={{ fontSize: 22, color: r.current ? 'var(--sk-coral)' : 'var(--sk-ink-2)' }}>{r.y}</span>
              <span style={{ fontSize: 18 }}>{r.f}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.t} · <span style={{ color: 'var(--sk-ink-3)', fontWeight: 400 }}>{r.finish}</span></div>
                <div style={{ fontSize: 10.5, color: 'var(--sk-ink-3)', marginTop: 2 }}>{r.medals}{r.records ? ` · ★ ${r.records} record` : ''}</div>
              </div>
              <span className="sk-pill" style={{ fontSize: 9 }}>View results →</span>
            </div>
          ))}
        </div>

        <div className="sk-note" style={{ position: 'absolute', right: 18, bottom: 14, maxWidth: 220, textAlign: 'right', fontSize: 12 }}>
          Just tournament history — each row links through to that tournament's full results.
        </div>
      </div>
    </div>
  );
}

// ----------- 4) TOURNAMENTS LIST -----------
function WFTournaments() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />
        <WFHeader kicker="Championship since 1987" italic="Every summer," title="a new city." lede />

        {/* Next-up hero */}
        <div style={{ margin: '18px 20px', padding: 20, borderRadius: 10, background: 'linear-gradient(135deg, #1f3b54, #1d5273)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.18)', padding: '3px 9px', borderRadius: 99,
            fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
          }}>● Next up · 2027</span>
          <div className="sk-display" style={{ fontSize: 32, marginTop: 8 }}>Montréal 2027</div>
          <div className="sk-italic sk-display" style={{ fontSize: 13, opacity: 0.85 }}>IGLA+ Championship</div>
          <div style={{ fontSize: 11, marginTop: 8, opacity: 0.8 }}>🇨🇦 Jul 30 – Aug 5 · Parc Olympique</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div><div className="sk-display" style={{ fontSize: 22 }}>1,500+</div><div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Athletes</div></div>
            <div><div className="sk-display" style={{ fontSize: 22 }}>32</div><div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nations</div></div>
            <div><div className="sk-display" style={{ fontSize: 22 }}>70</div><div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clubs</div></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 8px' }}>
          <span className="sk-pill active">All 7</span>
          <span className="sk-pill">Upcoming 2</span>
          <span className="sk-pill">Past 4</span>
        </div>

        {/* List */}
        <div style={{ padding: '0 20px 20px' }}>
          {[
            { y: '2026', n: 'Valencia', f: '🇪🇸', co: 'Gay Games XII', status: 'live', stats: '1,842 · 34 · 86', rec: 9 },
            { y: '2025', n: 'Washington DC', f: '🇺🇸', co: 'IGLA+ Championship', status: 'past', stats: '1,214 · 26 · 58', rec: 6 },
            { y: '2024', n: 'Buenos Aires', f: '🇦🇷', co: 'IGLA+ Championship', status: 'past', stats: '980 · 22 · 47', rec: 4 },
            { y: '2023', n: 'London', f: '🇬🇧', co: 'IGLA+ Championship', status: 'past', stats: '1,108 · 28 · 62', rec: 7 },
            { y: '2028', n: 'Reykjavík', f: '🇮🇸', co: 'IGLA+ Championship', status: 'upcoming', stats: '~1,100 expected', rec: null },
          ].map((r, i) => (
            <div key={i} className="sk-card" style={{ display: 'grid', gridTemplateColumns: '50px 1fr auto auto', gap: 14, padding: '12px 14px', alignItems: 'center', marginBottom: 6 }}>
              <span className="sk-display" style={{ fontSize: 28, color: r.status === 'live' ? 'var(--sk-coral)' : r.status === 'upcoming' ? 'var(--sk-aqua)' : 'var(--sk-ink-2)' }}>{r.y}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.f} {r.n}</div>
                <div className="sk-italic sk-display" style={{ fontSize: 11, color: 'var(--sk-ink-3)' }}>{r.co} · {r.stats}</div>
              </div>
              {r.status === 'live' && <span className="sk-pill coral" style={{ fontSize: 9 }}>● LIVE NOW</span>}
              {r.status === 'upcoming' && <span className="sk-pill" style={{ background: 'var(--sk-aqua-soft)', borderColor: 'var(--sk-aqua)', color: 'var(--sk-aqua)', fontSize: 9 }}>UPCOMING</span>}
              {r.status === 'past' && <span className="sk-pill" style={{ fontSize: 9 }}>ARCHIVE</span>}
              <div style={{ textAlign: 'right', minWidth: 50 }}>
                {r.rec ? <span className="sk-display" style={{ fontSize: 22, color: 'var(--sk-coral)' }}>{r.rec}</span> : <span style={{ color: 'var(--sk-ink-3)' }}>—</span>}
                <div className="sk-section-label" style={{ marginTop: 2 }}>Records</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------- 5) TOURNAMENT DETAIL (= the old results page) -----------
function WFTournamentDetail() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />

        <div style={{ padding: '10px 20px', fontSize: 10.5, color: 'var(--sk-ink-3)', borderBottom: '1px solid var(--sk-line)' }}>
          ← Tournaments / <span style={{ color: 'var(--sk-ink-2)' }}>Valencia 2026</span>
        </div>

        {/* Hero — like current results page */}
        <div style={{ padding: '20px' }}>
          <span className="sk-pill coral">● LIVE · June 14–21, 2026</span>
          <h1 className="sk-h1" style={{ fontSize: 44, marginTop: 12 }}>
            <span className="sk-italic" style={{ color: 'var(--sk-aqua)' }}>Valencia 2026</span><br/>
            Championship Results
          </h1>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11, color: 'var(--sk-ink-2)' }}>
            <span>📅 Jun 14–21</span><span>📍 Piscina de Benimàmet</span><span>🌐 Valencia 🇪🇸</span>
          </div>
        </div>

        <WFKpi items={[
          { v: '1,842', k: 'Participants' }, { v: '34', k: 'Nations' },
          { v: '86', k: 'Clubs' }, { v: '9', k: 'New records', color: 'var(--sk-coral)' },
        ]} />

        {/* Sport toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 10px' }}>
          <div>
            <h2 className="sk-display" style={{ fontSize: 22, margin: 0 }}>Swimming Results</h2>
            <div style={{ fontSize: 11, color: 'var(--sk-ink-3)', marginTop: 2 }}>Highlighted rows are new all-time records</div>
          </div>
          <div style={{ display: 'inline-flex', padding: 3, background: 'var(--sk-fill)', borderRadius: 99, border: '1px solid var(--sk-line)' }}>
            <span className="sk-pill active" style={{ borderRadius: 99 }}>Swim</span>
            <span className="sk-pill" style={{ border: 0, background: 'transparent' }}>Polo</span>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 6, padding: '0 20px 10px', flexWrap: 'wrap' }}>
          <div className="sk-card-flat" style={{ height: 26, flex: '1 1 160px', padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: 10, color: 'var(--sk-ink-3)' }}>🔎 Search…</div>
          <span className="sk-pill">Event ▾</span>
          <span className="sk-pill">Age ▾</span>
          <span className="sk-pill">Gender ▾</span>
        </div>

        {/* Table */}
        <div style={{ padding: '0 20px 20px' }}>
          {[
            { p:1, e:'50m Free · Men 30-34', who:'Mateo Reyes · WH2O', t:'00:23.41', r:true },
            { p:2, e:'50m Free · Men 30-34', who:'Tomás Vidal · ACC', t:'00:24.02' },
            { p:3, e:'50m Free · Men 30-34', who:'Henrik S. · CMM', t:'00:24.18' },
            { p:1, e:'100m Fly · Mixed 30-34', who:'C. Beaulieu · ACC', t:'01:01.23', r:true },
            { p:1, e:'200m Breast · W 40-44', who:'A. Karlsson · SST', t:'02:39.18', r:true },
            { p:1, e:'1500m Free · M 40-44', who:'Diego Fonseca · BTN', t:'17:48.22', r:true },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr 100px 80px', gap: 10, alignItems: 'center',
              padding: '10px 4px', borderBottom: '1px solid var(--sk-line)',
              background: r.r ? 'linear-gradient(90deg, rgba(199,89,57,0.08), transparent)' : 'transparent',
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 600,
                background: r.p === 1 ? 'var(--sk-gold)' : r.p === 2 ? '#bababa' : '#c89479', color: 'white',
              }}>{r.p}</span>
              <span style={{ fontSize: 11.5 }}>{r.e}</span>
              <span style={{ fontSize: 11, color: 'var(--sk-ink-2)' }}>{r.who}</span>
              <span className="sk-mono" style={{ fontSize: 11, textAlign: 'right', fontWeight: 500 }}>
                {r.t}{r.r && <span style={{ color: 'var(--sk-coral)', marginLeft: 4 }}>★</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="sk-note" style={{ position: 'absolute', left: 20, bottom: 16, maxWidth: 240, fontSize: 12 }}>
          Same shape as the existing Results page we built — just one tournament's worth, reached from the Tournaments list.
        </div>
      </div>
    </div>
  );
}

// ----------- 6) ATHLETE PROFILE (compact recap) -----------
function WFAthleteProfile() {
  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: 0, overflow: 'hidden' }}>
        <WFTop />
        <div style={{ padding: '10px 20px', fontSize: 10.5, color: 'var(--sk-ink-3)', borderBottom: '1px solid var(--sk-line)' }}>
          ← back
        </div>

        {/* Athlete header */}
        <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--sk-line)' }}>
          <span className="sk-pill" style={{ fontSize: 9 }}>● Athlete profile</span>
          <h1 className="sk-h1" style={{ fontSize: 52, marginTop: 12 }}>Mateo Reyes</h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--sk-ink-2)' }}>
            <span># West Hollywood Aquatics</span><span>📍 Los Angeles</span><span>📅 Since 2019</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <span className="sk-pill" style={{ background: 'var(--sk-paper)', borderColor: 'var(--sk-line-2)' }}>👤 Claim this profile</span>
            <span className="sk-pill" style={{ background: 'var(--sk-paper)', borderColor: 'var(--sk-line-2)' }}>↗ Share</span>
          </div>
        </div>

        <WFKpi items={[
          { v: '4', k: 'Tournaments' }, { v: '8', k: 'Events' },
          { v: '5', k: 'Golds', color: 'var(--sk-gold)' }, { v: '1', k: 'Records', color: 'var(--sk-coral)' },
        ]} />

        {/* Timeline */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 className="sk-display" style={{ fontSize: 22, margin: 0 }}>Career timeline</h2>
            <span className="sk-section-label">Most recent first</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 56, top: 8, bottom: 8, width: 1, background: 'var(--sk-line-2)' }}></div>
            {[
              { y: '2026', t: 'Valencia 🇪🇸', sw: ['50 Free 23.41 ★','100 Fly 56.12','200 IM 2:12.84'], wp: 'WH2O — 1st Division A' },
              { y: '2025', t: 'Palm Springs 🇺🇸', sw: ['50 Free 23.78','100 Fly 56.91'], wp: null },
              { y: '2024', t: 'Lisbon 🇵🇹', sw: ['100 Fly 57.44'], wp: 'WH2O — 2nd Div B' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 18, alignItems: 'start', padding: '10px 0' }}>
                <span className="sk-display" style={{ fontSize: 24, textAlign: 'right', color: i === 0 ? 'var(--sk-coral)' : 'var(--sk-ink-2)' }}>{e.y}</span>
                <div>
                  <div className="sk-section-label" style={{ marginBottom: 6 }}>{e.t}</div>
                  <div className="sk-card" style={{ padding: '8px 12px', marginBottom: 6 }}>
                    <div style={{ fontSize: 9.5, color: 'var(--sk-ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>● Swimming</div>
                    {e.sw.map((s, j) => <div key={j} style={{ fontSize: 11, padding: '3px 0' }}>{s}</div>)}
                  </div>
                  {e.wp && (
                    <div className="sk-card" style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 9.5, color: 'var(--sk-coral)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>◎ Water polo</div>
                      <div style={{ fontSize: 11 }}>{e.wp}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WFResults, WFClubs, WFClubDetail, WFTournaments, WFTournamentDetail, WFAthleteProfile });
