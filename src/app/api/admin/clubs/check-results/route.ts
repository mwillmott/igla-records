import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/db';

export async function GET(request: Request) {
  // Authorization Check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const tournamentId = searchParams.get('tournamentId');

    if (!clubId || !tournamentId) {
      return NextResponse.json({ error: 'Missing clubId or tournamentId' }, { status: 400 });
    }

    // Check if club has swimming results for this tournament
    const hasSwimResults = db.prepare(`
      SELECT 1 FROM swimming_results 
      WHERE club_id = ? AND tournament_id = ? 
      LIMIT 1
    `).get(clubId, tournamentId);

    // Check if club has water polo teams/standings for this tournament
    const hasWpResults = db.prepare(`
      SELECT 1 FROM water_polo_teams 
      WHERE club_id = ? AND tournament_id = ? 
      LIMIT 1
    `).get(clubId, tournamentId);

    const hasResults = !!(hasSwimResults || hasWpResults);

    // Also fetch if there is an existing club_tournament_history summary record
    const existingRecord = db.prepare(`
      SELECT medals_gold, medals_silver, medals_bronze, records_set, wp_division, wp_finish
      FROM club_tournament_history
      WHERE club_id = ? AND tournament_id = ?
    `).get(clubId, tournamentId);

    return NextResponse.json({
      hasResults,
      existingRecord: existingRecord || null
    });
  } catch (err: any) {
    console.error('Error checking results:', err);
    return NextResponse.json({ error: 'Database check failed', details: err.message }, { status: 500 });
  }
}
