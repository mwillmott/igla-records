'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Waves, Search, Sparkles, Trophy, X, ChevronDown, Award, Edit3, Save, ShieldAlert, Clock } from 'lucide-react';
import EditResultModal from '../../components/EditResultModal';
import { UserSession } from '@/lib/auth';
import { WATER_POLO_DIVISIONS } from '@/lib/config';

interface SwimRecord {
  id: string;
  event: string;
  course: 'LCM' | 'SCM';
  age: string;
  gender: string;
  time: string;
  place: number;
  held: number;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  athleteId: string | null;
  athlete: string;
  club: string;
  clubId: string;
  tournament: string;
  flag: string;
  year: number;
  brokenBy: string | null;
  brokenById: string | null;
}

interface WPResult {
  id: string;
  tournamentId: string;
  division: string;
  placement: number;
  year: number;
  tournament: string;
  flag: string;
  teamName: string;
  clubId: string;
  clubName: string | null;
  wins: number | null;
  losses: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  points: number | null;
  created_by: string | null;
  created_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
  held: number;
}

interface ResultsClientProps {
  swimmingRecords: SwimRecord[];
  waterPoloResults: WPResult[];
  athletes: { id: string; name: string }[];
  clubs: { id: string; name: string }[];
  session: UserSession | null;
}

export default function ResultsClient({ swimmingRecords, waterPoloResults, athletes, clubs, session }: ResultsClientProps) {
  const router = useRouter();
  const [sport, setSport] = useState<'swimming' | 'wp'>('swimming');
  const [search, setSearch] = useState('');
  const [age, setAge] = useState('all');
  const [gender, setGender] = useState('all');
  const [course, setCourse] = useState('all');
  const [heldOnly, setHeldOnly] = useState(true);

  // Water Polo filter state
  const [wpSearch, setWpSearch] = useState('');
  const [wpDivision, setWpDivision] = useState('all');

  // Searchable club dropdown state in Edit Modal
  const [clubSearch, setClubSearch] = useState('');
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const clubDropdownRef = useRef<HTMLDivElement>(null);

  // Administrative Record Edit States
  const [editingRecord, setEditingRecord] = useState<{
    type: 'swimming' | 'wp';
    data: any;
  } | null>(null);
  const [editFields, setEditFields] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (editingRecord) {
      setEditError('');
      setConfirmDelete(false);
      setDeleting(false);
      if (editingRecord.type === 'swimming') {
        setEditFields({
          event: editingRecord.data.event,
          course: editingRecord.data.course,
          age_category: editingRecord.data.age,
          gender_category: editingRecord.data.gender,
          time: editingRecord.data.time,
          place: editingRecord.data.place,
          is_all_time_record: true,
          record_still_held: editingRecord.data.held === 1,
          athlete_id: editingRecord.data.athleteId || '',
          broken_by_athlete_id: editingRecord.data.brokenById || '',
        });
      } else {
        setEditFields({
          team_name: editingRecord.data.teamName || '',
          club_id: editingRecord.data.clubId || '',
          division: editingRecord.data.division || '',
          final_placement: editingRecord.data.placement || 1,
          wins: editingRecord.data.wins !== null && editingRecord.data.wins !== undefined ? editingRecord.data.wins : '',
          losses: editingRecord.data.losses !== null && editingRecord.data.losses !== undefined ? editingRecord.data.losses : '',
          goals_for: editingRecord.data.goalsFor !== null && editingRecord.data.goalsFor !== undefined ? editingRecord.data.goalsFor : '',
          goals_against: editingRecord.data.goalsAgainst !== null && editingRecord.data.goalsAgainst !== undefined ? editingRecord.data.goalsAgainst : '',
          points: editingRecord.data.points !== null && editingRecord.data.points !== undefined ? editingRecord.data.points : '',
        });
        setClubSearch(editingRecord.data.clubName || '');
      }
    }
  }, [editingRecord, clubs]);

  const handleDelete = async () => {
    if (!editingRecord) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setEditError('');

    try {
      const response = await fetch('/api/admin/records/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingRecord.type,
          id: editingRecord.data.id,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || 'Failed to delete record.');
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }

      setEditingRecord(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setEditError('An unexpected network error occurred.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setSaving(true);
    setEditError('');

    try {
      const response = await fetch('/api/admin/records/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingRecord.type,
          id: editingRecord.data.id,
          fields: editFields,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || 'Failed to update record.');
        setSaving(false);
        return;
      }

      setEditingRecord(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setEditError('An unexpected network error occurred.');
      setSaving(false);
    }
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

  const updateField = (field: string, value: any) => {
    setEditFields((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Compute unique age options from database
  const ageOptions = useMemo(() => {
    const ages = swimmingRecords.map(r => r.age);
    return ['all', ...Array.from(new Set(ages))].sort();
  }, [swimmingRecords]);

  // Apply filters to swimming results
  const filteredSwim = useMemo(() => {
    const q = search.trim().toLowerCase();
    return swimmingRecords.filter(r => {
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
  }, [swimmingRecords, age, gender, course, heldOnly, search]);

  // Apply filters to water polo results
  const filteredWP = useMemo(() => {
    const q = wpSearch.trim().toLowerCase();
    return waterPoloResults.filter(w => {
      if (wpDivision !== 'all' && w.division !== wpDivision) return false;
      if (q) {
        const hay = `${w.teamName || ''} ${w.clubName || ''} ${w.tournament || ''} ${w.division || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [waterPoloResults, wpSearch, wpDivision]);

  // Sliding Sport Toggle Background Animation
  const swimmingRef = useRef<HTMLButtonElement>(null);
  const wpRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 });

  useEffect(() => {
    const el = sport === 'swimming' ? swimmingRef.current : wpRef.current;
    if (el) {
      setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [sport]);

  // KPI Calculations
  const heldCount = swimmingRecords.filter(r => r.held).length;
  const valenciaCount = swimmingRecords.filter(r => r.held && r.year === 2026).length;
  const tournamentsSpanned = new Set(swimmingRecords.filter(r => r.held).map(r => r.tournament)).size;
  const wpReigningCount = waterPoloResults.filter(w => w.held).length;

  return (
    <div className="view-enter" data-screen-label="Results">
      {/* Hero Header */}
      <section className="tile tile-lg hero tile-depth-aqua mb-6">
        <span className="eyebrow eyebrow-on-dark mb-4">
          ● All-time records · since 1987
        </span>
        <h1 className="display display-1 font-normal tracking-tight text-white mb-4">
          Every <span className="hl">record</span>,<br />ever.
        </h1>
        <p className="lede on-dark max-w-[540px] text-white/90">
          The full archive of every all-time IGLA+ record across swimming and water polo.
          Filter by event, age, gender, or course — then click an athlete to view their unified timeline.
        </p>
      </section>

      {/* KPI Tiles Grid */}
      <div className="stat-strip mb-8">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{heldCount}</div>
          <div className="stat-tile-key text-ink-3">Records currently held</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val font-mono text-white tabular-nums">{valenciaCount}</div>
          <div className="stat-tile-key text-white/90">Set at Valencia 2026</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{tournamentsSpanned}</div>
          <div className="stat-tile-key text-ink-3">Tournaments spanned</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{wpReigningCount}</div>
          <div className="stat-tile-key text-ink-3">Reigning WP champions</div>
        </div>
      </div>

      {/* Sport Toggle & Subtitle */}
      <div className="section-head mb-6">
        <div>
          <h2 className="display display-3 font-normal text-ink">
            {sport === 'swimming' ? 'Swimming records' : 'Water polo results'}
          </h2>
          <div className="sub text-xs text-ink-3 mt-1.5 leading-relaxed">
            {sport === 'swimming'
              ? 'Best-ever IGLA+ time for each event × age × gender. Coral ★ = the record still stands.'
              : 'Standings and rankings in each division across all championship tournaments.'}
          </div>
        </div>
        
        {/* Toggle Pill Segment Control */}
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
            <Trophy size={14} /> Water polo
          </button>
        </div>
      </div>

      {/* swimming SECTION */}
      {sport === 'swimming' && (
        <>
          {/* Filters Dashboard */}
          <div className="filter-row gap-3 mb-6">
            <div className="search flex-1 min-w-[220px]">
              <Search size={15} className="text-ink-2" />
              <input
                placeholder="Search event, athlete, or club…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-xs text-ink placeholder-ink-3 focus:outline-none"
              />
              {search && (
                <button className="search-clear cursor-pointer" onClick={() => setSearch('')} aria-label="Clear">
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
              className={`pill h-10 px-3.5 flex items-center gap-1.5 cursor-pointer rounded-full font-semibold border-2 transition-all ${
                heldOnly ? 'coral border-ink bg-coral text-white' : 'border-ink bg-white hover:bg-aqua-pale text-ink'
              }`}
              onClick={() => setHeldOnly(v => !v)}
            >
              <Sparkles size={12} /> Currently held
            </button>

            <div className="results-meta text-xs text-ink-3 tabular-nums ml-auto select-none">
              <span className="font-semibold">{filteredSwim.length}</span> records
            </div>
          </div>

          {/* Records Row Feed */}
          {filteredSwim.length === 0 ? (
            <div className="empty flex flex-col items-center justify-center p-12 text-center bg-white/40 border-2 border-dashed border-ink/20 rounded-2xl">
              <Search size={28} className="text-ink-3 mb-3" />
              <h3 className="font-bold text-ink text-base">No records match</h3>
              <p className="text-xs text-ink-3 mt-1">Adjust the filters or clear them to see everything.</p>
            </div>
          ) : (
            <div className="record-list">
              {filteredSwim.map((r) => {
                const RowWrapper = r.athleteId ? Link : 'div';
                const isAdminUser = session?.role === 'admin';
                return (
                  <RowWrapper
                    key={r.id}
                    href={r.athleteId ? `/athletes/${r.athleteId}` : '#'}
                    className={`record-row block no-underline transition-all ${r.held ? 'coral' : ''}`}
                    style={isAdminUser ? { gridTemplateColumns: '32px minmax(140px, 1.4fr) minmax(110px, 1fr) minmax(160px, 1.5fr) auto auto auto' } : undefined}
                  >
                    <span className={`record-star flex items-center justify-center ${r.held ? 'held bg-coral text-white' : 'text-ink-3 bg-white'}`}>
                      {r.held ? <Sparkles size={11} /> : '·'}
                    </span>
                    <div>
                      <div className="r-event text-sm font-bold text-ink">{r.event}</div>
                      <div className="r-cat text-[11px] text-ink-3 mt-0.5">{r.age} · {r.gender}</div>
                      <span className="r-course text-[10px] uppercase font-mono tracking-wider mt-1 px-1.5 py-0.5 bg-bg-2 border border-ink/10 rounded">{r.course}</span>
                    </div>
                    <div className="r-who">
                      <span className="athlete font-semibold text-ink hover:text-coral transition-colors">{r.athlete}</span>
                      <div className="text-[11px] text-ink-3 mt-0.5">{r.club}</div>
                    </div>
                    <div className="text-xs text-ink-3 flex items-center gap-1.5">
                      <span className="text-base leading-none select-none">{r.flag}</span>
                      <span>{r.tournament}</span>
                    </div>
                    <div className="r-time font-mono font-semibold text-sm tabular-nums text-ink">{r.time}</div>
                    <span className="r-year font-mono text-[10px] text-ink-2 bg-bg px-2 py-0.5 border border-ink/10 rounded-full">
                      {r.year}
                    </span>
                    {isAdminUser && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingRecord({ type: 'swimming', data: r });
                        }}
                        className="icon-btn shrink-0 border border-ink/20 hover:bg-coral-pale text-ink transition-all hover:border-coral cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg"
                        title="Edit Swim Record"
                      >
                        <Edit3 size={12} />
                      </button>
                    )}
                  </RowWrapper>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* WATER POLO SECTION */}
      {sport === 'wp' && (
        <>
          {/* Filters Dashboard for Water Polo */}
          <div className="filter-row gap-3 mb-6">
            <div className="search flex-1 min-w-[220px]">
              <Search size={15} className="text-ink-2" />
              <input
                placeholder="Search team, club, or tournament…"
                value={wpSearch}
                onChange={e => setWpSearch(e.target.value)}
                className="w-full text-xs text-ink placeholder-ink-3 focus:outline-none"
              />
              {wpSearch && (
                <button className="search-clear cursor-pointer" onClick={() => setWpSearch('')} aria-label="Clear">
                  <X size={14} />
                </button>
              )}
            </div>

            <SimpleSelect value={wpDivision} onChange={setWpDivision} options={[
              { v: 'all', label: 'All divisions' },
              ...WATER_POLO_DIVISIONS.map(d => ({ v: d, label: `${d} Division` }))
            ]} />

            <div className="results-meta text-xs text-ink-3 tabular-nums ml-auto select-none">
              <span className="font-semibold">{filteredWP.length}</span> results
            </div>
          </div>

          {filteredWP.length === 0 ? (
            <div className="empty flex flex-col items-center justify-center p-12 text-center bg-white/40 border-2 border-dashed border-ink/20 rounded-2xl">
              <Search size={28} className="text-ink-3 mb-3" />
              <h3 className="font-bold text-ink text-base">No results match</h3>
              <p className="text-xs text-ink-3 mt-1">Adjust the filters or clear them to see everything.</p>
            </div>
          ) : (
            <div className="record-list">
              {filteredWP.map((w) => {
                const isAdminUser = session?.role === 'admin';
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      if (w.tournamentId) {
                        router.push(`/tournaments/${w.tournamentId}?sport=wp`);
                      }
                    }}
                    className={`record-row transition-all ${w.held ? 'coral' : ''}`}
                    style={isAdminUser 
                      ? { gridTemplateColumns: '42px 1.4fr 1.4fr auto auto', cursor: 'pointer' } 
                      : { gridTemplateColumns: '42px 1.4fr 1.4fr auto', cursor: 'pointer' }}
                  >
                    <span className={`place-badge flex items-center justify-center select-none ${
                      w.placement === 1 ? 'place-1' : w.placement === 2 ? 'place-2' : w.placement === 3 ? 'place-3' : 'place-other'
                    }`}>
                      {w.placement}
                    </span>
                    <div>
                      <div className="r-event text-sm font-bold text-ink">{w.teamName}</div>
                      <div className="r-cat text-[11px] text-ink-3 mt-0.5">
                        Club:{' '}
                        {w.clubId ? (
                          <Link 
                            href={`/clubs/${w.clubId}`}
                            className="font-semibold text-ink hover:text-coral transition-colors underline decoration-dotted hover:decoration-solid"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents triggering row click
                            }}
                          >
                            {w.clubName || w.teamName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-ink">{w.clubName || w.teamName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-ink-3 flex flex-col justify-center gap-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{w.flag}</span>
                        <span className="font-semibold">{w.tournament}</span>
                      </div>
                      <div className="text-[11px] text-ink-3">
                        Division: <span className="font-bold text-coral">{w.division}</span>
                      </div>
                    </div>
                    <span className="r-year font-mono text-[10px] text-ink-2 bg-bg px-2.5 py-0.5 border border-ink/10 rounded-full select-none">
                      {w.year}
                    </span>
                    {isAdminUser && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingRecord({ type: 'wp', data: w });
                        }}
                        className="icon-btn shrink-0 border border-ink/20 hover:bg-coral-pale text-ink transition-all hover:border-coral cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg"
                        title="Edit Water Polo Result"
                      >
                        <Edit3 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* REUSABLE SWIMMING RECORD EDIT MODAL */}
      <EditResultModal
        isOpen={editingRecord?.type === 'swimming'}
        onClose={() => setEditingRecord(null)}
        recordData={editingRecord?.data}
        athletes={athletes}
        session={session}
        onSaveSuccess={() => {
          setEditingRecord(null);
          window.location.reload();
        }}
      />

      {/* WATER POLO EDIT MODAL */}
      {mounted && editingRecord?.type === 'wp' && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="tile max-w-lg w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  Edit Water Polo Result
                </h3>
              </div>
              <button 
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
              {editError && (
                <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Team Name</label>
                <input 
                  type="text" 
                  value={editFields.team_name || ''} 
                  onChange={e => updateField('team_name', e.target.value)}
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
                      updateField('club_id', ''); // clear id while searching/typing
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
                          updateField('club_id', c.id);
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
                      value={editFields.division || ''} 
                      onChange={e => updateField('division', e.target.value)}
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
                    value={editFields.final_placement || 1} 
                    onChange={e => updateField('final_placement', parseInt(e.target.value) || 1)}
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
                      value={editFields.wins ?? ''} 
                      onChange={e => updateField('wins', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Losses</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editFields.losses ?? ''} 
                      onChange={e => updateField('losses', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Goals For</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editFields.goals_for ?? ''} 
                      onChange={e => updateField('goals_for', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Goals Ag.</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editFields.goals_against ?? ''} 
                      onChange={e => updateField('goals_against', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Points</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editFields.points ?? ''} 
                      onChange={e => updateField('points', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
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
                    <span className="font-semibold text-ink">{editingRecord.data.created_by || 'system@igla.org'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                    <span>Timestamp:</span>
                    <span>{formatDate(editingRecord.data.created_at)}</span>
                  </div>
                  
                  {editingRecord.data.updated_by && (
                    <>
                      <div className="h-[1.5px] border-t border-dashed border-ink/20 my-1" />
                      <div className="flex justify-between items-center text-[11px] text-ink-2">
                        <span>Last Updated By:</span>
                        <span className="font-semibold text-coral">{editingRecord.data.updated_by}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                        <span>Timestamp:</span>
                        <span>{formatDate(editingRecord.data.updated_at)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-ink/10 select-none">
                {confirmDelete ? (
                  <div className="flex gap-3 w-full justify-between items-center animate-fadeIn">
                    <span className="text-[11px] font-bold text-coral-deep uppercase tracking-wide">Are you absolutely sure? This cannot be undone.</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={handleDelete}
                        className="pill danger font-bold text-xs py-2.5 px-5 cursor-pointer"
                      >
                        {deleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmDelete(false);
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
                      onClick={handleDelete}
                      className="pill bg-white border-2 border-coral-deep text-coral-deep hover:bg-coral-pale font-bold text-xs py-2.5 px-4 rounded-full cursor-pointer"
                    >
                      Delete Result
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(null)}
                        disabled={saving}
                        className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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
