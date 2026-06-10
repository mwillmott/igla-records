import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/db';

export async function POST(request: Request) {
  // Authorization Check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clubId, tournamentId } = body;

    if (!clubId || !tournamentId) {
      return NextResponse.json({ error: 'Missing clubId or tournamentId' }, { status: 400 });
    }

    // Check if the record exists
    const existing = db.prepare(`
      SELECT 1 FROM club_tournament_history 
      WHERE club_id = ? AND tournament_id = ?
    `).get(clubId, tournamentId);

    if (!existing) {
      return NextResponse.json({ error: 'Club history summary record not found' }, { status: 404 });
    }

    // Delete the record
    db.prepare(`
      DELETE FROM club_tournament_history 
      WHERE club_id = ? AND tournament_id = ?
    `).run(clubId, tournamentId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting club tournament history summary:', err);
    return NextResponse.json({ error: 'Database Deletion Failed', details: err.message }, { status: 500 });
  }
}
