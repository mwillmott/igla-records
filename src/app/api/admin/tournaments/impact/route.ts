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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing tournament ID' }, { status: 400 });
    }

    const resultsCount = db.prepare('SELECT COUNT(*) AS count FROM swimming_results WHERE tournament_id = ?').get(id) as { count: number };
    const teamsCount = db.prepare('SELECT COUNT(*) AS count FROM water_polo_teams WHERE tournament_id = ?').get(id) as { count: number };
    const historyCount = db.prepare('SELECT COUNT(*) AS count FROM club_tournament_history WHERE tournament_id = ?').get(id) as { count: number };

    return NextResponse.json({
      results: resultsCount?.count || 0,
      teams: teamsCount?.count || 0,
      history: historyCount?.count || 0,
    });
  } catch (err: any) {
    console.error('Error fetching tournament deletion impact:', err);
    return NextResponse.json({ error: 'Database Query Failed', details: err.message }, { status: 500 });
  }
}
