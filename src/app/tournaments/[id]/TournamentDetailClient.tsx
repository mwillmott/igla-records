'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Globe, ChevronDown, Trophy, Waves, Search, Sparkles, X, Users, Target, Edit3 } from 'lucide-react';
import EditResultModal from '../../components/EditResultModal';
import { UserSession } from '@/lib/auth';

interface Tournament {
  id: string;
  name: string;
  co_name: string;
  city: string;
  country: string;
  flag: string;
  year: number;
  dates: string;
  status: 'live' | 'upcoming' | 'past';
  color: string;
  venue: string;
  description: string;
  participants: number | null;
  nations: number | null;
  clubs: number | null;
  records: number | null;
}

interface SwimResult {
  id: string;
  event: string;
  course: 'LCM' | 'SCM';
  age: string;
  gender: string;
  time: string;
  place: number;
  record: number;
  held: number;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  athleteId: string | null;
  athlete: string;
  club: string;
  clubId: string;
  year: number;
  brokenBy: string | null;
  brokenById: string | null;
}

interface WPPlayer {
  athleteId: string;
  name: string;
  role: string;
  cap: number;
  captain: number;
}

interface WPTeam {
  place: number;
  teamId: string;
  team: string;
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  roster: WPPlayer[];
}

interface WPDivision {
  id: string;
  name: string;
  subtitle: string;
  standings: WPTeam[];
}

interface TournamentDetailClientProps {
  tournament: Tournament;
  hasData: boolean;
  swimmingResults: SwimResult[];
  waterPoloDivisions: WPDivision[];
  athletes: { id: string; name: string }[];
  session: UserSession | null;
  initialSport?: 'swimming' | 'wp';
}

export default function TournamentDetailClient({
  tournament,
  hasData,
  swimmingResults,
  waterPoloDivisions,
  athletes,
  session,
  initialSport = 'swimming',
}: TournamentDetailClientProps) {
  const [sport, setSport] = useState<'swimming' | 'wp'>(initialSport);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  // Synchronize sport tab if changed from navigation
  useEffect(() => {
    if (initialSport) {
      setSport(initialSport);
    }
  }, [initialSport]);

  // Swimming Subcomponent State
  const [swimSearch, setSwimSearch] = useState('');
  const [swimEvent, setSwimEvent] = useState('all');
  const [swimAge, setSwimAge] = useState('all');
  const [swimGender, setSwimGender] = useState('all');
  const [swimRecordsOnly, setSwimRecordsOnly] = useState(false);

  // Water Polo Subcomponent State (Accordion expanded teams)
  const [wpExpanded, setWpExpanded] = useState<Set<string>>(new Set(['wh2o-wp']));

  const toggleWpExpanded = (teamId: string) => {
    setWpExpanded(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Compute unique filter selections
  const ageOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(swimmingResults.map(d => d.age)))].sort();
  }, [swimmingResults]);

  const eventOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(swimmingResults.map(d => d.event)))].sort();
  }, [swimmingResults]);

  // Apply filters
  const filteredSwim = useMemo(() => {
    const q = swimSearch.trim().toLowerCase();
    return swimmingResults.filter(r => {
      if (swimEvent !== 'all' && r.event !== swimEvent) return false;
      if (swimAge !== 'all' && r.age !== swimAge) return false;
      if (swimGender !== 'all' && r.gender !== swimGender) return false;
      if (swimRecordsOnly && !r.record) return false;
      if (q) {
        const hay = `${r.event} ${r.athlete} ${r.club} ${r.age} ${r.gender}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [swimmingResults, swimSearch, swimEvent, swimAge, swimGender, swimRecordsOnly]);

  const recordCount = useMemo(() => filteredSwim.filter(r => r.record).length, [filteredSwim]);

  // Sport sliding toggle animation
  const swimmingRef = useRef<HTMLButtonElement>(null);
  const wpRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 });

  useEffect(() => {
    if (!hasData) return;
    const el = sport === 'swimming' ? swimmingRef.current : wpRef.current;
    if (el) {
      setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [sport, hasData]);

  return (
    <div className="view-enter" data-screen-label={tournament.name}>
      {/* Breadcrumbs Navigation */}
      <div className="breadcrumb select-none mb-4">
        <Link href="/tournaments">Tournaments</Link>
        <span className="sep mx-2 text-ink-3">/</span>
        <span className="text-ink-2 font-medium">{tournament.name}</span>
      </div>

      {/* Hero Header Card */}
      <section className="tile tile-lg hero tile-depth-aqua mb-6">
        <span className="eyebrow eyebrow-on-dark mb-4 select-none">
          {tournament.status === 'live' && <>● Live · </>}
          {tournament.dates}
        </span>
        <h1 className="display display-1 font-normal tracking-tight text-white mb-4">
          <em>{tournament.city} </em>
          <span className="hl">{tournament.year}</span>
        </h1>
        <p className="lede on-dark max-w-[540px] text-white/90 mb-4">{tournament.description}</p>
        
        <div className="hero-meta flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-white/90">
          <span className="hero-meta-item flex items-center gap-1.5">
            <Calendar size={14} /> <span>{tournament.dates}</span>
          </span>
          <span className="hero-meta-item flex items-center gap-1.5">
            <MapPin size={14} /> <span>{tournament.venue}</span>
          </span>
          <span className="hero-meta-item flex items-center gap-1.5">
            <Globe size={14} /> <span>{tournament.country} {tournament.flag}</span>
          </span>
        </div>
      </section>

      {/* KPI Stats Strip */}
      {tournament.participants !== null && (
        <div className="stat-strip mb-8">
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">{tournament.participants.toLocaleString()}</div>
            <div className="stat-tile-key text-ink-3">Participants</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">{tournament.nations}</div>
            <div className="stat-tile-key text-ink-3">Nations</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">{tournament.clubs}</div>
            <div className="stat-tile-key text-ink-3">Clubs</div>
          </div>
          <div className="stat-tile coral">
            <div className="stat-tile-val font-mono text-white tabular-nums">{tournament.records}</div>
            <div className="stat-tile-key text-white/90">New records set</div>
          </div>
        </div>
      )}

      {/* If tournament does not have results data (stub archives) */}
      {!hasData ? (
        <div className="empty flex flex-col items-center justify-center p-16 text-center bg-white/40 border-2 border-dashed border-ink/20 rounded-2xl mt-8">
          <Trophy size={28} className="text-ink-3 mb-3" />
          <h3 className="font-bold text-ink text-base">Results archive</h3>
          <p className="text-xs text-ink-3 mt-1.5 max-w-sm leading-relaxed">
            Full results for {tournament.name} will live here once digitised. Take a look at 
            <Link href="/tournaments/valencia-2026" className="text-coral font-bold hover:underline mx-1">Valencia 2026</Link> 
            for the live shape of this page.
          </p>
        </div>
      ) : (
        <>
          {/* Subtitle & Segment Toggle Controls */}
          <div className="section-head mb-6">
            <div>
              <h2 className="display display-3 font-normal text-ink">
                {sport === 'swimming' ? 'Swimming results' : 'Water polo standings'}
              </h2>
              <div className="sub text-xs text-ink-3 mt-1.5 leading-relaxed">
                {sport === 'swimming'
                  ? 'Highlighted rows are new all-time IGLA+ records set this week.'
                  : 'Final standings across all three divisions · click a team card to view its roster.'}
              </div>
            </div>
            
            <div className="sport-toggle select-none">
              <span 
                className="pill-bg absolute top-1 bottom-1 bg-ink rounded-full transition-all duration-280 cubic-bezier(.65,.05,.36,1)" 
                style={{ left: pillStyle.left, width: pillStyle.width }} 
              />
              <button 
                ref={swimmingRef} 
                className={`cursor-pointer ${sport === 'swimming' ? 'active text-white' : 'text-ink'}`} 
                onClick={() => setSport('swimming')}
              >
                <Waves size={14} /> Swimming
              </button>
              <button 
                ref={wpRef} 
                className={`cursor-pointer ${sport === 'wp' ? 'active text-white' : 'text-ink'}`} 
                onClick={() => setSport('wp')}
              >
                <Target size={14} /> Water polo
              </button>
            </div>
          </div>

          {/* SWIMMING RESULTS VIEW */}
          {sport === 'swimming' && (
            <div>
              {/* Filter Tray */}
              <div className="filter-row gap-3 mb-6">
                <div className="search flex-1 min-w-[220px]">
                  <Search size={15} className="text-ink-2" />
                  <input
                    placeholder="Search event, athlete, or club…"
                    value={swimSearch}
                    onChange={e => setSwimSearch(e.target.value)}
                    className="w-full text-xs text-ink placeholder-ink-3 focus:outline-none"
                  />
                  {swimSearch && (
                    <button className="search-clear cursor-pointer" onClick={() => setSwimSearch('')} aria-label="Clear">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <SimpleSelect value={swimEvent} onChange={setSwimEvent} options={[
                  { v: 'all', label: 'All events' },
                  ...eventOptions.filter(v => v !== 'all').map(v => ({ v, label: v }))
                ]} />
                <SimpleSelect value={swimAge} onChange={setSwimAge} options={[
                  { v: 'all', label: 'All ages' },
                  ...ageOptions.filter(v => v !== 'all').map(v => ({ v, label: `Age ${v}` }))
                ]} />
                <SimpleSelect value={swimGender} onChange={setSwimGender} options={[
                  { v: 'all', label: 'All genders' },
                  { v: 'Men', label: 'Men' },
                  { v: 'Women', label: 'Women' },
                  { v: 'Mixed', label: 'Mixed' }
                ]} />

                <button
                  className={`pill h-10 px-3.5 flex items-center gap-1.5 cursor-pointer rounded-full font-semibold border-2 transition-all ${
                    swimRecordsOnly ? 'coral border-ink bg-coral text-white' : 'border-ink bg-white hover:bg-aqua-pale text-ink'
                  }`}
                  onClick={() => setSwimRecordsOnly(v => !v)}
                >
                  <Sparkles size={12} /> Records only
                </button>
                
                <div className="results-meta text-xs text-ink-3 tabular-nums ml-auto select-none">
                  <span className="font-semibold">{filteredSwim.length}</span> results
                  {recordCount > 0 && (
                    <> · <span className="font-semibold text-coral">{recordCount}</span> new ★</>
                  )}
                </div>
              </div>

              {/* Swim Records Feed */}
              {filteredSwim.length === 0 ? (
                <div className="empty flex flex-col items-center justify-center p-12 text-center bg-white/40 border-2 border-dashed border-ink/20 rounded-2xl">
                  <Search size={28} className="text-ink-3 mb-3" />
                  <h3 className="font-bold text-ink text-base">No results</h3>
                  <p className="text-xs text-ink-3 mt-1">Try adjusting the filters or search term.</p>
                </div>
              ) : (
                <div className="record-list">
                  {filteredSwim.map((r) => {
                    const isAdminUser = session?.role === 'admin';
                    return (
                      <div
                        key={r.id}
                        className={`record-row block no-underline select-none transition-all ${r.record ? 'coral' : ''}`}
                        style={isAdminUser 
                          ? { gridTemplateColumns: '32px minmax(170px, 1.3fr) minmax(140px, 1fr) minmax(160px, 1.3fr) auto auto auto', cursor: 'default' } 
                          : { gridTemplateColumns: '32px minmax(170px, 1.3fr) minmax(140px, 1fr) minmax(160px, 1.3fr) auto auto', cursor: 'default' }}
                      >
                        <span className={`place-badge flex items-center justify-center select-none ${
                          r.place === 1 ? 'place-1' : r.place === 2 ? 'place-2' : r.place === 3 ? 'place-3' : 'place-other'
                        }`}>
                          {r.place}
                        </span>
                        
                        <div>
                          <div className="r-event text-sm font-bold text-ink">{r.event}</div>
                          <div className="r-cat text-[11px] text-ink-3 mt-0.5">{r.age} · {r.gender}</div>
                          <span className="r-course text-[10px] uppercase font-mono tracking-wider mt-1 px-1.5 py-0.5 bg-bg-2 border border-ink/10 rounded">{r.course}</span>
                        </div>
                        
                        <div className="r-who">
                          {r.athleteId ? (
                            <Link href={`/athletes/${r.athleteId}`} className="athlete font-semibold text-ink hover:text-coral transition-colors">
                              {r.athlete}
                            </Link>
                          ) : (
                            <span className="athlete font-semibold text-ink cursor-default">{r.athlete}</span>
                          )}
                          <div className="text-[11px] text-ink-3 mt-0.5">{r.club}</div>
                        </div>
                        
                        <div className="text-xs text-ink-3 select-none flex items-center">
                          {r.record === 1 && (
                            <span className="status-pill live flex items-center bg-coral text-white font-bold py-0.5 px-2 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                              ★ New record
                            </span>
                          )}
                        </div>
                        
                        <div className="r-time font-mono font-semibold text-sm tabular-nums text-ink mr-2">{r.time}</div>
                        <span style={{ width: 8 }}></span>
                        {isAdminUser && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingRecord(r);
                            }}
                            className="icon-btn shrink-0 border border-ink/20 hover:bg-coral-pale text-ink transition-all hover:border-coral cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg"
                            title="Edit Swim Record"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WATER POLO STANDINGS VIEW */}
          {sport === 'wp' && (
            <div>
              {waterPoloDivisions.map((div) => (
                <section key={div.id} className="mb-8">
                  {/* Division Header */}
                  <div className="division-row flex items-center justify-between border-b-2 border-ink pb-2 mb-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="division-letter font-display text-3xl font-normal text-coral">{div.id}</span>
                      <div>
                        <div className="division-name font-bold text-sm text-ink">{div.name}</div>
                        <div className="division-sub text-[11px] text-ink-3 mt-0.5">{div.subtitle} · {div.standings.length} teams</div>
                      </div>
                    </div>
                    <span className="section-label text-[10px] font-bold tracking-wider text-ink-3 uppercase">Final Standings</span>
                  </div>

                  {/* Team Cards Accordion Stack */}
                  <div className="team-stack flex flex-col gap-2">
                    {div.standings.map((t) => {
                      const isOpen = wpExpanded.has(t.teamId);
                      const diff = t.goalsFor - t.goalsAgainst;
                      return (
                        <article 
                          key={t.teamId} 
                          className={`team-card border-2 border-ink rounded-2xl shadow-[2px_3px_0_#0d3a52] overflow-hidden transition-all bg-white ${
                            isOpen ? 'expanded shadow-[4px_5px_0_#0d3a52]' : ''
                          } ${t.place === 1 ? 'champion bg-gradient-to-r from-coral-pale/50 to-white' : ''}`}
                        >
                          <button 
                            className="team-header w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                            onClick={() => toggleWpExpanded(t.teamId)}
                          >
                            <div className="team-place font-mono font-bold text-base text-ink pr-2 tabular-nums">
                              {String(t.place).padStart(2, '0')}
                            </div>
                            
                            <div className="flex-1">
                              <div className="team-name font-bold text-sm text-ink flex items-center gap-2">
                                <span>{t.team}</span>
                                {t.place === 1 && (
                                  <span className="inline-flex items-center gap-1 bg-coral border border-ink text-white font-bold rounded-full py-0.5 px-2 text-[9px] uppercase tracking-wider select-none">
                                    <Trophy size={10} /> Champion
                                  </span>
                                )}
                              </div>
                              <div className="team-meta text-[11px] text-ink-3 mt-1 flex items-center gap-3 select-none">
                                <span className="flex items-center gap-1"><Users size={11} /> {t.roster.length} players</span>
                                <span className="text-coral/95 font-semibold">{isOpen ? 'Hide' : 'View'} roster</span>
                              </div>
                            </div>
                            
                            <div className="team-stat hide-mobile pr-4 select-none">
                              <div className="v font-mono text-xs font-semibold tabular-nums text-ink">{t.wins}–{t.losses}</div>
                              <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Record</div>
                            </div>
                            <div className="team-stat hide-mobile pr-4 select-none">
                              <div className="v font-mono text-xs font-semibold tabular-nums text-ink">{t.goalsFor}</div>
                              <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">For</div>
                            </div>
                            <div className="team-stat hide-mobile pr-4 select-none">
                              <div className="v font-mono text-xs font-semibold tabular-nums text-ink">{t.goalsAgainst}</div>
                              <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Against</div>
                            </div>
                            <div className="team-stat hide-mobile pr-4 select-none">
                              <div className={`v font-mono text-xs font-bold tabular-nums ${diff > 0 ? 'text-coral-deep' : 'text-ink-2'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                              </div>
                              <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Diff</div>
                            </div>
                            
                            <div className="flex items-center gap-3.5 select-none text-right">
                              <div>
                                <div className="team-points font-mono font-bold text-sm text-ink">{t.points}</div>
                                <div className="k text-[9px] uppercase tracking-wider text-ink-3 font-bold mt-0.5">Pts</div>
                              </div>
                              <span className={`chev transition-transform duration-280 ${isOpen ? 'rotate-180 text-coral' : 'text-ink-3'}`}>
                                <ChevronDown size={18} />
                              </span>
                            </div>
                          </button>

                          {/* Collapsible Roster Grid */}
                          <div className={`roster transition-all duration-320 ${isOpen ? 'block border-t-2 border-ink bg-bg/25' : 'hidden'}`}>
                            <div className="roster-inner">
                              <div className="px-6 pt-3.5 pb-2 text-[10px] uppercase font-bold tracking-wider text-ink-3 select-none">
                                Roster
                              </div>
                              <div className="roster-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-6 pb-5">
                                {t.roster.map((p, i) => (
                                  <Link
                                    key={i}
                                    href={`/athletes/${p.athleteId}`}
                                    className={`roster-item flex items-center gap-3 p-2 bg-white border border-ink/10 rounded-xl hover:border-coral group transition-all text-left ${
                                      p.captain ? 'captain border-ink bg-aqua-sky/10' : ''
                                    }`}
                                  >
                                    <div className={`cap-badge w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 border-ink ${
                                      p.captain ? 'bg-ink text-white' : 'bg-white text-ink group-hover:bg-coral group-hover:text-white transition-colors'
                                    }`}>
                                      {p.cap}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="roster-name font-bold text-xs text-ink truncate group-hover:text-coral transition-colors flex items-center gap-1.5">
                                        <span>{p.name}</span>
                                        {p.captain === 1 && (
                                          <span className="captain-c bg-ink border border-ink text-white font-bold rounded-sm px-1 text-[8px] uppercase select-none">C</span>
                                        )}
                                      </div>
                                      <div className="roster-role text-[10px] text-ink-3 truncate mt-0.5">{p.role}</div>
                                    </div>
                                  </Link>
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
          )}
        </>
      )}

      {/* REUSABLE SWIMMING RECORD EDIT MODAL */}
      <EditResultModal
        isOpen={editingRecord !== null}
        onClose={() => setEditingRecord(null)}
        recordData={editingRecord}
        athletes={athletes}
        session={session}
        onSaveSuccess={() => {
          setEditingRecord(null);
          window.location.reload();
        }}
      />
    </div>
  );
}

// Custom Pill-styled dropdown select component
interface SimpleSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string }[];
}

function SimpleSelect({ value, onChange, options }: SimpleSelectProps) {
  return (
    <div className="relative select-none">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border-2 border-ink rounded-full px-3.5 pr-8 h-10 font-semibold text-xs text-ink cursor-pointer hover:bg-aqua-pale transition-all focus:outline-none"
      >
        {options.map(o => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-2"
      />
    </div>
  );
}
