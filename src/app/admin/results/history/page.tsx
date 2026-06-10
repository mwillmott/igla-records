import { getSession } from '@/lib/auth';
import db from '@/db';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import ResultsAdminClient from '../ResultsAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminClubSummariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
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

  // Parse search parameters
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.q || '';
  const tournamentId = params.tournamentId || 'All';
  const sortField = params.sort || 'tournament';
  const sortDirection = params.dir || 'desc';

  // Load tournaments (for filters/modals)
  const tournaments = db.prepare(`
    SELECT id, name, year FROM tournaments ORDER BY year DESC
  `).all();

  // Load clubs (for filters/modals)
  const clubs = db.prepare(`
    SELECT id, name, flag FROM clubs ORDER BY name ASC
  `).all();

  // Build filters dynamically
  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (search.trim()) {
    conditions.push('(c.name LIKE ? OR t.name LIKE ?)');
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  if (tournamentId !== 'All') {
    conditions.push('h.tournament_id = ?');
    queryParams.push(tournamentId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Handle sorting
  let orderBy = 't.year DESC, c.name ASC';
  const dir = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (sortField === 'tournament') {
    orderBy = `t.year ${dir}, t.name ${dir}`;
  } else if (sortField === 'club') {
    orderBy = `c.name ${dir}`;
  } else if (sortField === 'medals') {
    orderBy = `(h.medals_gold + h.medals_silver + h.medals_bronze) ${dir}`;
  } else if (sortField === 'records') {
    orderBy = `h.records_set ${dir}`;
  }

  const itemsPerPage = 15;

  // Count total matches
  const countQuery = `
    SELECT COUNT(*) AS count 
    FROM club_tournament_history h
    JOIN clubs c ON h.club_id = c.id
    JOIN tournaments t ON h.tournament_id = t.id
    ${whereClause}
  `;
  const totalCountResult = db.prepare(countQuery).get(...queryParams) as { count: number };
  const totalCount = totalCountResult?.count || 0;

  // Query paginated results
  const resultsQuery = `
    SELECT 
      h.club_id AS clubId,
      c.name AS clubName,
      c.flag AS clubFlag,
      h.tournament_id AS tournamentId,
      t.name AS tournamentName,
      t.year AS tournamentYear,
      h.medals_gold AS medalsGold,
      h.medals_silver AS medalsSilver,
      h.medals_bronze AS medalsBronze,
      h.records_set AS recordsSet,
      h.wp_division AS wpDivision,
      h.wp_finish AS wpFinish
    FROM club_tournament_history h
    JOIN clubs c ON h.club_id = c.id
    JOIN tournaments t ON h.tournament_id = t.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const clubHistoryResults = db.prepare(resultsQuery).all(
    ...queryParams,
    itemsPerPage,
    (page - 1) * itemsPerPage
  );

  // Stats calculation
  const statsQuery = `
    SELECT 
      COUNT(*) AS historyCount,
      SUM(h.medals_gold + h.medals_silver + h.medals_bronze) AS totalMedals,
      SUM(h.records_set) AS totalRecords
    FROM club_tournament_history h
    JOIN clubs c ON h.club_id = c.id
    JOIN tournaments t ON h.tournament_id = t.id
    ${whereClause}
  `;
  
  const statsResult = db.prepare(statsQuery).get(...queryParams) as {
    historyCount: number;
    totalMedals: number;
    totalRecords: number;
  };

  const stats = {
    historyCount: statsResult?.historyCount || 0,
    totalMedals: statsResult?.totalMedals || 0,
    totalRecords: statsResult?.totalRecords || 0,
  };

  return (
    <ResultsAdminClient
      mode="history"
      tournaments={tournaments as any[]}
      clubs={clubs as any[]}
      clubHistoryResults={clubHistoryResults as any[]}
      session={session}
      totalCount={totalCount}
      currentPage={page}
      itemsPerPage={itemsPerPage}
      stats={stats}
    />
  );
}
