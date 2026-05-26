import db from '@/db';
import ResultsClient from './ResultsClient';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
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
      a.id AS athleteId,
      a.name AS athlete,
      c.name AS club,
      c.id AS clubId,
      t.name AS tournament,
      t.flag,
      t.year,
      ab.name AS brokenBy
    FROM swimming_results r
    LEFT JOIN athletes a ON r.athlete_id = a.id
    JOIN clubs c ON r.club_id = c.id
    JOIN tournaments t ON r.tournament_id = t.id
    LEFT JOIN athletes ab ON r.broken_by_athlete_id = ab.id
    WHERE r.is_all_time_record = 1
    ORDER BY r.event ASC, r.age_category ASC, r.gender_category ASC
  `).all();

  // 2. Fetch water polo titles from relational DB
  const waterPoloTitles = db.prepare(`
    SELECT 
      t.id, 
      t.division, 
      trn.year, 
      trn.name AS tournament, 
      trn.flag, 
      t.team_name AS champion, 
      t.club_id AS clubId, 
      t.score,
      (t.final_placement = 1 AND trn.year = 2026) AS held
    FROM water_polo_teams t
    JOIN tournaments trn ON t.tournament_id = trn.id
    WHERE t.final_placement = 1
    ORDER BY trn.year DESC, t.division ASC
  `).all();

  return (
    <ResultsClient 
      swimmingRecords={swimmingRecords as any[]} 
      waterPoloTitles={waterPoloTitles as any[]} 
    />
  );
}
