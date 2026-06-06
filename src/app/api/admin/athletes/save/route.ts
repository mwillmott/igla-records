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
      current_club_id,
      pronouns,
      hometown,
      is_claimed,
      email,
      isNew
    } = body;

    // Simple validation
    if (!id || !name) {
      return NextResponse.json({ error: 'Missing required fields (ID, Name)' }, { status: 400 });
    }

    const clubIdVal = current_club_id && current_club_id !== '' ? current_club_id : null;
    const isClaimedVal = is_claimed ? 1 : 0;
    const emailVal = email && email.trim() !== '' ? email.trim() : null;

    // Verify email format and uniqueness if provided
    if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
      }

      // Check if email already registered to someone else
      const existingEmail = db.prepare('SELECT name, id FROM athletes WHERE email = ? AND id != ?').get(emailVal, id);
      if (existingEmail) {
        return NextResponse.json({ 
          error: `The email "${emailVal}" is already registered to another athlete: "${(existingEmail as any).name}".` 
        }, { status: 409 });
      }
    }

    // Verify club exists if provided
    if (clubIdVal) {
      const existingClub = db.prepare('SELECT 1 FROM clubs WHERE id = ?').get(clubIdVal);
      if (!existingClub) {
        return NextResponse.json({ error: 'Selected club does not exist.' }, { status: 400 });
      }
    }

    if (isNew) {
      // Check if ID already exists
      const existing = db.prepare('SELECT 1 FROM athletes WHERE id = ?').get(id);
      if (existing) {
        return NextResponse.json({ error: `An athlete with ID "${id}" already exists.` }, { status: 409 });
      }

      // Insert new athlete
      db.prepare(`
        INSERT INTO athletes (id, name, current_club_id, pronouns, hometown, is_claimed, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name.trim(),
        clubIdVal,
        pronouns ? pronouns.trim() : '',
        hometown ? hometown.trim() : '',
        isClaimedVal,
        emailVal
      );
    } else {
      // Update existing athlete
      db.prepare(`
        UPDATE athletes
        SET name = ?, current_club_id = ?, pronouns = ?, hometown = ?, is_claimed = ?, email = ?
        WHERE id = ?
      `).run(
        name.trim(),
        clubIdVal,
        pronouns ? pronouns.trim() : '',
        hometown ? hometown.trim() : '',
        isClaimedVal,
        emailVal,
        id
      );
    }

    return NextResponse.json({ success: true, athleteId: id });
  } catch (err: any) {
    console.error('Error saving athlete:', err);
    return NextResponse.json({ error: 'Database Save Failed', details: err.message }, { status: 500 });
  }
}
