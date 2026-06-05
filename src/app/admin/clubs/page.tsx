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

  // Load all clubs with aggregate historical medal stats
  const clubs = db.prepare(`
    SELECT 
      c.*,
      COALESCE(SUM(h.medals_gold), 0) AS gold,
      COALESCE(SUM(h.medals_silver), 0) AS silver,
      COALESCE(SUM(h.medals_bronze), 0) AS bronze,
      COALESCE(SUM(h.records_set), 0) AS records,
      COUNT(h.club_id) AS tournamentsAttended
    FROM clubs c
    LEFT JOIN club_tournament_history h ON c.id = h.club_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();

  return <ClubsAdminClient clubs={clubs as any[]} />;
}
