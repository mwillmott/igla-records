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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing athlete ID' }, { status: 400 });
    }

    // Perform deletion
    const info = db.prepare('DELETE FROM athletes WHERE id = ?').run(id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting athlete:', err);
    return NextResponse.json({ error: 'Database Deletion Failed', details: err.message }, { status: 500 });
  }
}
