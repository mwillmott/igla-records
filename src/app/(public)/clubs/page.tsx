import db from '@/db';
import ClubsClient from './ClubsClient';

export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
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

  return <ClubsClient clubs={clubs as any[]} />;
}
