'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Trophy, Waves, Target, Sparkles, ChevronRight, ArrowLeft, Globe, Info } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  short_name: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  founded_year: number;
  color: string;
  tagline: string;
  website: string | null;
  sports: string;
  members: number;
}

interface ClubHistoryEntry {
  club_id: string;
  tournament_id: string | null;
  medals_gold: number;
  medals_silver: number;
  medals_bronze: number;
  records_set: number;
  wp_division: string | null;
  wp_finish: number | null;
  historical_year: number;
  historical_tournament: string;
  historical_flag: string;
  isLive: number;
  is_historical_summary?: number;
}

interface ClubDetailClientProps {
  club: Club;
  history: ClubHistoryEntry[];
}

function ordinalSuffix(n: number): string {
  const j = n % 10, k = n % 100;
  if (k >= 11 && k <= 13) return 'th';
  if (j === 1) return 'st';
  if (j === 2) return 'nd';
  if (j === 3) return 'rd';
  return 'th';
}

export default function ClubDetailClient({ club, history }: ClubDetailClientProps) {
  // Aggregate lifetime medals and records dynamically from history rows
  const totals = useMemo(() => {
    return history.reduce(
      (acc, h) => ({
        g: acc.g + h.medals_gold,
        s: acc.s + h.medals_silver,
        b: acc.b + h.medals_bronze,
        rec: acc.rec + h.records_set,
      }),
      { g: 0, s: 0, b: 0, rec: 0 }
    );
  }, [history]);

  const sportsList = club.sports ? club.sports.split(',') : [];

  return (
    <div className="view-enter" data-screen-label={`Club · ${club.name}`}>
      {/* Breadcrumbs */}
      <div className="breadcrumb select-none mb-4">
        <Link href="/clubs">Clubs</Link>
        <span className="sep mx-2 text-ink-3">/</span>
        <span className="text-ink-2 font-medium">{club.name}</span>
      </div>

      {/* Hero Header themed with Club Signature Color */}
      <section 
        className="tile tile-lg hero tile-depth-aqua mb-6 overflow-hidden border-2 border-ink shadow-[5px_6px_0_#0d3a52]" 
        style={{ background: `var(--depth-overlay), ${club.color}`, color: 'white' }}
      >
        <div className="flex items-center gap-3.5 select-none relative mb-4">
          <span className="text-4xl leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">{club.flag}</span>
          <div>
            <span className="eyebrow eyebrow-on-dark text-[10px] font-bold tracking-wider uppercase">
              {club.region} · est. {club.founded_year}
            </span>
          </div>
        </div>
        
        <h1 className="display display-1 font-normal tracking-tight text-white mb-2">{club.name}</h1>
        
        <p className="font-display italic text-2xl text-white/95 my-4 leading-normal max-w-[540px]">
          &ldquo;{club.tagline}&rdquo;
        </p>
        
        <div className="hero-meta flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-white/90">
          <span className="hero-meta-item flex items-center gap-1.5">
            <MapPin size={14} /> <span>{club.city}, {club.country}</span>
          </span>
          <span className="hero-meta-item flex items-center gap-1.5">
            <Users size={14} /> <span>{club.members} athletes competed</span>
          </span>
          <span className="hero-meta-item flex items-center gap-1.5">
            <Calendar size={14} /> <span>{history.length} championships attended</span>
          </span>
          {club.website && (
            <span className="hero-meta-item flex items-center gap-1.5">
              <Globe size={14} /> 
              <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-white underline font-semibold hover:text-aqua-sky transition-colors">
                {club.website.replace(/https?:\/\/(www\.)?/, '')}
              </a>
            </span>
          )}
        </div>
      </section>

      {/* Lifetime KPI Cards */}
      <div className="stat-strip mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{history.length}</div>
          <div className="stat-tile-key text-ink-3">Championships</div>
        </div>
        <div className="stat-tile select-none" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
          <div className="stat-tile-val font-mono tabular-nums">{totals.g}</div>
          <div className="stat-tile-key font-bold text-ink/75">Gold</div>
        </div>
        <div className="stat-tile select-none" style={{ background: 'var(--silver)', color: 'var(--ink)' }}>
          <div className="stat-tile-val font-mono tabular-nums">{totals.s}</div>
          <div className="stat-tile-key font-bold text-ink/75">Silver</div>
        </div>
        <div className="stat-tile select-none" style={{ background: 'var(--bronze)', color: 'white' }}>
          <div className="stat-tile-val font-mono tabular-nums">{totals.b}</div>
          <div className="stat-tile-key font-bold text-white/75">Bronze</div>
        </div>
        <div className="stat-tile coral select-none">
          <div className="stat-tile-val font-mono text-white tabular-nums">{totals.rec}</div>
          <div className="stat-tile-key text-white/90">All-time records</div>
        </div>
      </div>

      {/* Sports / Disciplines Pills */}
      <div className="flex gap-2 flex-wrap items-center mt-6 select-none">
        <span className="section-label text-[10px] font-bold tracking-wider text-ink-3 uppercase mr-2">Disciplines:</span>
        {sportsList.map(s => (
          <span key={s} className={`sport-pill text-[10px] py-0.5 px-3 rounded-full font-semibold border ${
            s === 'Pink Flamingo' ? 'flamingo bg-coral-pale text-coral-deep border-coral/30' : 'bg-aqua-sky/50 text-ink border-ink/20'
          }`}>
            {s === 'Swimming' && <Waves size={11} className="inline mr-1" />}
            {s === 'Water Polo' && <Target size={11} className="inline mr-1" />}
            {s}
          </span>
        ))}
      </div>

      {/* History Rows list */}
      <div className="section-head mb-4 mt-10 select-none">
        <div>
          <h2 className="display display-3 font-normal text-ink">Tournament history</h2>
          <div className="sub text-xs text-ink-3 mt-1.5 leading-snug">
            Each championship {club.short_name} has attended. Click any to view full results.
          </div>
        </div>
        <span className="section-label text-[10px] font-bold tracking-wider text-ink-3 uppercase">Most recent first</span>
      </div>

      <div className="tournament-list">
        {history.map((h, idx) => {
          const RowWrapper = h.tournament_id ? Link : 'div';
          return (
            <RowWrapper
              key={idx}
              href={h.tournament_id ? `/tournaments/${h.tournament_id}` : '#'}
              className={`tournament-row block no-underline transition-all ${
                h.tournament_id ? 'cursor-pointer hover:translate-y-[-1px] hover:shadow-[3px_4px_0_#0d3a52]' : 'cursor-default opacity-70 shadow-sm'
              }`}
            >
              <span className="t-year font-display text-4xl leading-none text-ink tabular-nums">{h.historical_year}</span>
              
              <div className="flex-1">
                <div className="t-name font-bold text-sm text-ink flex items-center gap-1.5">
                  <span className="text-base leading-none select-none">{h.historical_flag}</span>
                  <span>{h.historical_tournament}</span>
                </div>
                
                <div className="t-loc text-[11px] text-ink-2 mt-2 flex flex-wrap gap-2 items-center">
                  <span className="select-none flex flex-wrap gap-1.5 items-center mr-2">
                    <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-2 rounded-full shadow-[1px_1.5px_0_#0d3a52]">
                      <span className="w-2.5 h-2.5 rounded-full border border-ink inline-block" style={{ background: 'var(--gold)' }} />
                      <span>{h.medals_gold} Gold</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-2 rounded-full shadow-[1px_1.5px_0_#0d3a52]">
                      <span className="w-2.5 h-2.5 rounded-full border border-ink inline-block" style={{ background: 'var(--silver)' }} />
                      <span>{h.medals_silver} Silver</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-2 rounded-full shadow-[1px_1.5px_0_#0d3a52]">
                      <span className="w-2.5 h-2.5 rounded-full border border-ink inline-block" style={{ background: 'var(--bronze)' }} />
                      <span>{h.medals_bronze} Bronze</span>
                    </span>
                  </span>
                  
                  {h.records_set > 0 && (
                    <span className="text-coral-deep font-semibold flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>{h.records_set} record{h.records_set !== 1 ? 's' : ''} set</span>
                    </span>
                  )}
                  
                  {h.wp_division && h.wp_finish && (
                    <span className="text-ink-3 select-none flex items-center gap-1">
                      <Target size={11} />
                      <span>
                        Water Polo: {h.wp_finish === 1 ? '🏆 ' : ''}{h.wp_finish}
                        {ordinalSuffix(h.wp_finish)} in Div {h.wp_division}
                      </span>
                    </span>
                  )}
                </div>

                {h.is_historical_summary === 1 && (
                  <div className="text-xs text-ink-2 bg-bg-2 border border-ink/30 p-3 rounded mt-2.5 flex items-start gap-2 shadow-[2px_2px_0_var(--ink)] max-w-xl">
                    <Info size={14} className="text-aqua mt-0.5 flex-shrink-0" />
                    <span>
                      We do not have the individual race results or team rosters in our database for this tournament. The medal counts and standings shown above are compiled from verified historical club records.
                    </span>
                  </div>
                )}
              </div>

              <div className="select-none">
                {h.isLive === 1 ? (
                  <span className="status-pill live flex items-center gap-1.5 bg-coral text-white font-bold py-1 px-2.5 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                    <span className="dot w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Live now</span>
                  </span>
                ) : (
                  <span className="status-pill past flex items-center bg-bg-2 text-ink font-bold py-1 px-2.5 rounded-full border border-ink/40 text-[9px] uppercase tracking-wider">
                    Past
                  </span>
                )}
              </div>

              <div className="t-stats hide-mobile select-none text-right min-w-[60px]">
                <div className="t-stat">
                  <div className="v font-mono text-xs font-semibold tabular-nums text-ink">
                    {h.medals_gold + h.medals_silver + h.medals_bronze}
                  </div>
                  <div className="k text-[9px] uppercase text-ink-3 font-bold mt-0.5">Medals</div>
                </div>
              </div>

              {h.tournament_id ? (
                <ChevronRight size={18} className="text-ink-3 ml-2 hover:text-coral transition-colors" />
              ) : (
                <span className="w-[26px]" />
              )}
            </RowWrapper>
          );
        })}
      </div>
    </div>
  );
}
