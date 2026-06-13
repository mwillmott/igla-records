import { getSession } from '@/lib/auth';
import db from '@/db';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import ResultsAdminClient from '../ResultsAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminSwimmingResultsPage({
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
  const course = params.course || 'All';
  const age = params.age || 'All';
  const gender = params.gender || 'All';
  const record = params.record || 'All';
  const tournamentId = params.tournamentId || 'All';
  const sortField = params.sort || 'event';
  const sortDirection = params.dir || 'asc';

  // Load tournaments
  const tournaments = db.prepare(`
    SELECT id, name, year FROM tournaments ORDER BY year DESC
  `).all();

  // Load athletes for modals
  const athletes = db.prepare(`
    SELECT id, name, current_club_id FROM athletes ORDER BY name ASC
  `).all();

  // Load clubs for modals
  const clubs = db.prepare(`
    SELECT id, name, flag FROM clubs ORDER BY name ASC
  `).all();

  // Load distinct age categories for the filter
  const distinctAges = db.prepare(`
    SELECT DISTINCT age_category FROM swimming_results ORDER BY age_category ASC
  `).all() as { age_category: string }[];
  const ageOptions = distinctAges.map(a => a.age_category).filter(Boolean);

  // Build filters dynamically
  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (search.trim()) {
    conditions.push('(a.name LIKE ? OR r.event LIKE ?)');
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  if (course !== 'All') {
    conditions.push('r.course = ?');
    queryParams.push(course);
  }

  if (age !== 'All') {
    conditions.push('r.age_category = ?');
    queryParams.push(age);
  }

  if (gender !== 'All') {
    conditions.push('r.gender_category = ?');
    queryParams.push(gender);
  }

  if (record !== 'All') {
    conditions.push('r.is_all_time_record = ?');
    queryParams.push(record === 'Yes' || record === 'true' ? 1 : 0);
  }

  if (tournamentId !== 'All') {
    conditions.push('r.tournament_id = ?');
    queryParams.push(tournamentId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Handle sorting
  let orderBy = 'r.event ASC, r.age_category ASC, r.gender_category ASC, r.place ASC';
  const dir = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (sortField === 'place') {
    orderBy = `r.place ${dir}`;
  } else if (sortField === 'event') {
    orderBy = `r.event ${dir}, r.age_category ${dir}, r.gender_category ${dir}`;
  } else if (sortField === 'athlete') {
    orderBy = `a.name ${dir}`;
  } else if (sortField === 'time') {
    orderBy = `r.time ${dir}`;
  }

  const itemsPerPage = 15;

  // Count total matches
  const countQuery = `
    SELECT COUNT(*) AS count 
    FROM swimming_results r
    LEFT JOIN athletes a ON r.athlete_id = a.id
    JOIN clubs c ON r.club_id = c.id
    JOIN tournaments t ON r.tournament_id = t.id
    ${whereClause}
  `;
  const totalCountResult = db.prepare(countQuery).get(...queryParams) as { count: number };
  const totalCount = totalCountResult?.count || 0;

  // Query paginated segment
  const resultsQuery = `
    SELECT 
      r.id, 
      r.event, 
      r.course, 
      r.age_category AS age, 
      r.gender_category AS gender, 
      r.time, 
      r.place,
      r.is_all_time_record,
      r.record_still_held AS held,
      r.verified,
      r.verified_at AS verifiedAt,
      r.verified_by AS verifiedBy,
      r.created_by,
      r.created_at,
      r.updated_by,
      r.updated_at,
      r.tournament_id AS tournamentId,
      a.id AS athleteId,
      a.name AS athlete,
      c.name AS club,
      c.id AS clubId,
      t.name AS tournament,
      t.flag,
      t.year,
      ab.name AS brokenBy,
      ab.id AS brokenById
    FROM swimming_results r
    LEFT JOIN athletes a ON r.athlete_id = a.id
    JOIN clubs c ON r.club_id = c.id
    JOIN tournaments t ON r.tournament_id = t.id
    LEFT JOIN athletes ab ON r.broken_by_athlete_id = ab.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
  
  const swimmingResults = db.prepare(resultsQuery).all(
    ...queryParams, 
    itemsPerPage, 
    (page - 1) * itemsPerPage
  );

  // Query stats for the selected tournament (or all)
  const statsQueryTournament = `
    SELECT 
      COUNT(*) AS resultsCount,
      COUNT(DISTINCT r.athlete_id) AS competitorsCount,
      SUM(CASE WHEN r.is_all_time_record = 1 THEN 1 ELSE 0 END) AS recordsCount
    FROM swimming_results r
    ${tournamentId !== 'All' ? 'WHERE r.tournament_id = ?' : ''}
  `;
  const statsResult = db.prepare(statsQueryTournament).get(
    ...(tournamentId !== 'All' ? [tournamentId] : [])
  ) as { resultsCount: number; competitorsCount: number; recordsCount: number };
  
  const stats = {
    resultsCount: statsResult?.resultsCount || 0,
    competitorsCount: statsResult?.competitorsCount || 0,
    recordsCount: statsResult?.recordsCount || 0,
  };

  return (
    <ResultsAdminClient 
      mode="swimming"
      tournaments={tournaments as any[]} 
      athletes={athletes as any[]}
      clubs={clubs as any[]}
      swimmingResults={swimmingResults as any[]}
      waterPoloResults={[]}
      session={session}
      totalCount={totalCount}
      currentPage={page}
      itemsPerPage={itemsPerPage}
      stats={stats}
      ageOptions={ageOptions}
    />
  );
}
