// IGLA+ Records — root App with full routing for G system.

const { useState: useAppState, useEffect: useAppEffect } = React;

const NAV = [
  { id: 'clubs', label: 'Clubs' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'results', label: 'Results' },
  { id: 'about', label: 'About' },
];

function App() {
  // view = { kind, id? }
  const [view, setView] = useAppState({ kind: 'results' });

  const navigate = (kind, id) => {
    setView(id ? { kind, id } : { kind });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAthlete = (id) => id && navigate('athlete', id);
  const openClub = (id) => id && navigate('club', id);
  const openTournament = (id) => id && navigate('tournament', id);

  // Determine active top-nav tab
  const activeNav =
    view.kind === 'athlete' ? 'results' :
    view.kind === 'club' ? 'clubs' :
    view.kind === 'tournament' ? 'tournaments' :
    view.kind;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); navigate('results'); }}>
            <span className="brand-mark"><Waves size={16} /></span>
            <span className="brand-text">IGLA<span className="plus">+</span> Records</span>
          </a>
          <nav>
            {NAV.map(n => (
              <a
                key={n.id}
                href="#"
                className={activeNav === n.id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); navigate(n.id); }}
              >{n.label}</a>
            ))}
          </nav>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="Search"><Search size={15} /></button>
            <button className="icon-btn" aria-label="Notifications"><Bell size={15} /></button>
            <div className="avatar">JR</div>
          </div>
        </div>
      </header>

      <main className="page">
        {view.kind === 'results' && (
          <ResultsView onSelectAthlete={openAthlete} />
        )}
        {view.kind === 'clubs' && (
          <ClubsView onSelectClub={openClub} />
        )}
        {view.kind === 'club' && (
          <ClubDetail
            clubId={view.id}
            onBack={() => navigate('clubs')}
            onSelectTournament={openTournament}
          />
        )}
        {view.kind === 'tournaments' && (
          <TournamentsView onSelectTournament={openTournament} />
        )}
        {view.kind === 'tournament' && (
          <TournamentDetail
            tournamentId={view.id}
            onBack={() => navigate('tournaments')}
            onSelectAthlete={openAthlete}
          />
        )}
        {view.kind === 'athlete' && (
          <AthleteProfile
            athleteId={view.id}
            onBack={() => navigate('results')}
            onSelectAthlete={openAthlete}
          />
        )}
        {view.kind === 'about' && (
          <AboutStub />
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© 2026 IGLA+ · International Group of LGBTQIA+ Aquatics · Est. 1987</span>
          <span>Prototype · Data shown is illustrative</span>
        </div>
      </footer>
    </div>
  );
}

function AboutStub() {
  return (
    <div className="view-enter" data-screen-label="About">
      <section className="tile tile-lg hero tile-depth-aqua">
        <span className="eyebrow eyebrow-on-dark">● Since 1987</span>
        <h1>Dive in <span className="hl">with pride</span>.</h1>
        <p className="lede on-dark">
          IGLA+ is the world's foremost international organization devoted to swimming,
          water polo, diving, and artistic swimming amongst the LGBTQIA+ community and its allies.
        </p>
      </section>
      <div className="empty" style={{ marginTop: 32 }}>
        <Sparkles size={28} style={{ color: 'var(--coral)' }} />
        <h3>Coming soon</h3>
        <p>This page is a placeholder while we build out the records and tournament views.</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
