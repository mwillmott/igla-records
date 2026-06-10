import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import db from '@/db';
import ClubsAdminClient from './ClubsAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminClubsPage() {
  const session = await getSession();

  // Security Wall: Deny access to non-admins
  if (!session || session.role !== 'admin') {
    return (
      <div className="view-enter flex flex-col items-center justify-center min-h-[60vh] py-12 select-none">
        <section className="tile tile-lg p-10 max-w-lg text-center bg-white/70 border-2 border-ink shadow-[5px_6px_0_#0d3a52]">
          <div className="mx-auto w-14 h-14 rounded-full bg-coral-pale text-coral-deep flex items-center justify-center mb-6 border-2 border-ink">
            <ShieldAlert size={28} />
          </div>
          <h1 className="font-display text-4xl text-ink font-normal mb-3">Access Denied</h1>
          <p className="text-xs text-ink-3 leading-relaxed mb-6">
            You must be logged in with an official <span className="font-semibold text-coral">@igla.org</span> email address 
            to access the administration panel.
          </p>
          <Link 
            href="/results" 
            className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px]"
          >
            <ArrowLeft size={14} />
            <span>Back to Records</span>
          </Link>
        </section>
      </div>
    );
  }

  // Load all clubs with aggregate historical medal stats dynamically
  const clubs = db.prepare(`
    WITH club_tournaments AS (
      SELECT club_id, tournament_id FROM club_tournament_history
      UNION
      SELECT club_id, tournament_id FROM swimming_results
      UNION
      SELECT club_id, tournament_id FROM water_polo_teams
    ),
    tournament_stats AS (
      SELECT 
        ct.club_id,
        ct.tournament_id,
        COALESCE(h.medals_gold, s.medals_gold, 0) AS gold,
        COALESCE(h.medals_silver, s.medals_silver, 0) AS silver,
        COALESCE(h.medals_bronze, s.medals_bronze, 0) AS bronze,
        COALESCE(h.records_set, s.records, 0) AS records
      FROM club_tournaments ct
      LEFT JOIN club_tournament_history h ON ct.club_id = h.club_id AND ct.tournament_id = h.tournament_id
      LEFT JOIN (
        SELECT 
          club_id,
          tournament_id,
          SUM(CASE WHEN place = 1 THEN 1 ELSE 0 END) AS medals_gold,
          SUM(CASE WHEN place = 2 THEN 1 ELSE 0 END) AS medals_silver,
          SUM(CASE WHEN place = 3 THEN 1 ELSE 0 END) AS medals_bronze,
          SUM(CASE WHEN is_all_time_record = 1 THEN 1 ELSE 0 END) AS records
        FROM swimming_results
        GROUP BY club_id, tournament_id
      ) s ON ct.club_id = s.club_id AND ct.tournament_id = s.tournament_id
    )
    SELECT 
      c.*,
      COALESCE(SUM(ts.gold), 0) AS gold,
      COALESCE(SUM(ts.silver), 0) AS silver,
      COALESCE(SUM(ts.bronze), 0) AS bronze,
      COALESCE(SUM(ts.records), 0) AS records,
      COUNT(ts.tournament_id) AS tournamentsAttended
    FROM clubs c
    LEFT JOIN tournament_stats ts ON c.id = ts.club_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();

  return <ClubsAdminClient clubs={clubs as any[]} />;
}
