// Tournaments — list + featured next-up, in G's tile style.

const { useState: useTournState, useMemo: useTournMemo } = React;

function TournamentsView({ onSelectTournament }) {
  const all = window.IGLA_TOURNAMENTS;
  const [filter, setFilter] = useTournState('all');

  const live = all.find(t => t.status === 'live');
  const upcoming = useTournMemo(() => all.filter(t => t.status === 'upcoming').sort((a, b) => a.year - b.year), [all]);
  const past = useTournMemo(() => all.filter(t => t.status === 'past').sort((a, b) => b.year - a.year), [all]);
  const nextUp = upcoming[0];

  const list = filter === 'upcoming'
    ? upcoming
    : filter === 'past'
      ? past
      : [...(live ? [live] : []), ...upcoming, ...past];

  const totalAthletes = past.reduce((a, t) => a + (t.participants || 0), 0);
  const totalRecords = past.reduce((a, t) => a + (t.records || 0), 0) + (live?.records || 0);

  return (
    <div className="view-enter" data-screen-label="Tournaments">
      {/* Hero */}
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className="eyebrow eyebrow-on-dark">
          ● Championship since 1987
        </span>
        <h1>Every <em>summer</em>,<br/>a new <span className="hl">city</span>.</h1>
        <p className="lede on-dark">
          The IGLA+ Championship rotates around the world each year. Bid for hosting opens
          every August. Browse what's coming and where we've been.
        </p>
      </section>

      <div className="stat-strip">
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{past.length + (live ? 1 : 0)}</div>
          <div className="stat-tile-key">Championships held</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{totalAthletes.toLocaleString()}+</div>
          <div className="stat-tile-key">Athletes hosted</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val tab-nums">{totalRecords}</div>
          <div className="stat-tile-key">Records broken</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{upcoming.length}</div>
          <div className="stat-tile-key">Upcoming</div>
        </div>
      </div>

      {/* Next up — a dedicated deeper-aqua tile */}
      {nextUp && (
        <section
          className="tile tile-lg view-enter"
          style={{
            marginTop: 22,
            padding: '26px 30px 28px',
            background: `var(--depth-overlay), ${nextUp.color}`,
            color: 'white',
            cursor: 'pointer',
          }}
          onClick={() => onSelectTournament(nextUp.id)}
        >
          <span className="eyebrow eyebrow-on-dark">
            <Calendar size={11} /> Next up · {nextUp.year}
          </span>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: '14px 0 4px', color: 'white' }}>
            <em>{nextUp.city}</em> <span className="hl">{nextUp.year}</span>
          </h2>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.85)' }}>
            {nextUp.coName}
          </div>
          <div className="hero-meta" style={{ marginTop: 16 }}>
            <span className="hero-meta-item"><span style={{ fontSize: 18 }}>{nextUp.flag}</span> {nextUp.city}, {nextUp.country}</span>
            <span className="hero-meta-item"><Calendar size={14} /> {nextUp.dates}</span>
            <span className="hero-meta-item"><MapPin size={14} /> {nextUp.venue}</span>
          </div>
          {nextUp.expected && (
            <div style={{
              marginTop: 22, paddingTop: 18,
              borderTop: '2px solid rgba(255,255,255,0.25)',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
            }}>
              {[
                { v: nextUp.expected.athletes.toLocaleString() + '+', k: 'Athletes expected' },
                { v: nextUp.expected.nations, k: 'Nations' },
                { v: nextUp.expected.clubs, k: 'Clubs' },
              ].map(s => (
                <div key={s.k}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.75, marginTop: 6, fontWeight: 700 }}>{s.k}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filter + list */}
      <div className="section-head">
        <div>
          <h2 className="display display-3">All championships</h2>
          <div className="sub">Click any tournament for the full results.</div>
        </div>
        <div className="filter-row" style={{ margin: 0 }}>
          <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="count">{(live ? 1 : 0) + upcoming.length + past.length}</span>
          </button>
          <button className={`pill ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
            Upcoming <span className="count">{upcoming.length}</span>
          </button>
          <button className={`pill ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>
            Past <span className="count">{past.length}</span>
          </button>
        </div>
      </div>

      <div className="tournament-list">
        {list.map(t => (
          <button
            key={t.id}
            className={`tournament-row ${t.status}`}
            onClick={() => onSelectTournament(t.id)}
          >
            <span className="t-year tab-nums">{t.year}</span>

            <div>
              <div className="t-name">
                <span style={{ fontSize: 18, marginRight: 8 }}>{t.flag}</span>
                {t.name}
              </div>
              <div className="t-co">{t.coName}</div>
              <div className="t-loc">
                <span>{t.city}, {t.country}</span>
                <span style={{ color: 'var(--ink-3)' }}>{t.dates}</span>
              </div>
              {t.status === 'past' && t.podium && (
                <div className="t-podium">
                  {t.podium.map((p, i) => (
                    <span key={i} className="place">
                      <span className="dot" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              {t.status === 'live' && <span className="status-pill live"><span className="dot" /> Live now</span>}
              {t.status === 'upcoming' && <span className="status-pill upcoming">Upcoming</span>}
              {t.status === 'past' && <span className="status-pill past">Archive</span>}
            </div>

            <div className="t-stats hide-mobile">
              {t.participants !== null ? (
                <>
                  <div className="t-stat">
                    <div className="v tab-nums">{t.participants.toLocaleString()}</div>
                    <div className="k">Athletes</div>
                  </div>
                  <div className="t-stat">
                    <div className="v tab-nums">{t.clubs}</div>
                    <div className="k">Clubs</div>
                  </div>
                </>
              ) : (
                <div className="t-stat">
                  <div className="v" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)' }}>Coming</div>
                  <div className="k">&nbsp;</div>
                </div>
              )}
            </div>

            <div className="t-records">
              <div className={`t-records-val tab-nums ${!t.records ? 'zero' : ''}`}>{t.records ?? '—'}</div>
              <div style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700, marginTop: 2 }}>Records</div>
            </div>

            <ChevronRight size={18} style={{ color: 'var(--ink-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

window.TournamentsView = TournamentsView;
