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
    const { tournamentId, exactMatches, newAthletes, resolutions } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'Missing tournament ID' }, { status: 400 });
    }

    // 2. Perform DB Updates in an SQL Transaction
    const transaction = db.transaction(() => {
      let insertCount = 0;
      let newAthletesCount = 0;
      let newRecordsCount = 0;

      const insertAthlete = db.prepare(`
        INSERT INTO athletes (id, name, current_club_id, pronouns, hometown, is_claimed)
        VALUES (?, ?, ?, 'they/them', 'Unknown', 0)
      `);

      const timestamp = new Date().toISOString();

      const insertResult = db.prepare(`
        INSERT INTO swimming_results (
          id, athlete_id, club_id, tournament_id, event, course, age_category, gender_category, time, place,
          is_all_time_record, record_still_held, verified, verified_at, verified_by, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Helper to generate unique ID
      const makeAthleteId = (name: string) => {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
        const rand = Math.random().toString(36).substring(2, 6);
        return `a-${cleanName}-${rand}`;
      };

      // Helper to commit a single result row
      const commitResult = (uploaded: any, resolvedAthleteId: string) => {
        const isRecord = (uploaded.record_broken === 'true' || uploaded.record_broken === '1' || uploaded.record_broken === true) ? 1 : 0;
        const resultId = `s-csv-${Math.random().toString(36).substring(2, 8)}`;
        
        insertResult.run(
          resultId,
          resolvedAthleteId,
          uploaded.club_id,
          tournamentId,
          uploaded.event,
          uploaded.course,
          uploaded.age_category,
          uploaded.gender_category,
          uploaded.time,
          parseInt(uploaded.place) || 1,
          isRecord,
          isRecord, // if it is set as record_broken, it is currently held
          1,
          timestamp,
          session.email,
          session.email
        );

        if (isRecord) {
          newRecordsCount++;
        }
        insertCount++;
      };

      // 1. Commit Exact Matches (automatic)
      for (const item of exactMatches) {
        commitResult(item.uploaded, item.athleteId);
      }

      // 2. Commit Staged New Athletes (automatic)
      for (const item of newAthletes) {
        const newId = makeAthleteId(item.uploaded.athlete_name);
        insertAthlete.run(newId, item.uploaded.athlete_name, item.uploaded.club_id);
        newAthletesCount++;
        commitResult(item.uploaded, newId);
      }

      // 3. Commit Manual Resolutions (fuzzy matches)
      for (const res of resolutions) {
        if (res.action === 'merge' && res.athleteId) {
          commitResult(res.uploaded, res.athleteId);
        } else if (res.action === 'create') {
          const newId = makeAthleteId(res.uploaded.athlete_name);
          insertAthlete.run(newId, res.uploaded.athlete_name, res.uploaded.club_id);
          newAthletesCount++;
          commitResult(res.uploaded, newId);
        }
      }

      // 4. Update Tournaments Table with total records broken
      if (newRecordsCount > 0) {
        db.prepare(`
          UPDATE tournaments 
          SET records = COALESCE(records, 0) + ? 
          WHERE id = ?
        `).run(newRecordsCount, tournamentId);
      }

      return { insertCount, newAthletesCount, newRecordsCount };
    });

    const result = transaction();

    return NextResponse.json({
      success: true,
      message: `Successfully committed ${result.insertCount} results! Created ${result.newAthletesCount} new athletes and registered ${result.newRecordsCount} new all-time records.`,
      result
    });

  } catch (err: any) {
    console.error('Error during database commit transaction:', err);
    return NextResponse.json({ error: 'Database Transaction Failed', details: err.message }, { status: 500 });
  }
}
