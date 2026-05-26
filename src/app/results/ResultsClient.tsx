'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Waves, Search, Sparkles, Trophy, X, ChevronDown, Award } from 'lucide-react';

interface SwimRecord {
  id: string;
  event: string;
  course: 'LCM' | 'SCM';
  age: string;
  gender: string;
  time: string;
  place: number;
  held: number;
  athleteId: string | null;
  athlete: string;
  club: string;
  clubId: string;
  tournament: string;
  flag: string;
  year: number;
  brokenBy: string | null;
}

interface WPTitle {
  id: string;
  division: string;
  year: number;
  tournament: string;
  flag: string;
  champion: string;
  clubId: string;
  score: string | null;
  held: number;
}

interface ResultsClientProps {
  swimmingRecords: SwimRecord[];
  waterPoloTitles: WPTitle[];
}

export default function ResultsClient({ swimmingRecords, waterPoloTitles }: ResultsClientProps) {
  const [sport, setSport] = useState<'swimming' | 'wp'>('swimming');
  const [search, setSearch] = useState('');
  const [age, setAge] = useState('all');
  const [gender, setGender] = useState('all');
  const [course, setCourse] = useState('all');
  const [heldOnly, setHeldOnly] = useState(true);

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
  const wpReigningCount = waterPoloTitles.filter(w => w.held).length;

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
            {sport === 'swimming' ? 'Swimming records' : 'Water polo titles'}
          </h2>
          <div className="sub text-xs text-ink-3 mt-1.5 leading-relaxed">
            {sport === 'swimming'
              ? 'Best-ever IGLA+ time for each event × age × gender. Coral ★ = the record still stands.'
              : 'Most recent champion in each division by championship year.'}
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
                return (
                  <RowWrapper
                    key={r.id}
                    href={r.athleteId ? `/athletes/${r.athleteId}` : '#'}
                    className={`record-row block no-underline transition-all ${r.held ? 'coral' : ''}`}
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
                      &apos;{String(r.year).slice(2)}
                    </span>
                  </RowWrapper>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* WATER POLO SECTION */}
      {sport === 'wp' && (
        <div className="record-list">
          {waterPoloTitles.map((w) => {
            const RowWrapper = w.clubId ? Link : 'div';
            return (
              <RowWrapper
                key={w.id}
                href={w.clubId ? `/clubs/${w.clubId}` : '#'}
                className={`record-row block no-underline transition-all ${w.held ? 'coral' : ''}`}
                style={{ gridTemplateColumns: '32px 60px 1.2fr 1.2fr auto auto' }}
              >
                <span className={`record-star flex items-center justify-center ${w.held ? 'held bg-coral text-white' : 'text-ink-3 bg-white'}`}>
                  {w.held ? <Trophy size={11} /> : '·'}
                </span>
                <span className="display display-3 font-normal text-coral select-none leading-none pr-3">{w.division}</span>
                <div>
                  <div className="r-event text-sm font-bold text-ink">{w.champion}</div>
                  <div className="r-cat text-[11px] text-ink-3 mt-0.5">Division {w.division} champion</div>
                </div>
                <div className="r-who text-xs text-ink-3 flex items-center gap-2">
                  <span className="text-base leading-none select-none">{w.flag}</span>
                  <div className="min-w-0">
                    <p className="truncate">{w.tournament}</p>
                    {w.score && (
                      <p className="text-[10px] text-ink-2 mt-0.5 tabular-nums">
                        final: <span className="font-semibold text-ink">{w.score}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="r-time font-mono font-semibold text-xs tabular-nums text-ink pr-3">{w.year}</div>
                <span className="r-year font-mono text-[10px] text-ink-2 bg-bg px-2 py-0.5 border border-ink/10 rounded-full">
                  &apos;{String(w.year).slice(2)}
                </span>
              </RowWrapper>
            );
          })}
        </div>
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
