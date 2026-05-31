import { getSession } from '@/lib/auth';
import db from '@/db';
import ResultsClient from './ResultsClient';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const session = await getSession();

  // 1. Fetch swimming records from relational DB
  const swimmingRecords = db.prepare(`
    SELECT 
      r.id, 
      r.event, 
      r.course, 
      r.age_category AS age, 
      r.gender_category AS gender, 
      r.time, 
      r.place,
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
    WHERE r.is_all_time_record = 1
    ORDER BY r.event ASC, r.age_category ASC, r.gender_category ASC
  `).all();

  // 2. Fetch all water polo team results from relational DB
  const waterPoloResults = db.prepare(`
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
      t.score,
      t.created_by,
      t.created_at,
      t.updated_by,
      t.updated_at,
      (t.final_placement = 1 AND trn.year = 2026) AS held
    FROM water_polo_teams t
    JOIN tournaments trn ON t.tournament_id = trn.id
    LEFT JOIN clubs c ON t.club_id = c.id
    ORDER BY trn.year DESC, t.division ASC, t.final_placement ASC
  `).all();

  // 3. Fetch all athletes for editing dropdown selectors
  const athletes = db.prepare(`
    SELECT id, name FROM athletes ORDER BY name ASC
  `).all();

  return (
    <ResultsClient 
      swimmingRecords={swimmingRecords as any[]} 
      waterPoloResults={waterPoloResults as any[]} 
      athletes={athletes as any[]}
      session={session}
    />
  );
}
