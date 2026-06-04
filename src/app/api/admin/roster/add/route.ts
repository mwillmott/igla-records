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
    const { teamId, athleteId, isNewAthlete, newAthleteName, capNumber, isCaptain, email, clubId } = body;

    if (!teamId || capNumber === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isNewAthlete && !newAthleteName) {
      return NextResponse.json({ error: 'New athlete name is required' }, { status: 400 });
    }

    if (!isNewAthlete && !athleteId) {
      return NextResponse.json({ error: 'Athlete selection is required' }, { status: 400 });
    }

    // Check if team exists
    const teamExists = db.prepare('SELECT 1 FROM water_polo_teams WHERE id = ?').get(teamId);
    if (!teamExists) {
      return NextResponse.json({ error: 'Water polo team not found' }, { status: 404 });
    }

    // Run database operations in transaction
    const transaction = db.transaction(() => {
      let finalAthleteId = athleteId;
      let finalAthleteName = '';

      if (isNewAthlete) {
        const cleanName = newAthleteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
        const rand = Math.random().toString(36).substring(2, 6);
        finalAthleteId = `a-${cleanName}-${rand}`;
        finalAthleteName = newAthleteName;

        db.prepare(`
          INSERT INTO athletes (id, name, current_club_id, pronouns, hometown, is_claimed, email)
          VALUES (?, ?, ?, 'they/them', 'Unknown', 0, ?)
        `).run(finalAthleteId, newAthleteName, clubId || null, email || null);
      } else {
        // Fetch athlete to ensure they exist and get their name
        const athlete = db.prepare('SELECT name FROM athletes WHERE id = ?').get(athleteId) as { name: string } | undefined;
        if (!athlete) {
          throw new Error('Athlete not found');
        }
        finalAthleteName = athlete.name;
      }

      // Check if athlete is already on the roster
      const alreadyOnRoster = db.prepare('SELECT 1 FROM water_polo_rosters WHERE team_id = ? AND athlete_id = ?').get(teamId, finalAthleteId);
      if (alreadyOnRoster) {
        throw new Error('Athlete is already on this roster');
      }

      // Insert roster entry
      db.prepare(`
        INSERT INTO water_polo_rosters (team_id, athlete_id, cap_number, is_captain)
        VALUES (?, ?, ?, ?)
      `).run(teamId, finalAthleteId, parseInt(capNumber) || 0, isCaptain ? 1 : 0);

      return { finalAthleteId, finalAthleteName };
    });

    try {
      const result = transaction();
      return NextResponse.json({
        success: true,
        athleteId: result.finalAthleteId,
        athleteName: result.finalAthleteName
      });
    } catch (txErr: any) {
      return NextResponse.json({ error: txErr.message }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error adding roster player:', err);
    return NextResponse.json({ error: 'Database Add Failed', details: err.message }, { status: 500 });
  }
}
