// Athlete Profile — career timeline in G's tile style.

function AthleteProfile({ athleteId, onBack, onSelectAthlete }) {
  const athlete = window.IGLA_DATA.athletes[athleteId];

  if (!athlete) {
    return (
      <div className="view-enter empty">
        <h3>Athlete not found</h3>
        <button className="back-link" onClick={onBack}><ArrowLeft size={13} /> Back to results</button>
      </div>
    );
  }

  const placeSuffix = (p) => p === 1 ? 'st' : p === 2 ? 'nd' : p === 3 ? 'rd' : 'th';

  const totalEvents = athlete.timeline.reduce((acc, t) => acc + (t.swimming?.length || 0) + (t.waterPolo ? 1 : 0), 0);
  const totalRecords = athlete.timeline.reduce((acc, t) => acc + (t.swimming?.filter(e => e.record).length || 0), 0);
  const totalGold = athlete.timeline.reduce((acc, t) =>
    acc + (t.swimming?.filter(e => e.place === 1).length || 0) + (t.waterPolo?.finish === 1 ? 1 : 0), 0);

  return (
    <div className="view-enter" data-screen-label={`Athlete · ${athlete.name}`}>
      <div className="breadcrumb">
        <a onClick={onBack}>Back to results</a>
      </div>

      {/* Hero — athlete name as the splash */}
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className="eyebrow eyebrow-on-dark">
          ● Athlete profile
        </span>
        <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>{athlete.name}</h1>
        <div className="profile-meta">
          <span className="profile-meta-item"><Hash size={14} /> {athlete.club}</span>
          <span className="profile-meta-item"><MapPin size={14} /> {athlete.hometown}</span>
          <span className="profile-meta-item"><Calendar size={14} /> Member since {athlete.joined}</span>
          <span className="profile-meta-item" style={{ opacity: 0.7 }}>{athlete.pronouns}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
          {athlete.claimed ? (
            <span className="btn success">
              <CheckCircle size={13} /> Profile claimed
            </span>
          ) : (
            <button className="btn">
              <UserPlus size={13} /> Claim this profile
            </button>
          )}
          <button className="btn">
            <Share size={13} /> Share
          </button>
        </div>
      </section>

      {/* Quick stats */}
      <div className="stat-strip">
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{athlete.timeline.length}</div>
          <div className="stat-tile-key">Tournaments</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{totalEvents}</div>
          <div className="stat-tile-key">Events competed</div>
        </div>
        <div className="stat-tile" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
          <div className="stat-tile-val tab-nums">{totalGold}</div>
          <div className="stat-tile-key">Gold finishes</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val tab-nums">{totalRecords}</div>
          <div className="stat-tile-key">All-time records</div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2 className="display display-3">Career timeline</h2>
          <div className="sub">Every IGLA+ Championship {athlete.name.split(' ')[0]} has competed in.</div>
        </div>
        <span className="section-label">Most recent first</span>
      </div>

      <div className="timeline">
        {athlete.timeline.map((entry, i) => (
          <div key={i} className={`timeline-row ${i === 0 ? 'recent' : ''}`}>
            <div>
              <div className="tl-year tab-nums">{entry.year}</div>
              <div className="tl-tournament">
                <span style={{ fontSize: 16, marginRight: 6, letterSpacing: 0 }}>{entry.flag}</span>
                {entry.tournament}
              </div>
            </div>
            <div className="tl-body">
              {entry.swimming && entry.swimming.length > 0 && (
                <div>
                  <div className="tl-block-head">
                    <span className="ic"><Waves size={12} /></span>
                    Swimming · {entry.swimming.length} event{entry.swimming.length !== 1 ? 's' : ''}
                  </div>
                  {entry.swimming.map((e, j) => (
                    <div key={j} className="tl-event">
                      <div>
                        <div className="ev-name">{e.event}</div>
                        <div className="ev-cat">{e.category}</div>
                      </div>
                      <span className="ev-time">{e.time}</span>
                      <span className={`place-badge place-${e.place > 3 ? 'other' : e.place}`}>{e.place}</span>
                      <div style={{ minWidth: 84, textAlign: 'right' }}>
                        {e.record
                          ? <span className="status-pill live" style={{ fontSize: 9 }}><Sparkles size={10} /> Record</span>
                          : <span style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>{e.place}{placeSuffix(e.place)} place</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.waterPolo && (
                <div>
                  <div className="tl-block-head wp">
                    <span className="ic"><Target size={12} /></span>
                    Water polo · Division {entry.waterPolo.division}
                  </div>
                  <div className="wp-row">
                    <div>
                      <div className="wp-team">{entry.waterPolo.team}</div>
                      <div className="wp-role">{entry.waterPolo.role}</div>
                    </div>
                    <span className={`place-badge place-${entry.waterPolo.finish > 3 ? 'other' : entry.waterPolo.finish}`}>{entry.waterPolo.finish}</span>
                    <span className="wp-finish tab-nums">
                      {entry.waterPolo.finish}{placeSuffix(entry.waterPolo.finish)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.AthleteProfile = AthleteProfile;
