// Club Detail — header + lifetime KPIs + tournament history list.

function ClubDetail({ clubId, onBack, onSelectTournament }) {
  const club = window.IGLA_CLUBS.find(c => c.id === clubId);
  if (!club) {
    return (
      <div className="view-enter empty">
        <h3>Club not found</h3>
        <button className="back-link" onClick={onBack}><ArrowLeft size={13} /> Back to clubs</button>
      </div>
    );
  }

  const history = window.IGLA_CLUB_HISTORY[clubId] || window.IGLA_CLUB_HISTORY['_default'];

  // Sum lifetime totals from the history rows
  const totals = history.reduce((acc, h) => ({
    g: acc.g + h.medals.g,
    s: acc.s + h.medals.s,
    b: acc.b + h.medals.b,
    rec: acc.rec + h.records,
  }), { g: 0, s: 0, b: 0, rec: 0 });

  return (
    <div className="view-enter" data-screen-label={`Club · ${club.name}`}>
      <div className="breadcrumb">
        <a onClick={onBack}>Clubs</a>
        <span className="sep">/</span>
        <span style={{ color: 'var(--ink-2)' }}>{club.name}</span>
      </div>

      {/* Hero — deep tile, club identity + tagline */}
      <section className="tile tile-lg hero tile-depth-aqua" style={{ background: `var(--depth-overlay), ${club.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <span style={{ fontSize: 38, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{club.flag}</span>
          <div>
            <span className="eyebrow eyebrow-on-dark">
              {club.region} · est. {club.founded}
            </span>
          </div>
        </div>
        <h1>{club.name}</h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 22, color: 'rgba(255,255,255,0.95)', marginTop: 8,
          maxWidth: 540, textWrap: 'pretty',
        }}>
          "{club.tagline}"
        </p>
        <div className="hero-meta">
          <span className="hero-meta-item"><MapPin size={14} /> {club.city}, {club.country}</span>
          <span className="hero-meta-item"><Users size={14} /> {club.members} members</span>
          <span className="hero-meta-item"><Calendar size={14} /> {club.tournamentsAttended} championships attended</span>
        </div>
      </section>

      {/* Lifetime KPIs */}
      <div className="stat-strip" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{club.tournamentsAttended}</div>
          <div className="stat-tile-key">Championships</div>
        </div>
        <div className="stat-tile" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
          <div className="stat-tile-val tab-nums">{totals.g || club.medals.gold}</div>
          <div className="stat-tile-key">Gold</div>
        </div>
        <div className="stat-tile" style={{ background: 'var(--silver)', color: 'var(--ink)' }}>
          <div className="stat-tile-val tab-nums">{totals.s || club.medals.silver}</div>
          <div className="stat-tile-key">Silver</div>
        </div>
        <div className="stat-tile" style={{ background: 'var(--bronze)', color: 'white' }}>
          <div className="stat-tile-val tab-nums">{totals.b || club.medals.bronze}</div>
          <div className="stat-tile-key">Bronze</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val tab-nums">{totals.rec || club.medals.records}</div>
          <div className="stat-tile-key">All-time records</div>
        </div>
      </div>

      {/* Sports they participate in */}
      <div style={{ marginTop: 22, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="section-label" style={{ alignSelf: 'center', marginRight: 4 }}>Sports:</span>
        {club.sports.map(s => (
          <span key={s} className={`sport-pill ${s === 'Pink Flamingo' ? 'flamingo' : ''}`}>
            {s === 'Swimming' && <Waves size={11} />}
            {s === 'Water Polo' && <Target size={11} />}
            {s}
          </span>
        ))}
      </div>

      {/* Tournament history */}
      <div className="section-head">
        <div>
          <h2 className="display display-3">Tournament history</h2>
          <div className="sub">Each championship {club.short} has attended. Click any to view the full results.</div>
        </div>
        <span className="section-label">Most recent first</span>
      </div>

      <div className="tournament-list">
        {history.map((h, i) => (
          <button
            key={i}
            className={`tournament-row ${h.isLive ? 'live' : ''}`}
            onClick={() => h.tournamentId && onSelectTournament && onSelectTournament(h.tournamentId)}
            disabled={!h.tournamentId}
            style={{ cursor: h.tournamentId ? 'pointer' : 'default', opacity: h.tournamentId ? 1 : 0.7 }}
          >
            <span className="t-year tab-nums">{h.year}</span>
            <div>
              <div className="t-name">
                <span style={{ fontSize: 18, marginRight: 8 }}>{h.flag}</span>
                {h.tournament}
              </div>
              <div className="t-loc">
                <span>
                  <span style={{ color: 'var(--gold)', marginRight: 4 }}>●</span>{h.medals.g}
                  <span style={{ marginLeft: 10, color: 'var(--silver)', marginRight: 4 }}>●</span>{h.medals.s}
                  <span style={{ marginLeft: 10, color: 'var(--bronze)', marginRight: 4 }}>●</span>{h.medals.b}
                </span>
                {h.records > 0 && (
                  <span style={{ color: 'var(--coral-deep)', fontWeight: 600 }}>
                    <Sparkles size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                    {h.records} record{h.records !== 1 ? 's' : ''}
                  </span>
                )}
                {h.wpDivision && (
                  <span style={{ color: 'var(--ink-3)' }}>
                    Water polo: {h.wpFinish === 1 ? '🏆 ' : ''}{h.wpFinish}{ordinalSuffix(h.wpFinish)} in Division {h.wpDivision}
                  </span>
                )}
              </div>
            </div>
            <div>
              {h.isLive
                ? <span className="status-pill live"><span className="dot" /> Live now</span>
                : <span className="status-pill past">Archive</span>}
            </div>
            <div className="t-stats hide-mobile">
              <div className="t-stat">
                <div className="v tab-nums">{h.medals.g + h.medals.s + h.medals.b}</div>
                <div className="k">Medals</div>
              </div>
            </div>
            {h.tournamentId
              ? <ChevronRight size={18} style={{ color: 'var(--ink-3)' }} />
              : <span style={{ width: 18 }}></span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function ordinalSuffix(n) {
  const j = n % 10, k = n % 100;
  if (k >= 11 && k <= 13) return 'th';
  if (j === 1) return 'st';
  if (j === 2) return 'nd';
  if (j === 3) return 'rd';
  return 'th';
}

window.ClubDetail = ClubDetail;
