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

  // 2. Fetch tournament history for this club
  const history = db.prepare(`
    SELECT 
      h.*,
      t.status = 'live' AS isLive
    FROM club_tournament_history h
    LEFT JOIN tournaments t ON h.tournament_id = t.id
    WHERE h.club_id = ?
    ORDER BY h.historical_year DESC
  `).all(id) as any[];

  // 3. If a club has no explicit history entries, load the _default fallback from database
  let historyData = history;
  if (history.length === 0) {
    historyData = db.prepare(`
      SELECT 
        h.*,
        t.status = 'live' AS isLive
      FROM club_tournament_history h
      LEFT JOIN tournaments t ON h.tournament_id = t.id
      WHERE h.club_id = '_default'
      ORDER BY h.historical_year DESC
    `).all() as any[];
  }

  return (
    <ClubDetailClient 
      club={club} 
      history={historyData} 
    />
  );
}
