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
      return NextResponse.json({ error: 'Missing athlete ID' }, { status: 400 });
    }

    const swimCount = db.prepare('SELECT COUNT(*) AS count FROM swimming_results WHERE athlete_id = ?').get(id) as { count: number };
    const brokenCount = db.prepare('SELECT COUNT(*) AS count FROM swimming_results WHERE broken_by_athlete_id = ?').get(id) as { count: number };
    const wpCount = db.prepare('SELECT COUNT(*) AS count FROM water_polo_rosters WHERE athlete_id = ?').get(id) as { count: number };

    return NextResponse.json({
      results: swimCount?.count || 0,
      brokenRecords: brokenCount?.count || 0,
      rosters: wpCount?.count || 0,
    });
  } catch (err: any) {
    console.error('Error fetching athlete deletion impact:', err);
    return NextResponse.json({ error: 'Database Query Failed', details: err.message }, { status: 500 });
  }
}
