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
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    if (type !== 'swimming' && type !== 'wp') {
      return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
    }

    if (type === 'swimming') {
      // Check if result exists
      const existing = db.prepare('SELECT id FROM swimming_results WHERE id = ?').get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Swimming result not found' }, { status: 404 });
      }

      // Delete the result
      db.prepare('DELETE FROM swimming_results WHERE id = ?').run(id);
    } else {
      // Water Polo Team delete
      // Check if team exists
      const existing = db.prepare('SELECT id FROM water_polo_teams WHERE id = ?').get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Water Polo team not found' }, { status: 404 });
      }

      // Delete associated roster players first to respect foreign keys / clean up
      db.prepare('DELETE FROM water_polo_rosters WHERE team_id = ?').run(id);

      // Delete the team
      db.prepare('DELETE FROM water_polo_teams WHERE id = ?').run(id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error during record deletion:', err);
    return NextResponse.json({ error: 'Database Deletion Failed', details: err.message }, { status: 500 });
  }
}
