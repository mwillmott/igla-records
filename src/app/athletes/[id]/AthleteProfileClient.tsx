'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Waves, Target, Sparkles, Hash, MapPin, Calendar, CheckCircle, UserPlus, Share, ArrowLeft } from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  club_name: string;
  club_id: string;
  pronouns: string;
  hometown: string;
  is_claimed: number;
  email: string | null;
}

interface SwimTimelineEntry {
  id: string;
  event: string;
  course: 'LCM' | 'SCM';
  category: string;
  time: string;
  place: number;
  record: number;
}

interface WPTimelineEntry {
  role: string;
  cap: number;
  captain: number;
  team: string;
  division: string;
  finish: number;
}

interface TimelineEntry {
  year: number;
  tournament: string;
  tournamentId: string;
  flag: string;
  swimming: SwimTimelineEntry[];
  waterPolo: WPTimelineEntry | null;
}

interface AthleteProfileClientProps {
  athlete: Athlete;
  timeline: TimelineEntry[];
}

function placeSuffix(p: number): string {
  const j = p % 10, k = p % 100;
  if (k >= 11 && k <= 13) return 'th';
  if (j === 1) return 'st';
  if (j === 2) return 'nd';
  if (j === 3) return 'rd';
  return 'th';
}

export default function AthleteProfileClient({ athlete, timeline }: AthleteProfileClientProps) {
  const [claimed, setClaimed] = useState(athlete.is_claimed === 1);
  const [shareText, setShareText] = useState('Share');

  // Claim Profile Click simulation
  const handleClaim = () => {
    setClaimed(true);
    // Optional alert notification
    alert(`Success! You have verified and claimed the profile for ${athlete.name}.`);
  };

  // Share profile Link Copy
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    }
  };

  // KPI Calculations
  const totalEvents = useMemo(() => {
    return timeline.reduce((sum, t) => sum + t.swimming.length + (t.waterPolo ? 1 : 0), 0);
  }, [timeline]);

  const totalRecords = useMemo(() => {
    return timeline.reduce((sum, t) => sum + t.swimming.filter(e => e.record === 1).length, 0);
  }, [timeline]);

  const totalGold = useMemo(() => {
    return timeline.reduce(
      (sum, t) =>
        sum +
        t.swimming.filter(e => e.place === 1).length +
        (t.waterPolo && t.waterPolo.finish === 1 ? 1 : 0),
      0
    );
  }, [timeline]);

  // First joined year
  const joinedYear = useMemo(() => {
    if (timeline.length === 0) return 2026;
    return timeline[timeline.length - 1].year;
  }, [timeline]);

  return (
    <div className="view-enter" data-screen-label={`Athlete · ${athlete.name}`}>
      {/* Breadcrumbs */}
      <div className="breadcrumb select-none mb-4">
        <Link href="/results" className="flex items-center gap-1 w-fit">
          <ArrowLeft size={13} />
          <span>Back to records</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <section className="tile tile-lg hero tile-depth-aqua mb-6">
        <span className="eyebrow eyebrow-on-dark mb-4">
          ● Athlete profile
        </span>
        <h1 className="display font-normal text-white leading-none my-4" style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>
          {athlete.name}
        </h1>
        
        <div className="profile-meta flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-white/90">
          <span className="profile-meta-item flex items-center gap-1.5">
            <Hash size={14} /> 
            {athlete.club_id ? (
              <Link href={`/clubs/${athlete.club_id}`} className="text-white font-semibold hover:underline">
                {athlete.club_name}
              </Link>
            ) : (
              <span>{athlete.club_name}</span>
            )}
          </span>
          <span className="profile-meta-item flex items-center gap-1.5">
            <MapPin size={14} /> <span>{athlete.hometown}</span>
          </span>
          <span className="profile-meta-item flex items-center gap-1.5">
            <Calendar size={14} /> <span>First competed in {joinedYear}</span>
          </span>
          {athlete.pronouns && (
            <span className="profile-meta-item opacity-75">{athlete.pronouns}</span>
          )}
        </div>

        {/* Claim & Share Action Bar */}
        <div className="flex gap-2.5 mt-6 select-none">
          {claimed ? (
            <span className="btn success py-2 px-4 rounded-xl flex items-center gap-1.5 bg-emerald-500 border-2 border-ink text-white font-bold text-xs shadow-[2px_3px_0_#0d3a52]">
              <CheckCircle size={13} /> Profile claimed
            </span>
          ) : (
            <button 
              onClick={handleClaim}
              className="btn py-2 px-4 rounded-xl flex items-center gap-1.5 bg-white hover:bg-aqua-pale border-2 border-ink text-ink font-bold text-xs shadow-[2px_3px_0_#0d3a52] active:translate-y-[1px] active:shadow-[1px_2px_0_#0d3a52] cursor-pointer"
            >
              <UserPlus size={13} /> Claim this profile
            </button>
          )}
          <button 
            onClick={handleShare}
            className="btn py-2 px-4 rounded-xl flex items-center gap-1.5 bg-white hover:bg-aqua-pale border-2 border-ink text-ink font-bold text-xs shadow-[2px_3px_0_#0d3a52] active:translate-y-[1px] active:shadow-[1px_2px_0_#0d3a52] cursor-pointer"
          >
            <Share size={13} /> {shareText}
          </button>
        </div>
      </section>

      {/* Athlete Stats Strip */}
      <div className="stat-strip mb-8">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{timeline.length}</div>
          <div className="stat-tile-key text-ink-3">Championships</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{totalEvents}</div>
          <div className="stat-tile-key text-ink-3">Events competed</div>
        </div>
        <div className="stat-tile select-none" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
          <div className="stat-tile-val font-mono tabular-nums">{totalGold}</div>
          <div className="stat-tile-key font-bold text-ink/75">Gold finishes</div>
        </div>
        <div className="stat-tile coral select-none">
          <div className="stat-tile-val font-mono text-white tabular-nums">{totalRecords}</div>
          <div className="stat-tile-key text-white/90">All-time records</div>
        </div>
      </div>

      {/* Career Timeline Section Head */}
      <div className="section-head mb-6 mt-10 select-none">
        <div>
          <h2 className="display display-3 font-normal text-ink">Career timeline</h2>
          <div className="sub text-xs text-ink-3 mt-1.5 leading-snug">
            Every IGLA+ Championship {athlete.name.split(' ')[0]} has competed in.
          </div>
        </div>
        <span className="section-label text-[10px] font-bold tracking-wider text-ink-3 uppercase">Most recent first</span>
      </div>

      {/* Timeline Rows List */}
      <div className="timeline">
        {timeline.map((entry, idx) => (
          <div key={idx} className={`timeline-row flex flex-col gap-5 ${idx === 0 ? 'recent' : ''}`}>
            {/* Top Header Row for the Tournament block */}
            <div className="tl-header flex items-center justify-between border-b-2 border-ink pb-2.5 mb-1 select-none">
              <div className="flex items-center gap-3">
                <span className={`tl-year font-display text-4xl leading-none tabular-nums ${idx === 0 ? 'text-coral' : 'text-ink'}`}>{entry.year}</span>
                <span style={{ fontSize: 18, letterSpacing: 0 }}>{entry.flag}</span>
                <Link 
                  href={`/tournaments/${entry.tournamentId}`} 
                  className="font-bold text-ink hover:text-coral hover:underline transition-colors text-sm"
                >
                  {entry.tournament}
                </Link>
              </div>
              <Link 
                href={`/tournaments/${entry.tournamentId}`} 
                className="section-label text-[9px] font-bold tracking-wider text-ink-3 uppercase hover:text-coral transition-colors flex items-center gap-1 group"
              >
                <span>View results</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            {/* Timeline Results Blocks */}
            <div className="tl-body">
              {/* Swimming Block */}
              {entry.swimming.length > 0 && (
                <div>
                  <div className="tl-block-head select-none">
                    <span className="ic"><Waves size={12} /></span>
                    Swimming · {entry.swimming.length} event{entry.swimming.length !== 1 ? 's' : ''}
                  </div>
                  
                  {entry.swimming.map((e, j) => (
                    <div key={j} className="tl-event">
                      <div>
                        <div className="ev-name text-ink">{e.event}</div>
                        <div className="ev-cat text-[11px] text-ink-3 mt-0.5">{e.category}</div>
                      </div>
                      
                      <span className="ev-time text-ink font-medium">{e.time}</span>
                      
                      <span className={`place-badge select-none ${
                        e.place === 1 ? 'place-1' : e.place === 2 ? 'place-2' : e.place === 3 ? 'place-3' : 'place-other'
                      }`}>
                        {e.place}
                      </span>
                      
                      <div style={{ minWidth: 84, textAlign: 'right' }} className="select-none">
                        {e.record === 1 ? (
                          <span className="status-pill live" style={{ fontSize: 9 }}>
                            <Sparkles size={10} /> Record
                          </span>
                        ) : (
                          <span style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
                            {e.place}{placeSuffix(e.place)} place
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Water Polo Block */}
              {entry.waterPolo && (
                <div>
                  <div className="tl-block-head wp select-none">
                    <span className="ic"><Target size={12} /></span>
                    Water polo · Division {entry.waterPolo.division}
                  </div>
                  
                  <div className="wp-row">
                    <div>
                      <div className="wp-team font-bold text-ink flex items-center gap-1.5">
                        <span>{entry.waterPolo.team}</span>
                        {entry.waterPolo.finish === 1 && (
                          <span className="inline-flex items-center gap-0.5 bg-coral border border-ink text-white font-bold rounded-full py-0.5 px-1.5 text-[8px] uppercase select-none">
                            🏆 Champion
                          </span>
                        )}
                      </div>
                      <div className="wp-role text-[11px] text-ink-3 mt-0.5">
                        {entry.waterPolo.role} {entry.waterPolo.captain === 1 ? '· Team Captain' : ''}
                      </div>
                    </div>
                    
                    <span className={`place-badge select-none ${
                      entry.waterPolo.finish === 1 ? 'place-1' : entry.waterPolo.finish === 2 ? 'place-2' : entry.waterPolo.finish === 3 ? 'place-3' : 'place-other'
                    }`}>
                      {entry.waterPolo.finish}
                    </span>
                    
                    <span className="wp-finish tab-nums select-none">
                      {entry.waterPolo.finish}{placeSuffix(entry.waterPolo.finish)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
