import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/db';
import Papa from 'papaparse';

// Levenshtein Distance calculation for fuzzy matching
function getSimilarity(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 1.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  const dist = matrix[len1][len2];
  return 1.0 - dist / maxLen;
}

export async function POST(request: Request) {
  // 1. Authorization Check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tournamentId = formData.get('tournamentId') as string || 'valencia-2026';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const csvText = await file.text();
    
    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as any[];
    
    // Retrieve all existing athletes from DB
    const dbAthletes = db.prepare(`
      SELECT a.*, c.name AS club_name 
      FROM athletes a
      LEFT JOIN clubs c ON a.current_club_id = c.id
    `).all() as any[];

    const exactMatches: any[] = [];
    const newAthletes: any[] = [];
    const fuzzyConflicts: any[] = [];

    // Process each row
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const athleteName = (row.athlete_name || '').trim();
      const clubId = (row.club_id || '').trim();
      
      if (!athleteName) continue;

      // 1. Search for Exact Case-Insensitive Match
      const exactMatch = dbAthletes.find(
        a => a.name.toLowerCase() === athleteName.toLowerCase()
      );

      if (exactMatch) {
        exactMatches.push({
          rowId: idx,
          uploaded: row,
          athleteId: exactMatch.id,
          athleteName: exactMatch.name
        });
        continue;
      }

      // 2. Perform Levenshtein Fuzzy Search
      const candidates: any[] = [];
      for (const dbAthlete of dbAthletes) {
        const similarity = getSimilarity(athleteName, dbAthlete.name);
        
        if (similarity >= 0.70) {
          candidates.push({
            id: dbAthlete.id,
            name: dbAthlete.name,
            club_name: dbAthlete.club_name,
            hometown: dbAthlete.hometown,
            pronouns: dbAthlete.pronouns,
            similarity: Math.round(similarity * 100)
          });
        }
      }

      // Sort candidates by similarity descending
      candidates.sort((a, b) => b.similarity - a.similarity);

      if (candidates.length > 0) {
        // Flag Fuzzy Match Conflict
        fuzzyConflicts.push({
          rowId: idx,
          uploaded: row,
          candidates: candidates.slice(0, 3) // Return top 3 candidates
        });
      } else {
        // Staged as a brand new Athlete
        newAthletes.push({
          rowId: idx,
          uploaded: row
        });
      }
    }

    return NextResponse.json({
      success: true,
      tournamentId,
      exactMatches,
      newAthletes,
      fuzzyConflicts
    });

  } catch (err: any) {
    console.error('Error during CSV upload handling:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
