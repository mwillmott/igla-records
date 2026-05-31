import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import db from '@/db';
import TournamentDetailClient from './TournamentDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TournamentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const initialSport = sParams?.sport === 'wp' ? 'wp' : 'swimming';
  const session = await getSession();
  
  // 1. Fetch tournament details
  const tournament = db.prepare(`
    SELECT * FROM tournaments WHERE id = ?
  `).get(id) as any;

  if (!tournament) {
    notFound();
  }

  // Only Valencia 2026 has full mock data seeded in this build.
  // For others, the client will show the friendly Results Archive stub.
  const hasData = id === 'valencia-2026';
  
  let swimmingResults: any[] = [];
  let waterPoloDivisions: any[] = [];

  if (hasData) {
    // 2. Fetch swimming results
    swimmingResults = db.prepare(`
      SELECT 
        r.id, 
        r.event, 
        r.course, 
        r.age_category AS age, 
        r.gender_category AS gender, 
        r.time, 
        r.place,
        r.is_all_time_record AS record,
        r.record_still_held AS held,
        r.created_by,
        r.created_at,
        r.updated_by,
        r.updated_at,
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
      WHERE r.tournament_id = ?
      ORDER BY r.event ASC, r.age_category ASC, r.gender_category ASC, r.place ASC
    `).all(id);

    // 3. Fetch water polo standings and build divisions structures
    const wpTeams = db.prepare(`
      SELECT * FROM water_polo_teams 
      WHERE tournament_id = ? 
      ORDER BY division ASC, final_placement ASC
    `).all(id) as any[];

    const divisionsMap = new Map<string, { id: string; name: string; subtitle: string; standings: any[] }>();
    
    // Divisions Metadata (from data.js)
    const divisionMeta: Record<string, { name: string; subtitle: string }> = {
      'A': { name: 'Division A', subtitle: 'Championship Division' },
      'B': { name: 'Division B', subtitle: 'Competitive Division' },
      'C': { name: 'Division C', subtitle: 'Recreational Division' },
    };

    for (const team of wpTeams) {
      const divLetter = team.division;
      if (!divisionsMap.has(divLetter)) {
        divisionsMap.set(divLetter, {
          id: divLetter,
          name: divisionMeta[divLetter]?.name || `Division ${divLetter}`,
          subtitle: divisionMeta[divLetter]?.subtitle || '',
          standings: [],
        });
      }

      // Fetch Roster members for this team
      const roster = db.prepare(`
        SELECT 
          r.athlete_id AS athleteId, 
          a.name, 
          r.role, 
          r.cap_number AS cap, 
          r.is_captain AS captain
        FROM water_polo_rosters r
        JOIN athletes a ON r.athlete_id = a.id
        WHERE r.team_id = ?
        ORDER BY r.is_captain DESC, r.cap_number ASC
      `).all(team.id);

      divisionsMap.get(divLetter)!.standings.push({
        place: team.final_placement,
        teamId: team.id,
        team: team.team_name,
        wins: team.wins,
        losses: team.losses,
        goalsFor: team.goals_for,
        goalsAgainst: team.goals_against,
        points: team.points,
        roster: roster as any[],
      });
    }

    waterPoloDivisions = Array.from(divisionsMap.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  // 4. Fetch all athletes for editing dropdown selectors
  const athletes = db.prepare(`
    SELECT id, name FROM athletes ORDER BY name ASC
  `).all();

  return (
    <TournamentDetailClient
      tournament={tournament}
      hasData={hasData}
      swimmingResults={swimmingResults}
      waterPoloDivisions={waterPoloDivisions}
      athletes={athletes as any[]}
      session={session}
      initialSport={initialSport}
    />
  );
}
