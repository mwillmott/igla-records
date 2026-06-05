'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, Trophy } from 'lucide-react';

export function formatTournamentDates(startDateStr: string, endDateStr: string) {
  if (!startDateStr || !endDateStr) return '';
  const parseParts = (str: string) => {
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1,
      day: parseInt(parts[2], 10)
    };
  };
  const start = parseParts(startDateStr);
  const end = parseParts(endDateStr);
  if (!start || !end) return `${startDateStr} – ${endDateStr}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const startMonth = monthNames[start.month];
  const endMonth = monthNames[end.month];

  if (start.year !== end.year) {
    return `${startMonth} ${start.day}, ${start.year} – ${endMonth} ${end.day}, ${end.year}`;
  }
  if (start.month !== end.month) {
    return `${startMonth} ${start.day} – ${endMonth} ${end.day}, ${start.year}`;
  }
  if (start.day !== end.day) {
    return `${startMonth} ${start.day} – ${end.day}, ${start.year}`;
  }
  return `${startMonth} ${start.day}, ${start.year}`;
}

interface Tournament {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  flag: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 'live' | 'upcoming' | 'past';
  color: string;
  website: string | null;
  venue: string | null;
  description: string | null;
  expected_athletes: number | null;
  expected_nations: number | null;
  expected_clubs: number | null;
  participants: number | null;
  clubs: number | null;
  records: number | null;
}

interface TournamentsClientProps {
  tournaments: Tournament[];
}

export default function TournamentsClient({ tournaments }: TournamentsClientProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const live = useMemo(() => tournaments.find(t => t.status === 'live'), [tournaments]);
  const upcoming = useMemo(() => 
    tournaments.filter(t => t.status === 'upcoming').sort((a, b) => a.year - b.year), 
    [tournaments]
  );
  const past = useMemo(() => 
    tournaments.filter(t => t.status === 'past').sort((a, b) => b.year - a.year), 
    [tournaments]
  );
  
  const nextUp = upcoming[0];

  const list = useMemo(() => {
    if (filter === 'upcoming') return upcoming;
    if (filter === 'past') return past;
    return [...(live ? [live] : []), ...upcoming, ...past];
  }, [filter, live, upcoming, past]);

  const totalAthletes = useMemo(() => 
    past.reduce((sum, t) => sum + (t.participants || 0), 0), 
    [past]
  );
  
  const totalRecords = useMemo(() => 
    past.reduce((sum, t) => sum + (t.records || 0), 0) + (live?.records || 0), 
    [past, live]
  );

  return (
    <div className="view-enter" data-screen-label="Tournaments">
      {/* Hero Header */}
      <section className="tile tile-lg hero tile-depth-aqua mb-6">
        <span className="eyebrow eyebrow-on-dark mb-4">
          ● Championships since 1987
        </span>
        <h1 className="display display-1 font-normal tracking-tight text-white mb-4">
          Every <em>summer</em>,<br />a new <span className="hl">city</span>.
        </h1>
        <p className="lede on-dark max-w-[540px] text-white/90">
          The IGLA+ Championship rotates around the world each year. Bid for hosting opens
          every August. Browse what&apos;s coming and where we&apos;ve been.
        </p>
      </section>

      {/* KPI Tiles Strip */}
      <div className="stat-strip mb-8">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{past.length + (live ? 1 : 0)}</div>
          <div className="stat-tile-key text-ink-3">Championships held</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{totalAthletes.toLocaleString()}+</div>
          <div className="stat-tile-key text-ink-3">Athletes hosted</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val font-mono text-white tabular-nums">{totalRecords}</div>
          <div className="stat-tile-key text-white/90">Records broken</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{upcoming.length}</div>
          <div className="stat-tile-key text-ink-3">Upcoming cities</div>
        </div>
      </div>

      {/* Next up — large prominent CTA banner tile */}
      {nextUp && (
        <Link 
          href={`/tournaments/${nextUp.id}`}
          className="tile tile-lg block no-underline transition-all hover:translate-y-[-2px] hover:shadow-[6px_8px_0_#0d3a52] active:translate-y-[2px] active:shadow-[2px_3px_0_#0d3a52] mb-10 overflow-hidden"
          style={{
            padding: '26px 30px 28px',
            background: `var(--depth-overlay), ${nextUp.color}`,
            color: 'white',
            border: '2px solid var(--ink)',
            boxShadow: 'var(--tile-shadow)',
          }}
        >
          <span className="eyebrow eyebrow-on-dark flex items-center gap-1.5 w-fit">
            <Calendar size={11} /> Next up · {nextUp.year}
          </span>
          <h2 className="display text-white font-normal leading-none my-4" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            <em>{nextUp.city}</em> <span className="hl">{nextUp.year}</span>
          </h2>
          <div className="font-display italic text-lg text-white/85 mb-4">
            {nextUp.type}
          </div>
          
          <div className="hero-meta flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-white/90">
            <span className="hero-meta-item flex items-center gap-1.5">
              <span className="text-base leading-none select-none">{nextUp.flag}</span>
              <span>{nextUp.city}, {nextUp.country}</span>
            </span>
            <span className="hero-meta-item flex items-center gap-1.5">
              <Calendar size={14} /> <span>{formatTournamentDates(nextUp.start_date, nextUp.end_date)}</span>
            </span>
            <span className="hero-meta-item flex items-center gap-1.5">
              <MapPin size={14} /> <span>{nextUp.venue}</span>
            </span>
          </div>

          {nextUp.expected_athletes && (
            <div className="mt-6 pt-5 border-t border-white/20 grid grid-columns-3 gap-6 select-none" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <div className="font-display text-white text-3xl leading-none">{nextUp.expected_athletes.toLocaleString()}+</div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-white/70 mt-1.5">Athletes expected</div>
              </div>
              <div>
                <div className="font-display text-white text-3xl leading-none">{nextUp.expected_nations}</div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-white/70 mt-1.5">Nations</div>
              </div>
              <div>
                <div className="font-display text-white text-3xl leading-none">{nextUp.expected_clubs}</div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-white/70 mt-1.5">Clubs</div>
              </div>
            </div>
          )}
        </Link>
      )}

      {/* Segment Selector & Title */}
      <div className="section-head mb-6">
        <div>
          <h2 className="display display-3 font-normal text-ink">All championships</h2>
          <div className="sub text-xs text-ink-3 mt-1 leading-snug">Click any tournament for the full results.</div>
        </div>
        
        {/* Navigation Filters */}
        <div className="filter-row gap-2" style={{ margin: 0 }}>
          <button 
            className={`pill cursor-pointer rounded-full font-semibold border-2 transition-all ${filter === 'all' ? 'active bg-ink text-white' : 'bg-white hover:bg-aqua-pale text-ink'}`} 
            onClick={() => setFilter('all')}
          >
            All <span className="count ml-1.5 font-bold">{tournaments.length}</span>
          </button>
          <button 
            className={`pill cursor-pointer rounded-full font-semibold border-2 transition-all ${filter === 'upcoming' ? 'active bg-ink text-white' : 'bg-white hover:bg-aqua-pale text-ink'}`} 
            onClick={() => setFilter('upcoming')}
          >
            Upcoming <span className="count ml-1.5 font-bold">{upcoming.length}</span>
          </button>
          <button 
            className={`pill cursor-pointer rounded-full font-semibold border-2 transition-all ${filter === 'past' ? 'active bg-ink text-white' : 'bg-white hover:bg-aqua-pale text-ink'}`} 
            onClick={() => setFilter('past')}
          >
            Past <span className="count ml-1.5 font-bold">{past.length}</span>
          </button>
        </div>
      </div>

      {/* Championships Table List */}
      <div className="tournament-list">
        {list.map((t) => {
          return (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className={`tournament-row block no-underline transition-all ${t.status}`}
            >
              <span className={`t-year font-display text-4xl leading-none tabular-nums ${
                t.status === 'live' ? 'text-coral font-bold' : t.status === 'upcoming' ? 'text-aqua' : 'text-ink'
              }`}>
                {t.year}
              </span>

              <div className="flex-1">
                <div className="t-name font-bold text-sm text-ink flex items-center gap-1.5">
                  <span className="text-base leading-none select-none">{t.flag}</span>
                  <span>{t.name}</span>
                </div>
                <div className="t-co font-display italic text-xs text-ink-3 mt-0.5">{t.type}</div>
                <div className="t-loc text-[11px] text-ink-2 mt-1.5 flex flex-wrap gap-x-3">
                  <span>{t.city}, {t.country}</span>
                  <span className="text-ink-3">{formatTournamentDates(t.start_date, t.end_date)}</span>
                </div>
              </div>

              <div className="select-none">
                {t.status === 'live' && (
                  <span className="status-pill live flex items-center gap-1.5 bg-coral text-white font-bold py-1 px-2.5 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                    <span className="dot w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Live now</span>
                  </span>
                )}
                {t.status === 'upcoming' && (
                  <span className="status-pill upcoming flex items-center bg-white text-ink font-bold py-1 px-2.5 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                    Upcoming
                  </span>
                )}
                {t.status === 'past' && (
                  <span className="status-pill past flex items-center bg-bg-2 text-ink font-bold py-1 px-2.5 rounded-full border border-ink/40 text-[9px] uppercase tracking-wider">
                    Past
                  </span>
                )}
              </div>

              {/* Statistics (Includes Records side-by-side for past/live, empty for upcoming) */}
              {t.status !== 'upcoming' ? (
                <div className="t-stats hide-mobile select-none">
                  <div className="t-stat">
                    <div className="v font-mono text-xs font-semibold tabular-nums text-ink">{t.participants?.toLocaleString() ?? 0}</div>
                    <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Athletes</div>
                  </div>
                  <div className="t-stat pl-4 border-l border-ink/10">
                    <div className="v font-mono text-xs font-semibold tabular-nums text-ink">{t.clubs ?? 0}</div>
                    <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Clubs</div>
                  </div>
                  <div className="t-stat pl-4 border-l border-ink/10">
                    <div className="v font-mono text-xs font-bold tabular-nums text-coral-deep">{t.records ?? 0}</div>
                    <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Records</div>
                  </div>
                </div>
              ) : (
                <div className="t-stats hide-mobile" />
              )}

              <ChevronRight size={18} className="text-ink-3 cursor-pointer ml-2 hover:text-coral transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
