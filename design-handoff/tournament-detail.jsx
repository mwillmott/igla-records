// Tournament Detail — per-tournament results page (the page formerly known as Results).
// Hero + swim/water-polo toggle + tables. Reached from the Tournaments list.

const { useState: useTDState, useEffect: useTDEffect, useRef: useTDRef } = React;

function TournamentDetail({ tournamentId, onBack, onSelectAthlete }) {
  const t = window.IGLA_TOURNAMENTS.find(x => x.id === tournamentId);

  const [sport, setSport] = useTDState('swimming');

  // Sport toggle pill
  const toggleRefs = { swimming: useTDRef(null), wp: useTDRef(null) };
  const [pillStyle, setPillStyle] = useTDState({ left: 4, width: 0 });
  useTDEffect(() => {
    const el = sport === 'swimming' ? toggleRefs.swimming.current : toggleRefs.wp.current;
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [sport]);

  if (!t) {
    return (
      <div className="view-enter empty">
        <h3>Tournament not found</h3>
        <button className="back-link" onClick={onBack}><ArrowLeft size={13} /> Back</button>
      </div>
    );
  }

  // Only Valencia 2026 has full mock data. For others, show a friendly stub.
  const hasData = tournamentId === 'valencia-2026';

  return (
    <div className="view-enter" data-screen-label={t.name}>
      <div className="breadcrumb">
        <a onClick={onBack}>Tournaments</a>
        <span className="sep">/</span>
        <span style={{ color: 'var(--ink-2)' }}>{t.name}</span>
      </div>

      {/* Hero */}
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className={`eyebrow eyebrow-on-dark ${t.status === 'live' ? '' : ''}`}>
          {t.status === 'live' && <>● Live · </>}
          {t.dates}
        </span>
        <h1>
          <em>{t.city} </em>
          <span className="hl">{t.year}</span>
        </h1>
        <p className="lede on-dark">{t.description}</p>
        <div className="hero-meta">
          <span className="hero-meta-item"><Calendar size={14} /> {t.dates}</span>
          <span className="hero-meta-item"><MapPin size={14} /> {t.venue}</span>
          <span className="hero-meta-item"><Globe size={14} /> {t.country} {t.flag}</span>
        </div>
      </section>

      {/* Stat tiles */}
      {t.participants !== null && (
        <div className="stat-strip">
          <div className="stat-tile">
            <div className="stat-tile-val tab-nums">{t.participants.toLocaleString()}</div>
            <div className="stat-tile-key">Participants</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val tab-nums">{t.nations}</div>
            <div className="stat-tile-key">Nations</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val tab-nums">{t.clubs}</div>
            <div className="stat-tile-key">Clubs</div>
          </div>
          <div className="stat-tile coral">
            <div className="stat-tile-val tab-nums">{t.records}</div>
            <div className="stat-tile-key">New records</div>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="empty" style={{ marginTop: 32 }}>
          <Trophy size={28} style={{ color: 'var(--ink-3)' }} />
          <h3>Results archive</h3>
          <p>Full results for {t.name} will live here once digitised. Take a look at Valencia 2026 for the live shape of this page.</p>
        </div>
      ) : (
        <>
          {/* Sport toggle */}
          <div className="section-head">
            <div>
              <h2 className="display display-3">
                {sport === 'swimming' ? 'Swimming results' : 'Water polo standings'}
              </h2>
              <div className="sub">
                {sport === 'swimming'
                  ? 'Highlighted rows are new all-time IGLA+ records set this week.'
                  : 'Final standings across all three divisions · click a team to view its roster.'}
              </div>
            </div>
            <div className="sport-toggle">
              <span className="pill-bg" style={{ left: pillStyle.left, width: pillStyle.width }} />
              <button ref={toggleRefs.swimming} className={sport === 'swimming' ? 'active' : ''} onClick={() => setSport('swimming')}>
                <Waves size={14} /> Swimming
              </button>
              <button ref={toggleRefs.wp} className={sport === 'wp' ? 'active' : ''} onClick={() => setSport('wp')}>
                <Target size={14} /> Water polo
              </button>
            </div>
          </div>

          {sport === 'swimming'
            ? <SwimmingView onSelectAthlete={onSelectAthlete} />
            : <WaterPoloView onSelectAthlete={onSelectAthlete} />}
        </>
      )}
    </div>
  );
}

window.TournamentDetail = TournamentDetail;
