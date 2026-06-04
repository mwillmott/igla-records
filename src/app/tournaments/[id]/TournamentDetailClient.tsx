'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Globe, ChevronDown, Trophy, Waves, Search, Sparkles, X, Users, Target, Edit3, Save, ShieldAlert, Clock, Plus, Info } from 'lucide-react';
import EditResultModal from '../../components/EditResultModal';
import { UserSession } from '@/lib/auth';
import { WATER_POLO_DIVISIONS } from '@/lib/config';

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
  cap: number;
  captain: number;
}

interface WPTeam {
  place: number;
  teamId: string;
  team: string;
  clubId: string | null;
  clubName: string | null;
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
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
  athletes: { id: string; name: string; clubName?: string | null }[];
  clubs: { id: string; name: string }[];
  session: UserSession | null;
  initialSport?: 'swimming' | 'wp';
}

export default function TournamentDetailClient({
  tournament,
  hasData,
  swimmingResults,
  waterPoloDivisions,
  athletes,
  clubs,
  session,
  initialSport = 'swimming',
}: TournamentDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sport, setSport] = useState<'swimming' | 'wp'>(initialSport);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const handleSportChange = (newSport: 'swimming' | 'wp') => {
    setSport(newSport);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sport', newSport);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Water Polo Edit Modal States
  const [editingWpRecord, setEditingWpRecord] = useState<any | null>(null);
  const [editWpFields, setEditWpFields] = useState<any>({});
  const [wpSaving, setWpSaving] = useState(false);
  const [wpEditError, setWpEditError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [wpConfirmDelete, setWpConfirmDelete] = useState(false);
  const [wpDeleting, setWpDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Searchable club dropdown state in Edit Modal
  const [clubSearch, setClubSearch] = useState('');
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const clubDropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize sport tab if changed from navigation
  useEffect(() => {
    if (initialSport) {
      setSport(initialSport);
    }
  }, [initialSport]);

  // Water Polo Roster Edit States
  const [deletingPlayerState, setDeletingPlayerState] = useState<{ teamId: string; athleteId: string; name: string } | null>(null);
  const [addingToTeamId, setAddingToTeamId] = useState<string | null>(null);
  const [rosterActionLoading, setRosterActionLoading] = useState(false);
  const [rosterActionError, setRosterActionError] = useState('');

  // Add Player Modal states
  const [athleteSearch, setAthleteSearch] = useState('');
  const [showAthleteDropdown, setShowAthleteDropdown] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<{ id: string; name: string } | null>(null);
  const [isNewAthlete, setIsNewAthlete] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [capNumber, setCapNumber] = useState<string>('');
  const [newAthleteEmail, setNewAthleteEmail] = useState('');
  const [isCaptain, setIsCaptain] = useState(false);
  const athleteDropdownRef = useRef<HTMLDivElement>(null);

  // Close athlete dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (athleteDropdownRef.current && !athleteDropdownRef.current.contains(event.target as Node)) {
        setShowAthleteDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAthletes = useMemo(() => {
    const q = athleteSearch.trim().toLowerCase();
    if (!q) return athletes.slice(0, 10);
    return athletes.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.clubName && a.clubName.toLowerCase().includes(q))
    );
  }, [athletes, athleteSearch]);

  const targetTeam = useMemo(() => {
    if (!addingToTeamId) return null;
    for (const div of waterPoloDivisions) {
      const found = div.standings.find(t => t.teamId === addingToTeamId);
      if (found) return found;
    }
    return null;
  }, [waterPoloDivisions, addingToTeamId]);

  const handleRemovePlayer = async (teamId: string, athleteId: string) => {
    setRosterActionLoading(true);
    setRosterActionError('');
    try {
      const res = await fetch('/api/admin/roster/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, athleteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRosterActionError(data.error || 'Failed to remove player');
        setRosterActionLoading(false);
        return;
      }
      setDeletingPlayerState(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      setRosterActionError('Failed to remove player due to a network error');
    } finally {
      setRosterActionLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingToTeamId) return;

    if (!isNewAthlete && !selectedAthlete) {
      setRosterActionError('Please select an athlete or create a new one');
      return;
    }
    if (isNewAthlete && !newAthleteName.trim()) {
      setRosterActionError('Please enter a name for the new athlete');
      return;
    }
    if (!capNumber) {
      setRosterActionError('Please enter a cap number');
      return;
    }

    setRosterActionLoading(true);
    setRosterActionError('');
    try {
      const res = await fetch('/api/admin/roster/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: addingToTeamId,
          athleteId: selectedAthlete?.id,
          isNewAthlete,
          newAthleteName: newAthleteName.trim(),
          capNumber: parseInt(capNumber),
          isCaptain,
          email: isNewAthlete && newAthleteEmail.trim() ? newAthleteEmail.trim() : null,
          clubId: isNewAthlete ? targetTeam?.clubId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRosterActionError(data.error || 'Failed to add player');
        setRosterActionLoading(false);
        return;
      }

      setAddingToTeamId(null);
      setAthleteSearch('');
      setSelectedAthlete(null);
      setIsNewAthlete(false);
      setNewAthleteName('');
      setCapNumber('');
      setNewAthleteEmail('');
      setIsCaptain(false);

      router.refresh();
    } catch (err) {
      console.error(err);
      setRosterActionError('Failed to add player due to a network error');
    } finally {
      setRosterActionLoading(false);
    }
  };

  // Close club dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clubDropdownRef.current && !clubDropdownRef.current.contains(event.target as Node)) {
        setShowClubDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clubs in edit modal
  const filteredClubsForSearch = useMemo(() => {
    const q = clubSearch.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(c => c.name.toLowerCase().includes(q));
  }, [clubs, clubSearch]);

  // Initialize form fields when edit modal is opened
  useEffect(() => {
    if (editingWpRecord) {
      setWpEditError('');
      setWpConfirmDelete(false);
      setWpDeleting(false);
      setEditWpFields({
        team_name: editingWpRecord.teamName || '',
        club_id: editingWpRecord.clubId || '',
        division: editingWpRecord.division || '',
        final_placement: editingWpRecord.placement || 1,
        wins: editingWpRecord.wins !== null && editingWpRecord.wins !== undefined ? editingWpRecord.wins : '',
        losses: editingWpRecord.losses !== null && editingWpRecord.losses !== undefined ? editingWpRecord.losses : '',
        goals_for: editingWpRecord.goalsFor !== null && editingWpRecord.goalsFor !== undefined ? editingWpRecord.goalsFor : '',
        goals_against: editingWpRecord.goalsAgainst !== null && editingWpRecord.goalsAgainst !== undefined ? editingWpRecord.goalsAgainst : '',
        points: editingWpRecord.points !== null && editingWpRecord.points !== undefined ? editingWpRecord.points : '',
      });
      setClubSearch(editingWpRecord.clubName || '');
    }
  }, [editingWpRecord, clubs]);

  const handleWpDelete = async () => {
    if (!editingWpRecord) return;

    if (!wpConfirmDelete) {
      setWpConfirmDelete(true);
      return;
    }

    setWpDeleting(true);
    setWpEditError('');

    try {
      const response = await fetch('/api/admin/records/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wp',
          id: editingWpRecord.id,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setWpEditError(resData.error || 'Failed to delete record.');
        setWpDeleting(false);
        setWpConfirmDelete(false);
        return;
      }

      setEditingWpRecord(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setWpEditError('An unexpected network error occurred.');
      setWpDeleting(false);
      setWpConfirmDelete(false);
    }
  };

  const handleSaveWpEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWpRecord) return;

    setWpSaving(true);
    setWpEditError('');

    try {
      const response = await fetch('/api/admin/records/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wp',
          id: editingWpRecord.id,
          fields: editWpFields,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setWpEditError(resData.error || 'Failed to update record.');
        setWpSaving(false);
        return;
      }

      setEditingWpRecord(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setWpEditError('An unexpected network error occurred.');
      setWpSaving(false);
    }
  };

  const updateWpField = (field: string, value: any) => {
    setEditWpFields((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr;
      }
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

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
                onClick={() => handleSportChange('swimming')}
              >
                <Waves size={14} /> Swimming
              </button>
              <button 
                ref={wpRef} 
                className={`cursor-pointer ${sport === 'wp' ? 'active text-white' : 'text-ink'}`} 
                onClick={() => handleSportChange('wp')}
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
                  <div className="division-row border-b-2 border-ink pb-2 mb-4 select-none">
                    <span className="division-letter font-display text-3xl font-normal text-coral">{div.id}</span>
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
                          <div 
                            role="button"
                            tabIndex={0}
                            className="team-header w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none select-none"
                            onClick={() => toggleWpExpanded(t.teamId)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleWpExpanded(t.teamId);
                              }
                            }}
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
                              {session?.role === 'admin' && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditingWpRecord({
                                      id: t.teamId,
                                      teamName: t.team,
                                      clubId: t.clubId,
                                      clubName: t.clubName,
                                      division: div.id,
                                      placement: t.place,
                                      wins: t.wins,
                                      losses: t.losses,
                                      goalsFor: t.goalsFor,
                                      goalsAgainst: t.goalsAgainst,
                                      points: t.points,
                                      createdBy: t.createdBy,
                                      createdAt: t.createdAt,
                                      updatedBy: t.updatedBy,
                                      updatedAt: t.updatedAt,
                                    });
                                  }}
                                  className="icon-btn shrink-0 border border-ink/20 hover:bg-coral-pale text-ink transition-all hover:border-coral cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg ml-1 mr-1"
                                  title="Edit Water Polo Standings"
                                >
                                  <Edit3 size={12} />
                                </button>
                              )}
                              <span className={`chev transition-transform duration-280 ${isOpen ? 'rotate-180 text-coral' : 'text-ink-3'}`}>
                                <ChevronDown size={18} />
                              </span>
                            </div>
                          </div>

                          {/* Collapsible Roster Grid */}
                          <div className={`roster transition-all duration-320 ${isOpen ? 'block border-t-2 border-ink bg-bg/25' : 'hidden'}`}>
                            <div className="roster-inner">
                              <div className="px-6 pt-3.5 pb-2 text-[10px] uppercase font-bold tracking-wider text-ink-3 select-none">
                                Roster
                              </div>
                              <div className="roster-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-6 pb-5">
                                {t.roster.map((p, i) => (
                                  <div key={i} className="relative group select-none">
                                    <Link
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
                                        </div>
                                        {p.captain === 1 && (
                                          <div className="text-[9px] font-bold uppercase tracking-wider text-coral mt-0.5 select-none leading-none">
                                            Team Captain
                                          </div>
                                        )}
                                      </div>
                                    </Link>
                                    {session?.role === 'admin' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setDeletingPlayerState({ teamId: t.teamId, athleteId: p.athleteId, name: p.name });
                                        }}
                                        className="absolute -top-1.5 -right-1.5 bg-white hover:bg-coral-pale border border-ink text-ink hover:text-coral w-5 h-5 rounded-full flex items-center justify-center cursor-pointer shadow-[1px_1px_0_#0d3a52] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                                        title="Remove from roster"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {session?.role === 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => setAddingToTeamId(t.teamId)}
                                    className="roster-item flex items-center gap-3 p-2 bg-white/50 border border-dashed border-ink/20 rounded-xl hover:bg-white hover:border-coral group transition-all text-left w-full cursor-pointer"
                                  >
                                    <div className="cap-badge w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 border-dashed border-ink/20 bg-white text-ink-3 group-hover:bg-coral group-hover:text-white group-hover:border-coral transition-colors">
                                      +
                                    </div>
                                    <div className="min-w-0">
                                      <div className="roster-name font-bold text-xs text-ink-2 group-hover:text-coral transition-colors">
                                        Add Player
                                      </div>
                                    </div>
                                  </button>
                                )}
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

      {/* WATER POLO STANDINGS EDIT MODAL */}
      {mounted && editingWpRecord && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="tile max-w-lg w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  Edit Water Polo Standings
                </h3>
              </div>
              <button 
                onClick={() => setEditingWpRecord(null)}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWpEdit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
              {wpEditError && (
                <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{wpEditError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Team Name</label>
                <input 
                  type="text" 
                  value={editWpFields.team_name || ''} 
                  onChange={e => updateWpField('team_name', e.target.value)}
                  className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                  required
                />
              </div>

              {/* SEARCHABLE CLUB SELECT COMBOBOX */}
              <div className="flex flex-col gap-1.5 relative" ref={clubDropdownRef}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Club</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={clubSearch} 
                    onChange={e => {
                      setClubSearch(e.target.value);
                      setShowClubDropdown(true);
                      updateWpField('club_id', ''); // clear id while searching/typing
                    }}
                    onFocus={() => setShowClubDropdown(true)}
                    className="bg-white border-2 border-ink rounded-xl px-3 pr-10 w-full h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    placeholder="Search club name..."
                    required
                  />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                </div>
                {showClubDropdown && filteredClubsForSearch.length > 0 && (
                  <ul className="absolute left-0 right-0 top-16 bg-white border-2 border-ink rounded-xl shadow-md max-h-48 overflow-y-auto z-50 select-none">
                    {filteredClubsForSearch.map(c => (
                      <li 
                        key={c.id} 
                        onClick={() => {
                          updateWpField('club_id', c.id);
                          setClubSearch(c.name);
                          setShowClubDropdown(false);
                        }}
                        className="px-3.5 py-2 hover:bg-aqua-pale text-xs text-ink font-semibold cursor-pointer border-b border-ink/5 last:border-0"
                      >
                        {c.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* DIVISION DROPDOWN SELECT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Division</label>
                  <div className="relative select-none">
                    <select 
                      value={editWpFields.division || ''} 
                      onChange={e => updateWpField('division', e.target.value)}
                      className="appearance-none bg-white border-2 border-ink rounded-xl px-3 w-full h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    >
                      <option value="" disabled>Select Division</option>
                      {WATER_POLO_DIVISIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Final Placement (Rank)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={editWpFields.final_placement || 1} 
                    onChange={e => updateWpField('final_placement', parseInt(e.target.value) || 1)}
                    className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    required
                  />
                </div>
              </div>

              {/* DETAILED STATS GRID */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Match Standings Statistics (Optional)</label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Wins</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editWpFields.wins ?? ''} 
                      onChange={e => updateWpField('wins', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Losses</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editWpFields.losses ?? ''} 
                      onChange={e => updateWpField('losses', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Goals For</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editWpFields.goals_for ?? ''} 
                      onChange={e => updateWpField('goals_for', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Goals Ag.</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editWpFields.goals_against ?? ''} 
                      onChange={e => updateWpField('goals_against', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Points</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editWpFields.points ?? ''} 
                      onChange={e => updateWpField('points', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                </div>
              </div>

              {/* BEAUTIFUL AUDIT TRAIL LOG */}
              <div className="p-4 bg-aqua-sky/15 border-2 border-dashed border-ink/20 rounded-2xl flex flex-col gap-2.5 mt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-1 leading-none select-none">
                  <Clock size={11} className="text-coral" />
                  <span>Audit History Trail</span>
                </div>
                
                <div className="text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px] text-ink-2">
                    <span>Originally Created By:</span>
                    <span className="font-semibold text-ink">{editingWpRecord.createdBy || 'system@igla.org'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                    <span>Timestamp:</span>
                    <span>{formatDate(editingWpRecord.createdAt)}</span>
                  </div>
                  
                  {editingWpRecord.updatedBy && (
                    <>
                      <div className="h-[1.5px] border-t border-dashed border-ink/20 my-1" />
                      <div className="flex justify-between items-center text-[11px] text-ink-2">
                        <span>Last Updated By:</span>
                        <span className="font-semibold text-coral">{editingWpRecord.updatedBy}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                        <span>Timestamp:</span>
                        <span>{formatDate(editingWpRecord.updatedAt)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-ink/10 select-none">
                {wpConfirmDelete ? (
                  <div className="flex gap-3 w-full justify-between items-center animate-fadeIn">
                    <span className="text-[11px] font-bold text-coral-deep uppercase tracking-wide">Are you absolutely sure? This cannot be undone.</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={wpDeleting}
                        onClick={handleWpDelete}
                        className="pill danger font-bold text-xs py-2.5 px-5 cursor-pointer"
                      >
                        {wpDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        disabled={wpDeleting}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWpConfirmDelete(false);
                        }}
                        className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-between w-full">
                    <button
                      type="button"
                      onClick={handleWpDelete}
                      className="pill bg-white border-2 border-coral-deep text-coral-deep hover:bg-coral-pale font-bold text-xs py-2.5 px-4 rounded-full cursor-pointer"
                    >
                      Delete Result
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingWpRecord(null)}
                        disabled={wpSaving}
                        className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={wpSaving}
                        className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>{wpSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ADD WATER POLO PLAYER MODAL */}
      {mounted && addingToTeamId && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="tile max-w-md w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  Add Roster Player
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setAddingToTeamId(null);
                  setRosterActionError('');
                  setAthleteSearch('');
                  setSelectedAthlete(null);
                  setIsNewAthlete(false);
                  setNewAthleteName('');
                  setCapNumber('');
                  setIsCaptain(false);
                  setNewAthleteEmail('');
                }}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPlayer} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
              {rosterActionError && (
                <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{rosterActionError}</span>
                </div>
              )}

              {/* ATHLETE SEARCH / SELECT */}
              <div className="flex flex-col gap-1.5 relative" ref={athleteDropdownRef}>
                {!isNewAthlete && (
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Search Athlete</label>
                )}
                
                {selectedAthlete ? (
                  <div className="flex items-center justify-between p-3 bg-aqua-sky/10 border-2 border-ink rounded-xl animate-fadeIn">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Selected Athlete</span>
                      <span className="text-xs font-bold text-ink truncate">{selectedAthlete.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedAthlete(null);
                        setAthleteSearch('');
                      }}
                      className="text-[10px] font-bold text-coral-deep hover:underline cursor-pointer ml-2"
                    >
                      Change
                    </button>
                  </div>
                ) : isNewAthlete ? (
                  <div className="flex flex-col gap-4 p-4 bg-coral-pale/15 border-2 border-dashed border-coral rounded-2xl animate-fadeIn text-left">
                    {/* Header with Cancel */}
                    <div className="flex items-start justify-between border-b border-coral/25 pb-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-coral-deep">Creating New Athlete Profile</span>
                        <span className="text-sm font-bold text-ink truncate mt-0.5">{newAthleteName}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsNewAthlete(false);
                          setNewAthleteName('');
                          setAthleteSearch('');
                          setNewAthleteEmail('');
                        }}
                        className="text-[10px] font-bold text-coral-deep hover:underline cursor-pointer shrink-0 ml-4 mt-0.5"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Warning/Info Box */}
                    <div className="flex items-start gap-3 bg-white/60 p-3.5 rounded-xl border border-coral/30 text-xs text-ink">
                      <Info size={18} className="text-coral shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1 min-w-0">
                        {targetTeam?.clubName ? (
                          <p className="text-xs leading-relaxed text-ink-2">
                            This athlete will be automatically associated with the club <strong className="text-ink font-semibold">{targetTeam.clubName}</strong>.
                          </p>
                        ) : (
                          <p className="text-xs leading-relaxed text-ink-2">
                            Note: This team has no associated club, so the new athlete will not be linked to any club.
                          </p>
                        )}
                        <p className="text-[11px] text-ink-3 leading-relaxed mt-1.5 pt-1.5 border-t border-coral/15">
                          Once added, you can edit additional profile fields (like pronouns or hometown) by visiting their athlete page.
                        </p>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        value={newAthleteEmail} 
                        onChange={e => setNewAthleteEmail(e.target.value)}
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                        placeholder="e.g. email@example.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      value={athleteSearch} 
                      onChange={e => {
                        setAthleteSearch(e.target.value);
                        setShowAthleteDropdown(true);
                      }}
                      onFocus={() => setShowAthleteDropdown(true)}
                      className="bg-white border-2 border-ink rounded-xl px-3 pr-10 w-full h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      placeholder="Type name to search existing, or add new..."
                    />
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                    
                    {showAthleteDropdown && (
                      <ul className="absolute left-0 right-0 top-11 bg-white border-2 border-ink rounded-xl shadow-md max-h-48 overflow-y-auto z-50 select-none">
                        {filteredAthletes.length > 0 ? (
                          filteredAthletes.map(a => (
                            <li 
                              key={a.id} 
                              onClick={() => {
                                setSelectedAthlete({ id: a.id, name: a.name });
                                setAthleteSearch(a.name);
                                setIsNewAthlete(false);
                                setShowAthleteDropdown(false);
                              }}
                              className="px-3.5 py-2 hover:bg-aqua-pale text-xs text-ink font-semibold cursor-pointer border-b border-ink/5 last:border-0 flex justify-between items-center gap-4"
                            >
                              <span className="truncate">{a.name}</span>
                              {a.clubName && (
                                <span className="text-[10px] text-ink-3 font-normal truncate shrink-0 max-w-[150px]">
                                  {a.clubName}
                                </span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="px-3.5 py-2 text-xs text-ink-3 italic cursor-default">
                            No matching athletes found
                          </li>
                        )}
                        {athleteSearch.trim().length > 0 && (
                          <li 
                            onClick={() => {
                              setIsNewAthlete(true);
                              setNewAthleteName(athleteSearch.trim());
                              setSelectedAthlete(null);
                              setShowAthleteDropdown(false);
                            }}
                            className="px-3.5 py-2.5 bg-coral-pale/20 hover:bg-coral-pale text-xs text-coral-deep font-bold cursor-pointer border-t border-ink/10 flex items-center gap-1"
                          >
                            <Plus size={12} /> Create new athlete &ldquo;{athleteSearch.trim()}&rdquo;
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* CAP NUMBER */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Cap Number</label>
                <input 
                  type="number" 
                  min="1"
                  max="99"
                  value={capNumber} 
                  onChange={e => setCapNumber(e.target.value)}
                  className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                  placeholder="e.g. 7"
                  required
                />
              </div>

              {/* CAPTAIN CHECKBOX */}
              <label className="flex items-center gap-2.5 p-3.5 bg-bg/25 border-2 border-ink rounded-xl cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isCaptain}
                  onChange={e => setIsCaptain(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-2 border-ink text-aqua focus:ring-aqua accent-ink cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink leading-tight">Team Captain</span>
                  <span className="text-[9px] text-ink-3 mt-0.5">Designate this player as team captain (displays captain badge).</span>
                </div>
              </label>

              {/* Modal Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-ink/10 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setAddingToTeamId(null);
                    setRosterActionError('');
                    setAthleteSearch('');
                    setSelectedAthlete(null);
                    setIsNewAthlete(false);
                    setNewAthleteName('');
                    setCapNumber('');
                    setIsCaptain(false);
                    setNewAthleteEmail('');
                  }}
                  disabled={rosterActionLoading}
                  className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rosterActionLoading}
                  className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>{rosterActionLoading ? 'Saving...' : 'Add to Roster'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* DELETE WATER POLO PLAYER MODAL */}
      {mounted && deletingPlayerState && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="tile max-w-sm w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink bg-coral-pale/40 flex justify-between items-center select-none">
              <div className="flex items-center gap-2 text-coral-deep">
                <ShieldAlert size={18} />
                <h3 className="font-display text-xl font-bold">
                  Remove Player
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDeletingPlayerState(null)}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body & Actions */}
            <div className="p-6 flex flex-col gap-5 text-left">
              {rosterActionError && (
                <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{rosterActionError}</span>
                </div>
              )}

              <p className="text-xs text-ink-2 leading-relaxed">
                Are you sure you want to remove <strong className="text-ink font-bold">{deletingPlayerState.name}</strong> from the team roster? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end pt-4 border-t border-ink/10 select-none">
                <button
                  type="button"
                  onClick={() => setDeletingPlayerState(null)}
                  disabled={rosterActionLoading}
                  className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(deletingPlayerState.teamId, deletingPlayerState.athleteId)}
                  disabled={rosterActionLoading}
                  className="pill danger bg-coral text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-coral-deep active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {rosterActionLoading ? 'Removing...' : 'Confirm Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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
