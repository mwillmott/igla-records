import { getSession } from '@/lib/auth';
import db from '@/db';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import ResultsAdminClient from '../ResultsAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminWaterPoloResultsPage({
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

  // Parse search params
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.q || '';
  const division = params.division || 'All';
  const tournamentId = params.tournamentId || 'All';
  const sortField = params.sort || 'place';
  const sortDirection = params.dir || 'asc';

  // Load tournaments
  const tournaments = db.prepare(`
    SELECT id, name, year FROM tournaments ORDER BY year DESC
  `).all();

  // Load clubs for modals and selection
  const clubs = db.prepare(`
    SELECT id, name, flag FROM clubs ORDER BY name ASC
  `).all();

  // Load distinct divisions for the filter
  const distinctDivisions = db.prepare(`
    SELECT DISTINCT division FROM water_polo_teams ORDER BY division ASC
  `).all() as { division: string }[];
  const divisionOptions = distinctDivisions.map(d => d.division).filter(Boolean);

  // Build filters dynamically
  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (search.trim()) {
    conditions.push('(t.team_name LIKE ? OR t.division LIKE ?)');
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  if (division !== 'All') {
    conditions.push('t.division = ?');
    queryParams.push(division);
  }

  if (tournamentId !== 'All') {
    conditions.push('t.tournament_id = ?');
    queryParams.push(tournamentId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Handle sorting
  let orderBy = 'trn.year DESC, t.division ASC, t.final_placement ASC';
  const dir = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (sortField === 'place' || sortField === 'placement') {
    orderBy = `t.final_placement ${dir}`;
  } else if (sortField === 'teamName') {
    orderBy = `t.team_name ${dir}`;
  } else if (sortField === 'points') {
    orderBy = `t.points ${dir}`;
  }

  const itemsPerPage = 15;

  // Count total matches
  const countQuery = `
    SELECT COUNT(*) AS count
    FROM water_polo_teams t
    JOIN tournaments trn ON t.tournament_id = trn.id
    LEFT JOIN clubs c ON t.club_id = c.id
    ${whereClause}
  `;
  const totalCountResult = db.prepare(countQuery).get(...queryParams) as { count: number };
  const totalCount = totalCountResult?.count || 0;

  // Load water polo team results paginated
  const resultsQuery = `
    SELECT 
      t.id, 
      t.tournament_id AS tournamentId,
      t.division, 
      t.final_placement AS placement,
      trn.year, 
      trn.name AS tournament, 
      trn.flag, 
      t.team_name AS teamName, 
      t.club_id AS clubId, 
      c.name AS clubName,
      (SELECT COUNT(*) FROM water_polo_rosters r WHERE r.team_id = t.id) AS rosterCount,
      t.wins,
      t.losses,
      t.goals_for AS goalsFor,
      t.goals_against AS goalsAgainst,
      t.points,
      t.verified,
      t.verified_at AS verifiedAt,
      t.verified_by AS verifiedBy,
      t.created_by,
      t.created_at,
      t.updated_by,
      t.updated_at
    FROM water_polo_teams t
    JOIN tournaments trn ON t.tournament_id = trn.id
    LEFT JOIN clubs c ON t.club_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  
  const waterPoloResults = db.prepare(resultsQuery).all(
    ...queryParams, 
    itemsPerPage, 
    (page - 1) * itemsPerPage
  );

  // Query stats for the selected tournament (or all)
  const statsQueryTournament = `
    SELECT 
      COUNT(*) AS teamsCount,
      COUNT(DISTINCT t.division) AS divisionsCount,
      SUM(CASE WHEN t.final_placement = 1 THEN 1 ELSE 0 END) AS championsCount
    FROM water_polo_teams t
    ${tournamentId !== 'All' ? 'WHERE t.tournament_id = ?' : ''}
  `;
  const statsResult = db.prepare(statsQueryTournament).get(
    ...(tournamentId !== 'All' ? [tournamentId] : [])
  ) as { teamsCount: number; divisionsCount: number; championsCount: number };

  const stats = {
    teamsCount: statsResult?.teamsCount || 0,
    divisionsCount: statsResult?.divisionsCount || 0,
    championsCount: statsResult?.championsCount || 0,
  };

  return (
    <ResultsAdminClient 
      mode="wp"
      tournaments={tournaments as any[]} 
      athletes={[]}
      clubs={clubs as any[]}
      swimmingResults={[]}
      waterPoloResults={waterPoloResults as any[]}
      session={session}
      totalCount={totalCount}
      currentPage={page}
      itemsPerPage={itemsPerPage}
      stats={stats}
      divisionOptions={divisionOptions}
    />
  );
}
