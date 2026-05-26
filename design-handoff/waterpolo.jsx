// Water polo — per-tournament standings in G's chunky tile style.

const { useState: useWPState } = React;

function WaterPoloView({ data, onSelectAthlete }) {
  const divisions = (data || window.IGLA_DATA.waterPolo).divisions;
  const [expanded, setExpanded] = useWPState(new Set(["wh2o-wp"]));

  const toggle = (id) => setExpanded(prev => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  return (
    <div>
      {divisions.map(div => (
        <section key={div.id} style={{ marginBottom: 32 }}>
          <div className="division-row">
            <div>
              <span className="division-letter">{div.id}</span>
              <span className="division-meta">
                <div className="division-name">{div.name}</div>
                <div className="division-sub">{div.subtitle} · {div.standings.length} teams</div>
              </span>
            </div>
            <span className="section-label">Final Standings</span>
          </div>

          <div className="team-stack">
            {div.standings.map(t => {
              const isOpen = expanded.has(t.teamId);
              const diff = t.goalsFor - t.goalsAgainst;
              return (
                <article key={t.teamId} className={`team-card ${isOpen ? 'expanded' : ''} ${t.place === 1 ? 'champion' : ''}`}>
                  <button className="team-header" onClick={() => toggle(t.teamId)} aria-expanded={isOpen}>
                    <div className="team-place tab-nums">
                      {String(t.place).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="team-name">
                        {t.team}
                        {t.place === 1 && (
                          <span style={{
                            marginLeft: 10,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'var(--coral)', color: 'white',
                            padding: '2px 8px', borderRadius: 999,
                            border: '1.5px solid var(--ink)',
                            fontSize: 9.5, fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            verticalAlign: 'middle',
                          }}>
                            <Trophy size={10} /> Champion
                          </span>
                        )}
                      </div>
                      <div className="team-meta">
                        <span><Users size={11} style={{ verticalAlign: '-1px', marginRight: 4 }}/>{t.roster.length} players</span>
                        <span>{isOpen ? 'Hide' : 'View'} roster</span>
                      </div>
                    </div>
                    <div className="team-stat hide-mobile">
                      <div className="v">{t.wins}–{t.losses}</div>
                      <div className="k">Record</div>
                    </div>
                    <div className="team-stat hide-mobile">
                      <div className="v tab-nums">{t.goalsFor}</div>
                      <div className="k">For</div>
                    </div>
                    <div className="team-stat hide-mobile">
                      <div className="v tab-nums">{t.goalsAgainst}</div>
                      <div className="k">Against</div>
                    </div>
                    <div className="team-stat hide-mobile">
                      <div className="v tab-nums" style={{ color: diff > 0 ? 'var(--coral-deep)' : 'var(--ink-2)' }}>
                        {diff > 0 ? '+' : ''}{diff}
                      </div>
                      <div className="k">Diff</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="team-points">{t.points}</div>
                        <div className="k" style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700 }}>Pts</div>
                      </div>
                      <span className="chev"><ChevronDown size={18} /></span>
                    </div>
                  </button>

                  <div className="roster">
                    <div className="roster-inner">
                      <div style={{
                        padding: '14px 22px 6px',
                        fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--ink-3)', fontWeight: 700,
                      }}>
                        Roster
                      </div>
                      <div className="roster-grid">
                        {t.roster.map((p, i) => (
                          <button
                            key={i}
                            className={`roster-item ${p.captain ? 'captain' : ''}`}
                            onClick={() => onSelectAthlete && onSelectAthlete(p.athleteId)}
                          >
                            <div className="cap-badge">{p.cap}</div>
                            <div>
                              <div className="roster-name">
                                {p.name}
                                {p.captain && <span className="captain-c">C</span>}
                              </div>
                              <div className="roster-role">{p.role}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

window.WaterPoloView = WaterPoloView;
