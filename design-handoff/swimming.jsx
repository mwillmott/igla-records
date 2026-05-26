// Swimming view — per-tournament results in G's tile-row style.
// Used inside Tournament Detail page.

const { useState: useSwimState, useMemo: useSwimMemo } = React;

function SwimmingView({ data, onSelectAthlete }) {
  const swim = data || window.IGLA_DATA.swimming;

  const [search, setSearch] = useSwimState('');
  const [event, setEvent] = useSwimState('all');
  const [age, setAge] = useSwimState('all');
  const [gender, setGender] = useSwimState('all');
  const [recordsOnly, setRecordsOnly] = useSwimState(false);

  const ageOptions = useSwimMemo(() => ['all', ...new Set(swim.map(d => d.age))].sort(), [swim]);
  const eventOptions = useSwimMemo(() => ['all', ...new Set(swim.map(d => d.event))], [swim]);

  const filtered = useSwimMemo(() => {
    const q = search.trim().toLowerCase();
    return swim.filter(r => {
      if (event !== 'all' && r.event !== event) return false;
      if (age !== 'all' && r.age !== age) return false;
      if (gender !== 'all' && r.gender !== gender) return false;
      if (recordsOnly && !r.record) return false;
      if (q) {
        const hay = `${r.event} ${r.athlete} ${r.club} ${r.age} ${r.gender}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [swim, search, event, age, gender, recordsOnly]);

  const recordCount = filtered.filter(r => r.record).length;

  return (
    <div>
      <div className="filter-row">
        <div className="search">
          <Search size={15} />
          <input
            placeholder="Search event, athlete, or club…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
        <SimpleSelect value={event} onChange={setEvent}
          options={[{ v: 'all', label: 'All events' }, ...eventOptions.filter(v => v !== 'all').map(v => ({ v, label: v }))]} />
        <SimpleSelect value={age} onChange={setAge}
          options={[{ v: 'all', label: 'All ages' }, ...ageOptions.filter(v => v !== 'all').map(v => ({ v, label: `Age ${v}` }))]} />
        <SimpleSelect value={gender} onChange={setGender}
          options={[
            { v: 'all', label: 'All genders' },
            { v: 'Men', label: 'Men' }, { v: 'Women', label: 'Women' }, { v: 'Mixed', label: 'Mixed' }
          ]} />
        <button
          className={`pill ${recordsOnly ? 'coral' : ''}`}
          onClick={() => setRecordsOnly(v => !v)}
          style={{ height: 40, padding: '0 14px' }}
        >
          <Sparkles size={12} /> Records only
        </button>
        <div className="results-meta">
          <span className="tab-nums">{filtered.length}</span> results
          {recordCount > 0 && <> · <span className="tab-nums">{recordCount}</span> new ★</>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <Search size={28} style={{ color: 'var(--ink-3)' }} />
          <h3>No results</h3>
          <p>Try adjusting the filters or search term.</p>
        </div>
      ) : (
        <div className="record-list">
          {filtered.map(r => (
            <div
              key={r.id}
              className={`record-row ${r.record ? 'coral' : ''}`}
              style={{ gridTemplateColumns: '32px minmax(170px, 1.3fr) minmax(140px, 1fr) minmax(160px, 1.3fr) auto auto', cursor: 'default' }}
            >
              <span className={`place-badge place-${r.place > 3 ? 'other' : r.place}`}>{r.place}</span>
              <div>
                <div className="r-event">{r.event}</div>
                <div className="r-cat">{r.age} · {r.gender}</div>
                <span className="r-course">{r.course}</span>
              </div>
              <div className="r-who">
                <button className="athlete" onClick={() => onSelectAthlete && onSelectAthlete(r.athleteId)}>
                  {r.athlete}
                </button>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.club}</div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {r.record && <span className="status-pill" style={{ background: 'var(--coral)', color: 'white', fontSize: 9 }}>★ New record</span>}
              </div>
              <div className="r-time">{r.time}</div>
              <span style={{ width: 8 }}></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.SwimmingView = SwimmingView;
