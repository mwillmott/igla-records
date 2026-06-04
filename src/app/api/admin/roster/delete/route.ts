import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/db';

export async function POST(request: Request) {
  // 1. Authorization Check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { teamId, athleteId } = body;

    if (!teamId || !athleteId) {
      return NextResponse.json({ error: 'Missing teamId or athleteId' }, { status: 400 });
    }

    // Check if roster entry exists
    const existing = db.prepare('SELECT 1 FROM water_polo_rosters WHERE team_id = ? AND athlete_id = ?').get(teamId, athleteId);
    if (!existing) {
      return NextResponse.json({ error: 'Roster entry not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM water_polo_rosters WHERE team_id = ? AND athlete_id = ?').run(teamId, athleteId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting roster player:', err);
    return NextResponse.json({ error: 'Database Deletion Failed', details: err.message }, { status: 500 });
  }
}
