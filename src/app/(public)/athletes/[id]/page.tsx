import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import db from '@/db';
import AthleteProfileClient from './AthleteProfileClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  
  // 1. Fetch athlete base profile
  const athlete = db.prepare(`
    SELECT a.*, c.name AS club_name, c.id AS club_id
    FROM athletes a
    LEFT JOIN clubs c ON a.current_club_id = c.id
    WHERE a.id = ?
  `).get(id) as any;

  if (!athlete) {
    notFound();
  }

  // 2. Fetch all swimming results for this athlete
  const swimResults = db.prepare(`
    SELECT 
      r.id,
      r.event,
      r.course,
      r.age_category AS category,
      r.gender_category AS gender,
      r.time,
      r.place,
      r.is_all_time_record AS record,
      r.record_still_held AS held,
      r.created_by,
      r.created_at,
      r.updated_by,
      r.updated_at,
      t.name AS tournament,
      t.id AS tournament_id,
      t.flag,
      t.year,
      ab.name AS brokenBy,
      ab.id AS brokenById
    FROM swimming_results r
    JOIN tournaments t ON r.tournament_id = t.id
    LEFT JOIN athletes ab ON r.broken_by_athlete_id = ab.id
    WHERE r.athlete_id = ?
    ORDER BY t.year DESC, r.event ASC
  `).all(id) as any[];

  // 3. Fetch all water polo roster spots and finishes for this athlete
  const wpResults = db.prepare(`
    SELECT 
      roster.cap_number AS cap,
      roster.is_captain AS captain,
      team.team_name AS team,
      team.division,
      team.final_placement AS finish,
      t.name AS tournament,
      t.id AS tournament_id,
      t.flag,
      t.year
    FROM water_polo_rosters roster
    JOIN water_polo_teams team ON roster.team_id = team.id
    JOIN tournaments t ON team.tournament_id = t.id
    WHERE roster.athlete_id = ?
    ORDER BY t.year DESC
  `).all(id) as any[];

  // 4. Merge results by Year/Tournament into a unified career timeline
  const timelineMap = new Map<number, {
    year: number;
    tournament: string;
    tournamentId: string;
    flag: string;
    swimming: any[];
    waterPolo: any | null;
  }>();

  // Populate swimming results in timeline
  for (const s of swimResults) {
    if (!timelineMap.has(s.year)) {
      timelineMap.set(s.year, {
        year: s.year,
        tournament: s.tournament,
        tournamentId: s.tournament_id,
        flag: s.flag,
        swimming: [],
        waterPolo: null
      });
    }
    timelineMap.get(s.year)!.swimming.push(s);
  }

  // Populate water polo roster spots in timeline
  for (const w of wpResults) {
    if (!timelineMap.has(w.year)) {
      timelineMap.set(w.year, {
        year: w.year,
        tournament: w.tournament,
        tournamentId: w.tournament_id,
        flag: w.flag,
        swimming: [],
        waterPolo: null
      });
    }
    timelineMap.get(w.year)!.waterPolo = w;
  }

  const timeline = Array.from(timelineMap.values()).sort((a, b) => b.year - a.year);

  // 5. Fetch all athletes for editing dropdown selectors
  const athletes = db.prepare(`
    SELECT id, name FROM athletes ORDER BY name ASC
  `).all();

  return (
    <AthleteProfileClient 
      athlete={athlete} 
      timeline={timeline} 
      athletes={athletes as any[]}
      session={session}
    />
  );
}
