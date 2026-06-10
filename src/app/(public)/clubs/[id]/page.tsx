import { notFound } from 'next/navigation';
import db from '@/db';
import ClubDetailClient from './ClubDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Fetch club details
  const club = db.prepare(`
    SELECT * FROM clubs WHERE id = ?
  `).get(id) as any;

  if (!club) {
    notFound();
  }

  // 2. Fetch tournament history for this club dynamically
  const history = db.prepare(`
    WITH club_all_tournaments AS (
      SELECT tournament_id FROM club_tournament_history WHERE club_id = :clubId
      UNION
      SELECT tournament_id FROM swimming_results WHERE club_id = :clubId
      UNION
      SELECT tournament_id FROM water_polo_teams WHERE club_id = :clubId
    ),
    dynamic_stats AS (
      SELECT 
        ct.tournament_id,
        COALESCE(s.medals_gold, 0) AS medals_gold,
        COALESCE(s.medals_silver, 0) AS medals_silver,
        COALESCE(s.medals_bronze, 0) AS medals_bronze,
        COALESCE(s.records_set, 0) AS records_set,
        w.wp_division,
        w.wp_finish
      FROM club_all_tournaments ct
      LEFT JOIN (
        SELECT 
          tournament_id,
          SUM(CASE WHEN place = 1 THEN 1 ELSE 0 END) AS medals_gold,
          SUM(CASE WHEN place = 2 THEN 1 ELSE 0 END) AS medals_silver,
          SUM(CASE WHEN place = 3 THEN 1 ELSE 0 END) AS medals_bronze,
          SUM(CASE WHEN is_all_time_record = 1 THEN 1 ELSE 0 END) AS records_set
        FROM swimming_results
        WHERE club_id = :clubId
        GROUP BY tournament_id
      ) s ON ct.tournament_id = s.tournament_id
      LEFT JOIN (
        SELECT 
          tournament_id,
          division AS wp_division,
          final_placement AS wp_finish
        FROM water_polo_teams
        WHERE club_id = :clubId
      ) w ON ct.tournament_id = w.tournament_id
    )
    SELECT 
      :clubId AS club_id,
      ct.tournament_id,
      t.year AS historical_year,
      t.name AS historical_tournament,
      t.flag AS historical_flag,
      (t.status = 'live') AS isLive,
      CASE WHEN h.club_id IS NOT NULL THEN 1 ELSE 0 END AS is_historical_summary,
      COALESCE(h.medals_gold, ds.medals_gold) AS medals_gold,
      COALESCE(h.medals_silver, ds.medals_silver) AS medals_silver,
      COALESCE(h.medals_bronze, ds.medals_bronze) AS medals_bronze,
      COALESCE(h.records_set, ds.records_set) AS records_set,
      COALESCE(h.wp_division, ds.wp_division) AS wp_division,
      COALESCE(h.wp_finish, ds.wp_finish) AS wp_finish
    FROM club_all_tournaments ct
    JOIN tournaments t ON ct.tournament_id = t.id
    LEFT JOIN club_tournament_history h ON ct.tournament_id = h.tournament_id AND h.club_id = :clubId
    LEFT JOIN dynamic_stats ds ON ct.tournament_id = ds.tournament_id
    ORDER BY historical_year DESC
  `).all({ clubId: id }) as any[];

  // 3. If a club has no explicit history entries, load the _default fallback from database
  let historyData = history;
  if (history.length === 0) {
    historyData = db.prepare(`
      SELECT 
        h.club_id,
        h.tournament_id,
        h.medals_gold,
        h.medals_silver,
        h.medals_bronze,
        h.records_set,
        h.wp_division,
        h.wp_finish,
        t.year AS historical_year,
        t.name AS historical_tournament,
        t.flag AS historical_flag,
        (t.status = 'live') AS isLive,
        1 AS is_historical_summary
      FROM club_tournament_history h
      LEFT JOIN tournaments t ON h.tournament_id = t.id
      WHERE h.club_id = '_default'
      ORDER BY t.year DESC
    `).all() as any[];
  }

  return (
    <ClubDetailClient 
      club={club} 
      history={historyData} 
    />
  );
}
