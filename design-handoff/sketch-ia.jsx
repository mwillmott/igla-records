// Information Architecture sketch — single sitemap artboard

function SketchIA() {
  // Coordinates for nodes (in artboard's coordinate space)
  // Artboard: 1240 × 720
  const ROOT = { x: 590, y: 60 };
  const TOP = [
    { id: 'clubs', x: 80, y: 200, label: 'Clubs', sub: 'Browse all clubs' },
    { id: 'tournaments', x: 360, y: 200, label: 'Tournaments', sub: 'Upcoming + archive' },
    { id: 'results', x: 660, y: 200, label: 'Results', sub: 'All-time records + winners' },
    { id: 'about', x: 980, y: 200, label: 'About', sub: 'Org info' },
  ];
  const DETAIL = [
    { id: 'club-detail', x: 80, y: 380, label: 'Club detail', sub: 'History + records' },
    { id: 'tournament-detail', x: 360, y: 380, label: 'Tournament detail', sub: 'Per-event results' },
  ];
  const LEAF = [
    { id: 'athlete', x: 220, y: 560, label: 'Athlete profile', sub: 'Career timeline' },
  ];

  // Build connector path between two nodes (curved L)
  const connect = (a, b, dx = 0, dy = 0) => {
    const x1 = a.x + 75; const y1 = a.y + 50;
    const x2 = b.x + 75 + dx; const y2 = b.y + dy;
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  return (
    <div className="sk">
      <div className="sk-frame" style={{ padding: '32px 32px 24px' }}>
        {/* Title strip */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="sk-section-label">01 · Information Architecture</div>
            <h2 className="sk-h1" style={{ fontSize: 32, marginTop: 4 }}>
              Four top-level pages, two <span className="sk-italic" style={{ color: 'var(--sk-coral)' }}>detail</span> pages, one shared profile.
            </h2>
          </div>
          <div className="sk-note" style={{ maxWidth: 280, textAlign: 'right' }}>
            "Results" is now the all-time records hub — what the old "Results" page becomes is the tournament-detail view.
          </div>
        </div>

        {/* Diagram canvas */}
        <div style={{ position: 'relative', width: 1180, height: 580, marginTop: 8 }}>
          <svg width="1180" height="580" style={{ position: 'absolute', inset: 0 }}>
            {/* Root → top */}
            {TOP.map(n => (
              <path key={'r-'+n.id} d={connect(ROOT, n)} className="sk-arrow" />
            ))}
            {/* Clubs → Club detail */}
            <path d={connect(TOP[0], DETAIL[0])} className="sk-arrow" />
            {/* Tournaments → Tournament detail */}
            <path d={connect(TOP[1], DETAIL[1])} className="sk-arrow" />
            {/* Results → Athlete profile (drill in) */}
            <path d={`M ${TOP[2].x + 75} ${TOP[2].y + 50} C ${TOP[2].x + 75} 480, ${LEAF[0].x + 75 + 80} 480, ${LEAF[0].x + 75 + 80} ${LEAF[0].y}`} className="sk-arrow flow" />
            {/* Club detail → Athlete profile */}
            <path d={connect(DETAIL[0], LEAF[0], 20, 0)} className="sk-arrow flow" />
            {/* Tournament detail → Athlete profile */}
            <path d={`M ${DETAIL[1].x + 75} ${DETAIL[1].y + 50} C ${DETAIL[1].x + 75} 500, ${LEAF[0].x + 75} 500, ${LEAF[0].x + 75} ${LEAF[0].y}`} className="sk-arrow flow" />
            {/* Tournament detail ↔ Club detail (athletes attend via clubs) */}
            <path d={`M ${DETAIL[1].x} ${DETAIL[1].y + 25} L ${DETAIL[0].x + 150} ${DETAIL[0].y + 25}`} className="sk-arrow flow" />

            {/* arrowheads */}
            <defs>
              <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--sk-line-2)" />
              </marker>
            </defs>
          </svg>

          {/* Root node */}
          <div style={{ position: 'absolute', left: ROOT.x, top: ROOT.y, width: 150 }}>
            <div className="sk-node primary" style={{ width: '100%', alignItems: 'center' }}>
              IGLA+ Records
              <small>Top nav</small>
            </div>
          </div>

          {/* Top-level nodes */}
          {TOP.map(n => (
            <div key={n.id} style={{ position: 'absolute', left: n.x, top: n.y, width: 150 }}>
              <div className="sk-node" style={{ width: '100%', alignItems: 'flex-start' }}>
                {n.label}
                <small>{n.sub}</small>
              </div>
            </div>
          ))}

          {/* Detail nodes */}
          {DETAIL.map(n => (
            <div key={n.id} style={{ position: 'absolute', left: n.x, top: n.y, width: 150 }}>
              <div className="sk-node detail" style={{ width: '100%', alignItems: 'flex-start' }}>
                {n.label}
                <small>{n.sub}</small>
              </div>
            </div>
          ))}

          {/* Leaf */}
          {LEAF.map(n => (
            <div key={n.id} style={{ position: 'absolute', left: n.x, top: n.y, width: 160 }}>
              <div className="sk-node leaf" style={{ width: '100%', alignItems: 'flex-start' }}>
                {n.label}
                <small>{n.sub}</small>
              </div>
            </div>
          ))}

          {/* Annotations */}
          <div className="sk-callout" style={{ left: 880, top: 270, maxWidth: 240 }}>
            <span className="sk-note-tag">Note</span><br/>
            Records page is the <span className="sk-italic">main entry point</span> for stat-watchers — surface medal counts and broken records first, then let users drill into the athlete behind each one.
          </div>

          <div className="sk-callout" style={{ left: 8, top: 466, maxWidth: 230 }}>
            <span className="sk-note-tag">Athletes move</span><br/>
            Club pages show <span className="sk-italic">athletes over time</span>, grouped by tournament-year, not a current roster.
          </div>

          <div className="sk-callout" style={{ left: 470, top: 466, maxWidth: 250 }}>
            <span className="sk-note-tag">Reuse</span><br/>
            Tournament detail = the existing Results page we already built.
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', gap: 18, fontSize: 11, color: 'var(--sk-ink-3)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke="var(--sk-line-2)" strokeWidth="1.25" /></svg>
              Nav hierarchy
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke="var(--sk-coral)" strokeWidth="1.25" strokeDasharray="3 3" /></svg>
              User drills through
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SketchIA = SketchIA;
