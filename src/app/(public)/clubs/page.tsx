import db from '@/db';
import ClubsClient from './ClubsClient';

export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
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

  return <ClubsClient clubs={clubs as any[]} />;
}
