import db from '@/db';
import TournamentsClient from './TournamentsClient';

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  const tournaments = db.prepare(`
    SELECT * FROM tournaments ORDER BY year DESC
  `).all();

  return <TournamentsClient tournaments={tournaments as any[]} />;
}
