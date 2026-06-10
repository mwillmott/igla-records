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
    const { type, tournamentId, fields } = body;

    if (!type || !tournamentId || !fields) {
      return NextResponse.json({ error: 'Missing type, tournamentId, or fields' }, { status: 400 });
    }

    if (type !== 'swimming' && type !== 'wp') {
      return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const result = db.transaction(() => {
      if (type === 'swimming') {
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
          club_id,
          broken_by_athlete_id,
        } = fields;

        // Validation for required fields in swimming
        if (!event || !course || !age_category || !gender_category || !time || !place || !club_id) {
          throw new Error('Missing required swimming fields');
        }

        const isRecord = is_all_time_record ? 1 : 0;
        const resultId = `s-admin-${Math.random().toString(36).substring(2, 8)}`;

        db.prepare(`
          INSERT INTO swimming_results (
            id, athlete_id, club_id, tournament_id, event, course, age_category,
            gender_category, time, place, is_all_time_record, record_still_held,
            broken_by_athlete_id, created_by, created_at, updated_by, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          resultId,
          athlete_id || null,
          club_id,
          tournamentId,
          event,
          course,
          age_category,
          gender_category,
          time,
          parseInt(place) || 1,
          isRecord,
          record_still_held ? 1 : 0,
          broken_by_athlete_id || null,
          session.email,
          timestamp,
          session.email,
          timestamp
        );

        // Update overall Tournament record count
        if (isRecord) {
          db.prepare(`
            UPDATE tournaments 
            SET records = COALESCE(records, 0) + 1 
            WHERE id = ?
          `).run(tournamentId);
        }

        return { id: resultId };
      } else {
        // Water Polo Team Standing creation
        const {
          team_name,
          club_id,
          division,
          final_placement,
          wins,
          losses,
          goals_for,
          goals_against,
          points,
        } = fields;

        if (!team_name || !club_id || !division || !final_placement) {
          throw new Error('Missing required water polo fields');
        }

        const teamId = `wp-admin-${Math.random().toString(36).substring(2, 8)}`;

        db.prepare(`
          INSERT INTO water_polo_teams (
            id, tournament_id, club_id, division, final_placement, team_name,
            wins, losses, goals_for, goals_against, points,
            created_by, created_at, updated_by, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          teamId,
          tournamentId,
          club_id,
          division,
          parseInt(final_placement) || 1,
          team_name,
          wins !== undefined && wins !== '' && wins !== null ? parseInt(wins) : null,
          losses !== undefined && losses !== '' && losses !== null ? parseInt(losses) : null,
          goals_for !== undefined && goals_for !== '' && goals_for !== null ? parseInt(goals_for) : null,
          goals_against !== undefined && goals_against !== '' && goals_against !== null ? parseInt(goals_against) : null,
          points !== undefined && points !== '' && points !== null ? parseInt(points) : null,
          session.email,
          timestamp,
          session.email,
          timestamp
        );

        return { id: teamId };
      }
    })();

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error during record creation:', err);
    return NextResponse.json({ error: 'Database Insertion Failed', details: err.message }, { status: 500 });
  }
}
