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
    const {
      clubId,
      tournamentId,
      medalsGold,
      medalsSilver,
      medalsBronze,
      recordsSet,
      wpDivision,
      wpFinish
    } = body;

    if (!clubId || !tournamentId) {
      return NextResponse.json({ error: 'Missing clubId or tournamentId' }, { status: 400 });
    }

    // Upsert the record into club_tournament_history
    db.prepare(`
      INSERT INTO club_tournament_history (
        club_id, tournament_id, medals_gold, medals_silver, medals_bronze, records_set, wp_division, wp_finish
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(club_id, tournament_id) DO UPDATE SET
        medals_gold = excluded.medals_gold,
        medals_silver = excluded.medals_silver,
        medals_bronze = excluded.medals_bronze,
        records_set = excluded.records_set,
        wp_division = excluded.wp_division,
        wp_finish = excluded.wp_finish
    `).run(
      clubId,
      tournamentId,
      parseInt(medalsGold, 10) || 0,
      parseInt(medalsSilver, 10) || 0,
      parseInt(medalsBronze, 10) || 0,
      parseInt(recordsSet, 10) || 0,
      wpDivision || null,
      wpFinish !== undefined && wpFinish !== '' && wpFinish !== null ? parseInt(wpFinish, 10) : null
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error saving club tournament history summary:', err);
    return NextResponse.json({ error: 'Database Save Failed', details: err.message }, { status: 500 });
  }
}
