'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Globe, Search, Waves, Target, Trophy, X, Users } from 'lucide-react';

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
  sports: string; // Comma separated list from DB
  members: number;
  gold: number;
  silver: number;
  bronze: number;
  records: number;
  tournamentsAttended: number;
}

interface ClubsClientProps {
  clubs: Club[];
}

export default function ClubsClient({ clubs }: ClubsClientProps) {
  const [region, setRegion] = useState('All');
  const [search, setSearch] = useState('');

  // 1. Group regions dynamically for filters
  const regions = useMemo(() => {
    const counts: Record<string, number> = {};
    clubs.forEach(c => {
      counts[c.region] = (counts[c.region] || 0) + 1;
    });
    
    return [
      { name: 'All', count: clubs.length },
      ...Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    ];
  }, [clubs]);

  // 2. Filter clubs by search and region
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clubs.filter(c => {
      if (region !== 'All' && c.region !== region) return false;
      if (q) {
        const hay = `${c.name} ${c.city} ${c.country} ${c.sports}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clubs, region, search]);

  const totalMembers = useMemo(() => clubs.reduce((sum, c) => sum + c.members, 0), [clubs]);
  const totalCountries = useMemo(() => new Set(clubs.map(c => c.country)).size, [clubs]);

  return (
    <div className="view-enter" data-screen-label="Clubs">
      {/* Hero Banner Header */}
      <section className="tile tile-lg hero tile-depth-aqua mb-6">
        <span className="eyebrow eyebrow-on-dark mb-4">
          ● {clubs.length} clubs · {totalCountries} countries
        </span>
        <h1 className="display display-1 font-normal tracking-tight text-white mb-4">
          Find your <span className="hl">family</span>
        </h1>
        <p className="lede on-dark max-w-[540px] text-white/90">
          IGLA+ is a global network of LGBTQIA+ aquatics clubs. Find yours,
          visit one when you travel, or start a new one in your city.
        </p>
      </section>

      {/* KPI Tiles Strip */}
      <div className="stat-strip mb-8">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{clubs.length}</div>
          <div className="stat-tile-key text-ink-3">Member clubs</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{totalMembers.toLocaleString()}</div>
          <div className="stat-tile-key text-ink-3">Athletes worldwide</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{totalCountries}</div>
          <div className="stat-tile-key text-ink-3">Countries represented</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val font-mono text-white tabular-nums">6</div>
          <div className="stat-tile-key text-white/90">Aquatic disciplines</div>
        </div>
      </div>

      <div className="section-head mb-4">
        <div>
          <h2 className="display display-3 font-normal text-ink">All clubs</h2>
          <div className="sub text-xs text-ink-3 mt-1.5 leading-snug">Filter by region or search by name, city, or sport.</div>
        </div>
      </div>

      {/* Regions Filter Bar & Search */}
      <div className="filter-row gap-3 mb-6 select-none">
        <div className="flex flex-wrap gap-2 flex-1">
          {regions.map(r => (
            <button
              key={r.name}
              className={`pill cursor-pointer rounded-full font-semibold border-2 transition-all ${
                region === r.name ? 'active bg-ink text-white' : 'bg-white hover:bg-aqua-pale text-ink'
              }`}
              onClick={() => setRegion(r.name)}
            >
              {r.name === 'All' && <Globe size={12} className="inline mr-1" />}
              <span>{r.name}</span>
              <span className="count ml-1.5 font-bold">{r.count}</span>
            </button>
          ))}
        </div>
        
        <div className="search min-w-[280px]">
          <Search size={15} className="text-ink-2" />
          <input
            placeholder="Search clubs, cities, sports…"
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
      </div>

      <div className="text-xs text-ink-3 mb-4 select-none">
        Showing <span className="font-mono tabular-nums font-semibold">{filtered.length}</span> of <span className="font-mono tabular-nums font-semibold">{clubs.length}</span> clubs
      </div>

      {/* Grid of Club Cards */}
      <div className="clubs-grid">
        {filtered.map((c) => {
          const sportsList = c.sports ? c.sports.split(',') : [];
          return (
            <Link
              key={c.id}
              href={`/clubs/${c.id}`}
              className="club-card block no-underline transition-all hover:translate-y-[-2px] hover:shadow-[5px_6px_0_#0d3a52] active:translate-y-[2px] active:shadow-[1px_2px_0_#0d3a52]"
              style={{ '--club-color': c.color } as React.CSSProperties}
            >
              <div className="strip" />
              <div className="body flex flex-col h-full justify-between">
                <div className="club-head flex justify-between items-start gap-3 select-none">
                  <div>
                    <h3 className="club-name font-display text-2xl font-normal text-ink leading-tight">{c.name}</h3>
                    <div className="club-locale text-xs text-ink-3 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {c.city}, {c.country}
                    </div>
                  </div>
                  <span className="club-flag text-3xl leading-none">{c.flag}</span>
                </div>

                <div className="club-tagline font-display italic text-sm text-ink-2 my-4 leading-relaxed">
                  &ldquo;{c.tagline}&rdquo;
                </div>

                <div className="club-sports flex flex-wrap gap-1.5 mb-4 select-none">
                  {sportsList.slice(0, 4).map(s => (
                    <span key={s} className={`sport-pill text-[10px] py-0.5 px-2.5 rounded-full font-semibold border ${
                      s === 'Pink Flamingo' ? 'flamingo bg-coral-pale text-coral-deep border-coral/30' : 'bg-aqua-sky/50 text-ink border-ink/20'
                    }`}>
                      {s === 'Swimming' && <Waves size={10} className="inline mr-1" />}
                      {s === 'Water Polo' && <Target size={10} className="inline mr-1" />}
                      {s}
                    </span>
                  ))}
                </div>

                <div className="club-foot flex justify-between items-end border-t border-dashed border-ink/20 pt-3 mt-auto">
                  <div className="select-none">
                    <div className="members font-display text-2xl leading-none font-normal text-ink tabular-nums">{c.members}</div>
                    <div className="members-label text-[9px] font-bold uppercase tracking-wider text-ink-3 mt-1">Athletes competed · est. {c.founded_year}</div>
                  </div>
                  <span className="medal-pill select-none flex items-center gap-1.5 bg-coral text-white border border-ink py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wide">
                    <Trophy size={10} /> {c.gold} G
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty flex flex-col items-center justify-center p-12 text-center bg-white/40 border-2 border-dashed border-ink/20 rounded-2xl">
          <Search size={28} className="text-ink-3 mb-3" />
          <h3 className="font-bold text-ink text-base">No clubs match</h3>
          <p className="text-xs text-ink-3 mt-1">Try a different region or search term.</p>
        </div>
      )}
    </div>
  );
}
