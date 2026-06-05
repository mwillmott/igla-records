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
      id,
      name,
      type,
      city,
      country,
      flag,
      year,
      start_date,
      end_date,
      status,
      color,
      website,
      venue,
      description,
      participants,
      nations,
      clubs,
      records,
      expected_athletes,
      expected_nations,
      expected_clubs,
      isNew
    } = body;

    // Simple validation for required fields
    if (!id || !name || !type || !city || !country || !flag || !year || !start_date || !end_date || !status || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate type value
    if (!['IGLA+ Championship', 'Gay Games'].includes(type)) {
      return NextResponse.json({ error: 'Invalid tournament type' }, { status: 400 });
    }

    // Validate status value
    if (!['past', 'live', 'upcoming'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Parse and handle numbers or null values
    const parsedYear = Number(year);
    const parsedParticipants = participants !== undefined && participants !== '' ? Number(participants) : null;
    const parsedNations = nations !== undefined && nations !== '' ? Number(nations) : null;
    const parsedClubs = clubs !== undefined && clubs !== '' ? Number(clubs) : null;
    const parsedRecords = records !== undefined && records !== '' ? Number(records) : null;

    const parsedExpectedAthletes = expected_athletes !== undefined && expected_athletes !== '' ? Number(expected_athletes) : null;
    const parsedExpectedNations = expected_nations !== undefined && expected_nations !== '' ? Number(expected_nations) : null;
    const parsedExpectedClubs = expected_clubs !== undefined && expected_clubs !== '' ? Number(expected_clubs) : null;

    if (isNew) {
      // Check if ID already exists
      const existing = db.prepare('SELECT 1 FROM tournaments WHERE id = ?').get(id);
      if (existing) {
        return NextResponse.json({ error: `A tournament with ID "${id}" already exists.` }, { status: 409 });
      }

      // Insert new tournament
      db.prepare(`
        INSERT INTO tournaments (
          id, name, type, city, country, flag, year, start_date, end_date, status, color, website, venue, description,
          participants, nations, clubs, records, expected_athletes, expected_nations, expected_clubs
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name,
        type,
        city,
        country,
        flag,
        parsedYear,
        start_date,
        end_date,
        status,
        color,
        website || null,
        venue || null,
        description || null,
        parsedParticipants,
        parsedNations,
        parsedClubs,
        parsedRecords,
        parsedExpectedAthletes,
        parsedExpectedNations,
        parsedExpectedClubs
      );
    } else {
      // Update existing tournament
      db.prepare(`
        UPDATE tournaments
        SET name = ?, type = ?, city = ?, country = ?, flag = ?, year = ?, start_date = ?, end_date = ?, status = ?, color = ?, website = ?, venue = ?, description = ?,
            participants = ?, nations = ?, clubs = ?, records = ?, expected_athletes = ?, expected_nations = ?, expected_clubs = ?
        WHERE id = ?
      `).run(
        name,
        type,
        city,
        country,
        flag,
        parsedYear,
        start_date,
        end_date,
        status,
        color,
        website || null,
        venue || null,
        description || null,
        parsedParticipants,
        parsedNations,
        parsedClubs,
        parsedRecords,
        parsedExpectedAthletes,
        parsedExpectedNations,
        parsedExpectedClubs,
        id
      );
    }

    return NextResponse.json({ success: true, tournamentId: id });
  } catch (err: any) {
    console.error('Error saving tournament:', err);
    return NextResponse.json({ error: 'Database Save Failed', details: err.message }, { status: 500 });
  }
}
