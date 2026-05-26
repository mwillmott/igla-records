// Results — all-time records hub. Filterable across event/age/gender/course/tournament,
// with toggle between swimming records and water polo titles.

const { useState: useResultsState, useMemo: useResultsMemo, useRef: useResultsRef, useEffect: useResultsEffect } = React;

function ResultsView({ onSelectAthlete }) {
  const recs = window.IGLA_RECORDS.swimming;
  const wpRecs = window.IGLA_RECORDS.waterPolo;

  const [sport, setSport] = useResultsState('swimming');
  const [search, setSearch] = useResultsState('');
  const [age, setAge] = useResultsState('all');
  const [gender, setGender] = useResultsState('all');
  const [course, setCourse] = useResultsState('all');
  const [heldOnly, setHeldOnly] = useResultsState(true);

  const ageOptions = useResultsMemo(() => ['all', ...new Set(recs.map(r => r.age))].sort(), [recs]);

  const filteredSwim = useResultsMemo(() => {
    const q = search.trim().toLowerCase();
    return recs.filter(r => {
      if (age !== 'all' && r.age !== age) return false;
      if (gender !== 'all' && r.gender !== gender) return false;
      if (course !== 'all' && r.course !== course) return false;
      if (heldOnly && !r.held) return false;
      if (q) {
        const hay = `${r.event} ${r.athlete} ${r.club} ${r.age} ${r.gender}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [recs, age, gender, course, heldOnly, search]);

  // Sport toggle pill animation
  const toggleRefs = { swimming: useResultsRef(null), wp: useResultsRef(null) };
  const [pillStyle, setPillStyle] = useResultsState({ left: 4, width: 0 });
  useResultsEffect(() => {
    const el = sport === 'swimming' ? toggleRefs.swimming.current : toggleRefs.wp.current;
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [sport]);

  const heldCount = recs.filter(r => r.held).length;
  const valenciaCount = recs.filter(r => r.held && r.year === 2026).length;
  const tournamentsSpanned = new Set(recs.filter(r => r.held).map(r => r.tournament)).size;

  return (
    <div className="view-enter" data-screen-label="Results">
      {/* Hero */}
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className="eyebrow eyebrow-on-dark">
          ● All-time records · since 1987
        </span>
        <h1>Every <span className="hl">record</span>,<br/>ever.</h1>
        <p className="lede on-dark">
          The full archive of every all-time IGLA+ record across swimming and water polo.
          Filter by event, age, gender, or course — then drill into the athlete who set it.
        </p>
      </section>

      {/* KPI tiles */}
      <div className="stat-strip">
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{heldCount}</div>
          <div className="stat-tile-key">Records currently held</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val tab-nums">{valenciaCount}</div>
          <div className="stat-tile-key">Set at Valencia 2026</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{tournamentsSpanned}</div>
          <div className="stat-tile-key">Tournaments spanned</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val tab-nums">{wpRecs.filter(w => w.held).length}</div>
          <div className="stat-tile-key">Reigning WP champions</div>
        </div>
      </div>

      {/* Sport toggle + section head */}
      <div className="section-head">
        <div>
          <h2 className="display display-3">
            {sport === 'swimming' ? 'Swimming records' : 'Water polo titles'}
          </h2>
          <div className="sub">
            {sport === 'swimming'
              ? 'Best-ever IGLA+ time for each event × age × gender. Coral ★ = the record still stands.'
              : 'Most recent champion in each division by championship year.'}
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

      {sport === 'swimming' && (
        <>
          {/* Filter row */}
          <div className="filter-row">
            <div className="search">
              <Search size={15} />
              <input
                placeholder="Search event, athlete, or club…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">
                  <X size={14} />
                </button>
              )}
            </div>

            <SimpleSelect value={course} onChange={setCourse} options={[
              { v: 'all', label: 'All courses' },
              { v: 'LCM', label: 'Long course (LCM)' },
              { v: 'SCM', label: 'Short course (SCM)' },
            ]} />
            <SimpleSelect value={age} onChange={setAge} options={[
              { v: 'all', label: 'All ages' },
              ...ageOptions.filter(a => a !== 'all').map(a => ({ v: a, label: `Age ${a}` }))
            ]} />
            <SimpleSelect value={gender} onChange={setGender} options={[
              { v: 'all', label: 'All genders' },
              { v: 'Men', label: 'Men' },
              { v: 'Women', label: 'Women' },
              { v: 'Mixed', label: 'Mixed' },
            ]} />
            <button
              className={`pill ${heldOnly ? 'coral' : ''}`}
              onClick={() => setHeldOnly(v => !v)}
              style={{ height: 40, padding: '0 14px' }}
            >
              <Sparkles size={12} /> Currently held
            </button>

            <div className="results-meta">
              <span className="tab-nums">{filteredSwim.length}</span> records
            </div>
          </div>

          {/* Records list */}
          {filteredSwim.length === 0 ? (
            <div className="empty">
              <Search size={28} style={{ color: 'var(--ink-3)' }} />
              <h3>No records match</h3>
              <p>Adjust the filters or clear them to see everything.</p>
            </div>
          ) : (
            <div className="record-list">
              {filteredSwim.map(r => (
                <button
                  key={r.id}
                  className={`record-row ${r.held ? 'coral' : ''}`}
                  onClick={() => r.athleteId && onSelectAthlete(r.athleteId)}
                >
                  <span className={`record-star ${r.held ? 'held' : ''}`}>
                    {r.held ? <Sparkles size={11} /> : '·'}
                  </span>
                  <div>
                    <div className="r-event">{r.event}</div>
                    <div className="r-cat">{r.age} · {r.gender}</div>
                    <span className="r-course">{r.course}</span>
                  </div>
                  <div className="r-who">
                    <span className="athlete">{r.athlete}</span>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.club}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                    <span style={{ fontSize: 14, marginRight: 6 }}>{r.flag}</span>
                    {r.tournament}
                  </div>
                  <div className="r-time">{r.time}</div>
                  <span className="r-year">'{String(r.year).slice(2)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {sport === 'wp' && (
        <div className="record-list">
          {wpRecs.map(w => (
            <button
              key={w.id}
              className={`record-row ${w.held ? 'coral' : ''}`}
              style={{ gridTemplateColumns: '32px 60px 1fr 1fr auto auto', cursor: 'default' }}
            >
              <span className={`record-star ${w.held ? 'held' : ''}`}>
                {w.held ? <Trophy size={11} /> : '·'}
              </span>
              <span className="display display-3" style={{ color: 'var(--coral)' }}>{w.division}</span>
              <div>
                <div className="r-event">{w.champion}</div>
                <div className="r-cat">Division {w.division} champion</div>
              </div>
              <div className="r-who" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                <span style={{ fontSize: 14, marginRight: 6 }}>{w.flag}</span>
                {w.tournament} · final: <span className="tab-nums">{w.score}</span>
              </div>
              <div className="r-time" style={{ fontSize: 13 }}>{w.year}</div>
              <span className="r-year">'{String(w.year).slice(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Pill-styled select
function SimpleSelect({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          background: 'var(--paper)',
          border: '2px solid var(--ink)',
          borderRadius: 999,
          padding: '0 32px 0 14px',
          height: 40,
          font: 'inherit',
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--ink)',
          cursor: 'pointer',
        }}
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} style={{
        position: 'absolute', right: 11, top: '50%',
        transform: 'translateY(-50%)', pointerEvents: 'none',
        color: 'var(--ink-2)'
      }} />
    </div>
  );
}

window.ResultsView = ResultsView;
window.SimpleSelect = SimpleSelect;
