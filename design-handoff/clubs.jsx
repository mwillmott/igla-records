// Clubs — list of IGLA+ member clubs in G's tile style.

const { useState: useClubsState, useMemo: useClubsMemo } = React;

function ClubsView({ onSelectClub }) {
  const clubs = window.IGLA_CLUBS;
  const [region, setRegion] = useClubsState('All');
  const [search, setSearch] = useClubsState('');

  const regions = useClubsMemo(() => {
    const r = {};
    clubs.forEach(c => { r[c.region] = (r[c.region] || 0) + 1; });
    return [
      { name: 'All', count: clubs.length },
      ...Object.entries(r).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    ];
  }, [clubs]);

  const filtered = useClubsMemo(() => {
    const q = search.trim().toLowerCase();
    return clubs.filter(c => {
      if (region !== 'All' && c.region !== region) return false;
      if (q) {
        const hay = `${c.name} ${c.city} ${c.country} ${c.sports.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clubs, region, search]);

  const totalMembers = clubs.reduce((a, c) => a + c.members, 0);
  const totalCountries = new Set(clubs.map(c => c.country)).size;

  return (
    <div className="view-enter" data-screen-label="Clubs">
      {/* Hero */}
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className="eyebrow eyebrow-on-dark">
          ● {clubs.length} clubs · {totalCountries} countries
        </span>
        <h1>Find your <span className="hl">family</span></h1>
        <p className="lede on-dark">
          IGLA+ is a global network of LGBTQIA+ aquatics clubs. Find yours,
          visit one when you travel, or start a new one in your city.
        </p>
      </section>

      <div className="stat-strip">
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{clubs.length}</div>
          <div className="stat-tile-key">Member clubs</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{totalMembers.toLocaleString()}</div>
          <div className="stat-tile-key">Athletes worldwide</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{totalCountries}</div>
          <div className="stat-tile-key">Countries</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val tab-nums">6</div>
          <div className="stat-tile-key">Aquatic sports</div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2 className="display display-3">All clubs</h2>
          <div className="sub">Filter by region or search by name, city, or sport.</div>
        </div>
      </div>

      {/* Region pill tabs */}
      <div className="filter-row" style={{ gap: 8 }}>
        {regions.map(r => (
          <button
            key={r.name}
            className={`pill ${region === r.name ? 'active' : ''}`}
            onClick={() => setRegion(r.name)}
          >
            {r.name === 'All' && <Globe size={12} />}
            {r.name}
            <span className="count">{r.count}</span>
          </button>
        ))}
        <div className="search" style={{ flex: '0 1 280px', marginLeft: 'auto' }}>
          <Search size={15} />
          <input
            placeholder="Search clubs, cities, sports…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
      </div>

      <div style={{ color: 'var(--ink-3)', fontSize: 12, margin: '0 0 12px' }}>
        Showing <span className="tab-nums">{filtered.length}</span> of <span className="tab-nums">{clubs.length}</span> clubs
      </div>

      <div className="clubs-grid">
        {filtered.map(c => (
          <button
            key={c.id}
            className="club-card"
            onClick={() => onSelectClub(c.id)}
            style={{ "--club-color": c.color }}
          >
            <div className="strip" />
            <div className="body">
              <div className="club-head">
                <div>
                  <h3 className="club-name">{c.name}</h3>
                  <div className="club-locale">
                    <MapPin size={12} /> {c.city}, {c.country}
                  </div>
                </div>
                <span className="club-flag">{c.flag}</span>
              </div>

              <div className="club-tagline">"{c.tagline}"</div>

              <div className="club-sports">
                {c.sports.slice(0, 4).map(s => (
                  <span key={s} className={`sport-pill ${s === 'Pink Flamingo' ? 'flamingo' : ''}`}>
                    {s === 'Swimming' && <Waves size={10} />}
                    {s === 'Water Polo' && <Target size={10} />}
                    {s}
                  </span>
                ))}
              </div>

              <div className="club-foot">
                <div>
                  <div className="members tab-nums">{c.members}</div>
                  <div className="members-label">Members · est. {c.founded}</div>
                </div>
                <span className="medal-pill">
                  <Trophy size={10} /> {c.medals.gold} G
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty" style={{ marginTop: 16 }}>
          <Search size={28} style={{ color: 'var(--ink-3)' }} />
          <h3>No clubs match</h3>
          <p>Try a different region or search term.</p>
        </div>
      )}
    </div>
  );
}

window.ClubsView = ClubsView;
