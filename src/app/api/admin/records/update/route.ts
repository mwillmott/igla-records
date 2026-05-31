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
    const { type, id, fields } = body;

    if (!type || !id || !fields) {
      return NextResponse.json({ error: 'Missing type, id, or fields' }, { status: 400 });
    }

    if (type !== 'swimming' && type !== 'wp') {
      return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    if (type === 'swimming') {
      // Check if result exists
      const existing = db.prepare('SELECT id FROM swimming_results WHERE id = ?').get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Swimming result not found' }, { status: 404 });
      }

      // Update fields
      const {
        event,
        course,
        age_category,
        gender_category,
        time,
        place,
        is_all_time_record,
        record_still_held,
        athlete_id,
        broken_by_athlete_id,
      } = fields;

      db.prepare(`
        UPDATE swimming_results
        SET event = ?,
            course = ?,
            age_category = ?,
            gender_category = ?,
            time = ?,
            place = ?,
            is_all_time_record = ?,
            record_still_held = ?,
            athlete_id = ?,
            broken_by_athlete_id = ?,
            updated_by = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        event,
        course,
        age_category,
        gender_category,
        time,
        parseInt(place) || 1,
        is_all_time_record ? 1 : 0,
        record_still_held ? 1 : 0,
        athlete_id || null,
        broken_by_athlete_id || null,
        session.email,
        timestamp,
        id
      );
    } else {
      // Water Polo Team update
      // Check if team exists
      const existing = db.prepare('SELECT id FROM water_polo_teams WHERE id = ?').get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Water Polo team not found' }, { status: 404 });
      }

      const {
        team_name,
        score,
        division,
        final_placement,
      } = fields;

      db.prepare(`
        UPDATE water_polo_teams
        SET team_name = ?,
            score = ?,
            division = ?,
            final_placement = ?,
            updated_by = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        team_name,
        score || null,
        division,
        parseInt(final_placement) || 1,
        session.email,
        timestamp,
        id
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error during record update:', err);
    return NextResponse.json({ error: 'Database Update Failed', details: err.message }, { status: 500 });
  }
}
