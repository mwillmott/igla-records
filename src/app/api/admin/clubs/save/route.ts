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
      short_name,
      city,
      country,
      flag,
      region,
      founded_year,
      color,
      tagline,
      website,
      sports,
      members,
      isNew
    } = body;

    // Simple validation
    if (!id || !name || !short_name || !city || !country || !flag || !region || !founded_year || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isNew) {
      // Check if ID already exists
      const existing = db.prepare('SELECT 1 FROM clubs WHERE id = ?').get(id);
      if (existing) {
        return NextResponse.json({ error: `A club with ID "${id}" already exists.` }, { status: 409 });
      }

      // Insert new club
      db.prepare(`
        INSERT INTO clubs (id, name, short_name, city, country, flag, region, founded_year, color, tagline, website, sports, members)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name,
        short_name,
        city,
        country,
        flag,
        region,
        Number(founded_year),
        color,
        tagline || '',
        website || null,
        sports || '',
        Number(members) || 0
      );
    } else {
      // Update existing club
      db.prepare(`
        UPDATE clubs
        SET name = ?, short_name = ?, city = ?, country = ?, flag = ?, region = ?, founded_year = ?, color = ?, tagline = ?, website = ?, sports = ?, members = ?
        WHERE id = ?
      `).run(
        name,
        short_name,
        city,
        country,
        flag,
        region,
        Number(founded_year),
        color,
        tagline || '',
        website || null,
        sports || '',
        Number(members) || 0,
        id
      );
    }

    return NextResponse.json({ success: true, clubId: id });
  } catch (err: any) {
    console.error('Error saving club:', err);
    return NextResponse.json({ error: 'Database Save Failed', details: err.message }, { status: 500 });
  }
}
