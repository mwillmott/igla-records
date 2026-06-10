// Seeding script for IGLA+ Records Relational Database
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- Starting Database Seeding ---');

// 1. Initialize SQLite Database
const dbPath = path.join(__dirname, '../igla.db');
console.log(`Database File: ${dbPath}`);

// If db already exists, delete it for a clean start
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted existing igla.db for a clean seed.');
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// 2. Read and run DDL Schema
const ddl = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
db.exec(ddl);
console.log('DDL Schema executed successfully.');

// 3. Load Handoff Mock Data using vm Sandbox
const runMockFile = (filePath, context) => {
  const code = fs.readFileSync(path.join(__dirname, '../', filePath), 'utf8');
  vm.runInNewContext(code, context);
};

const sandbox = { window: {} };
runMockFile('design-handoff/data-clubs-tournaments.js', sandbox);
runMockFile('design-handoff/data-records.js', sandbox);
runMockFile('design-handoff/data.js', sandbox);

const IGLA_CLUBS = sandbox.window.IGLA_CLUBS;
const IGLA_TOURNAMENTS = sandbox.window.IGLA_TOURNAMENTS;
const IGLA_RECORDS = sandbox.window.IGLA_RECORDS;
const IGLA_CLUB_HISTORY = sandbox.window.IGLA_CLUB_HISTORY;
const IGLA_DATA = sandbox.window.IGLA_DATA;

console.log(`Loaded mock data from handoff:
  - Clubs: ${IGLA_CLUBS.length}
  - Tournaments: ${IGLA_TOURNAMENTS.length}
  - Records: Swim(${IGLA_RECORDS.swimming.length}), WP(${IGLA_RECORDS.waterPolo.length})
  - Valencia Swim Results: ${IGLA_DATA.swimming.length}
`);

// Helper to resolve tournament IDs
const getTournamentId = (name, year) => {
  const n = name.toLowerCase();
  if (n.includes('valencia') || year === 2026) return 'valencia-2026';
  if ((n.includes('washington') || n.includes('dc')) && year === 2025) return 'dc-2025';
  if (n.includes('buenos') || year === 2024) return 'buenosaires-2024';
  if (n.includes('london') || year === 2023) return 'london-2023';
  if (n.includes('palm') && year === 2022) return 'palmsprings-2022';
  if (n.includes('palm') && year === 2025) return 'palmsprings-2025';
  if (n.includes('lisbon') || year === 2024) return 'lisbon-2024';
  if (n.includes('sydney') || year === 2022) return 'sydney-2022';
  if (n.includes('new york') || n.includes('ny') || year === 2019) return 'newyork-2019';
  if (n.includes('paris') || year === 2018) return 'paris-2018';
  return null;
};

// Legacy Tournaments definitions
const LEGACY_TOURNAMENTS = [
  { id: 'paris-2018', name: 'Paris 2018', coName: 'Gay Games X', city: 'Paris', country: 'France', flag: '🇫🇷', year: 2018, status: 'past', color: 'oklch(0.55 0.16 245)', description: 'Championship held in the French capital.' },
  { id: 'newyork-2019', name: 'New York 2019', coName: 'IGLA+ Championship', city: 'New York', country: 'USA', flag: '🇺🇸', year: 2019, status: 'past', color: 'oklch(0.62 0.18 28)', description: 'World Pride and IGLA+ in NYC.' },
  { id: 'sydney-2022', name: 'Sydney 2022', coName: 'IGLA+ Championship', city: 'Sydney', country: 'Australia', flag: '🇦🇺', year: 2022, status: 'past', color: 'oklch(0.55 0.16 200)', description: 'IGLA+ Down Under.' },
  { id: 'lisbon-2024', name: 'Lisbon 2024', coName: 'IGLA+ Championship', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', year: 2024, status: 'past', color: 'oklch(0.65 0.18 35)', description: 'Lisbon championship.' },
  { id: 'palmsprings-2025', name: 'Palm Springs 2025', coName: 'IGLA+ Championship', city: 'Palm Springs', country: 'USA', flag: '🇺🇸', year: 2025, status: 'past', color: 'oklch(0.68 0.16 80)', description: 'Desert swimming in Palm Springs.' }
];

// Append legacy tournaments to the array
for (const t of LEGACY_TOURNAMENTS) {
  if (!IGLA_TOURNAMENTS.some(existing => existing.id === t.id)) {
    IGLA_TOURNAMENTS.push(t);
  }
}


// 4. Seed Clubs
const insertClub = db.prepare(`
  INSERT INTO clubs (id, name, short_name, city, country, flag, region, founded_year, color, tagline, website, sports, members)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const club of IGLA_CLUBS) {
  // Add a placeholder mock website based on the short name
  const website = `https://www.${club.short.toLowerCase()}.org`;
  const sportsStr = club.sports ? club.sports.join(',') : '';
  insertClub.run(
    club.id,
    club.name,
    club.short,
    club.city,
    club.country,
    club.flag,
    club.region,
    club.founded,
    club.color,
    club.tagline,
    website,
    sportsStr,
    club.members || 0
  );
}
console.log('Seeded Clubs.');

const tournamentDatesMap = {
  'valencia-2026': { start: '2026-06-14', end: '2026-06-21' },
  'dc-2025': { start: '2025-05-31', end: '2025-06-05' },
  'buenosaires-2024': { start: '2024-11-04', end: '2024-11-09' },
  'london-2023': { start: '2023-07-09', end: '2023-07-14' },
  'palmsprings-2022': { start: '2022-04-06', end: '2022-04-10' },
  'montreal-2027': { start: '2027-07-30', end: '2027-08-05' },
  'reykjavik-2028': { start: '2028-06-18', end: '2028-06-24' }
};

const insertTournament = db.prepare(`
  INSERT INTO tournaments (id, name, type, city, country, flag, year, start_date, end_date, status, color, website, venue, description, participants, nations, clubs, records, expected_athletes, expected_nations, expected_clubs)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const t of IGLA_TOURNAMENTS) {
  const website = `https://www.${t.id}.igla.org`;
  const dateInfo = tournamentDatesMap[t.id] || { start: `${t.year}-01-01`, end: `${t.year}-01-07` };
  const expectedAthletes = t.expected ? t.expected.athletes : null;
  const expectedNations = t.expected ? t.expected.nations : null;
  const expectedClubs = t.expected ? t.expected.clubs : null;
  const type = t.coName.startsWith('Gay Games') ? 'Gay Games' : 'IGLA+ Championship';
  insertTournament.run(
    t.id,
    t.name,
    type,
    t.city,
    t.country,
    t.flag,
    t.year,
    dateInfo.start,
    dateInfo.end,
    t.status,
    t.color,
    website,
    t.venue || null,
    t.description || null,
    t.participants || null,
    t.nations || null,
    t.clubs || null,
    t.records || null,
    expectedAthletes,
    expectedNations,
    expectedClubs
  );
}
console.log('Seeded Tournaments.');

// 6. Build the Unified Athletes Registry
// We must collect ALL athletes from:
// - data.athletes
// - data.swimming results
// - data.waterPolo rosters
// - records.swimming results
const athletesRegistry = new Map();

// Load explicitly defined profiles first
if (IGLA_DATA.athletes) {
  for (const [id, a] of Object.entries(IGLA_DATA.athletes)) {
    athletesRegistry.set(id, {
      id,
      name: a.name,
      clubId: a.clubId,
      pronouns: a.pronouns || 'they/them',
      hometown: a.hometown || 'Unknown',
      claimed: a.claimed ? 1 : 0,
      email: a.claimed ? `${id.replace('a-', '')}@igla.org` : null
    });
  }
}

// Scrape from swim results
for (const s of IGLA_DATA.swimming) {
  if (s.athleteId && !athletesRegistry.has(s.athleteId)) {
    athletesRegistry.set(s.athleteId, {
      id: s.athleteId,
      name: s.athlete,
      clubId: s.clubId,
      pronouns: 'they/them',
      hometown: 'Unknown',
      claimed: 0,
      email: null
    });
  }
}

// Scrape from water polo rosters
if (IGLA_DATA.waterPolo && IGLA_DATA.waterPolo.divisions) {
  for (const div of IGLA_DATA.waterPolo.divisions) {
    for (const team of div.standings) {
      // Resolve club ID from teamId (e.g., 'wh2o-wp' -> 'wh2o')
      const clubId = team.teamId.split('-')[0];
      for (const player of team.roster) {
        if (player.athleteId && !athletesRegistry.has(player.athleteId)) {
          athletesRegistry.set(player.athleteId, {
            id: player.athleteId,
            name: player.name,
            clubId,
            pronouns: 'they/them',
            hometown: 'Unknown',
            claimed: 0,
            email: null
          });
        }
      }
    }
  }
}

// Scrape from records
for (const r of IGLA_RECORDS.swimming) {
  if (r.athleteId && !athletesRegistry.has(r.athleteId)) {
    athletesRegistry.set(r.athleteId, {
      id: r.athleteId,
      name: r.athlete,
      clubId: r.clubId,
      pronouns: 'they/them',
      hometown: 'Unknown',
      claimed: 0,
      email: null
    });
  }
}

// Seed Athletes
const insertAthlete = db.prepare(`
  INSERT INTO athletes (id, name, current_club_id, pronouns, hometown, is_claimed, email)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const a of athletesRegistry.values()) {
  insertAthlete.run(
    a.id,
    a.name,
    a.clubId,
    a.pronouns,
    a.hometown,
    a.claimed,
    a.email
  );
}
console.log(`Seeded Unified Athletes (${athletesRegistry.size} athletes total).`);

// 7. Seed Club Tournament History
const insertHistory = db.prepare(`
  INSERT INTO club_tournament_history (
    club_id, tournament_id, medals_gold, medals_silver, medals_bronze, records_set, wp_division, wp_finish
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const defaultHistory = IGLA_CLUB_HISTORY._default || [];
const seededClubIds = IGLA_CLUBS.map(c => c.id);

for (const clubId of seededClubIds) {
  const historyList = IGLA_CLUB_HISTORY[clubId] || defaultHistory;
  
  for (const h of historyList) {
    const tId = h.tournamentId || getTournamentId(h.tournament, h.year);
    // Valencia 2026 is fully detailed, so we calculate its history dynamically.
    // All other tournaments are seeded as overrides/summaries in the history table.
    if (tId === 'valencia-2026') continue;
    if (!tId) {
      console.warn(`Could not resolve tournament ID for legacy entry: ${h.tournament} (${h.year})`);
      continue;
    }

    insertHistory.run(
      clubId,
      tId,
      h.medals.g,
      h.medals.s,
      h.medals.b,
      h.records,
      h.wpDivision || null,
      h.wpFinish || null
    );
  }
}
console.log('Seeded Club Tournament History.');

// 8. Seed Swimming Results
// We will aggregate all swimming results from IGLA_DATA.swimming (Valencia 2026)
// AND from all-time records in IGLA_RECORDS.swimming that are from older tournaments.
const resultsRegistry = new Map();

// Insert Valencia results first
for (const s of IGLA_DATA.swimming) {
  resultsRegistry.set(s.id, {
    id: s.id,
    athlete_id: s.athleteId,
    club_id: s.clubId,
    tournament_id: 'valencia-2026',
    event: s.event,
    course: s.course,
    age_category: s.age,
    gender_category: s.gender,
    time: s.time,
    place: s.place,
    is_all_time_record: s.record ? 1 : 0,
    record_still_held: 0, // Will calculate based on records list
    broken_by_athlete_id: null
  });
}

// Process records to mark "is_all_time_record", "record_still_held", and "broken_by"
// If an older record is found that is NOT in the results registry, we insert it as a historical result!
let historicResultCounter = 0;
for (const r of IGLA_RECORDS.swimming) {
  const tId = getTournamentId(r.tournament, r.year);
  if (!tId) continue;
  
  // Try to find if this result matches any Valencia result we already added
  let matchedResult = null;
  if (tId === 'valencia-2026') {
    for (const res of resultsRegistry.values()) {
      if (
        res.athlete_id === r.athleteId &&
        res.event === r.event &&
        res.age_category === r.age &&
        res.gender_category === r.gender &&
        res.course === r.course
      ) {
        matchedResult = res;
        break;
      }
    }
  }
  
  if (matchedResult) {
    matchedResult.is_all_time_record = 1;
    matchedResult.record_still_held = r.held ? 1 : 0;
    if (!r.held && r.brokenBy) {
      // Find the athlete who broke it
      const breaker = Array.from(athletesRegistry.values()).find(a => a.name === r.brokenBy);
      matchedResult.broken_by_athlete_id = breaker ? breaker.id : null;
    }
  } else {
    // This is an older record result, add it as a new historical SwimmingResult
    const id = `s-hist-${++historicResultCounter}`;
    let broken_by_athlete_id = null;
    if (!r.held && r.brokenBy) {
      const breaker = Array.from(athletesRegistry.values()).find(a => a.name === r.brokenBy);
      broken_by_athlete_id = breaker ? breaker.id : null;
    }
    
    resultsRegistry.set(id, {
      id,
      athlete_id: r.athleteId,
      club_id: r.clubId,
      tournament_id: tId,
      event: r.event,
      course: r.course,
      age_category: r.age,
      gender_category: r.gender,
      time: r.time,
      place: r.held ? 1 : 2, // If they held a record, they won. If broken, they placed high.
      is_all_time_record: 1,
      record_still_held: r.held ? 1 : 0,
      broken_by_athlete_id
    });
  }
}

// Seed Swimming Results
const insertResult = db.prepare(`
  INSERT INTO swimming_results (
    id, athlete_id, club_id, tournament_id, event, course, age_category, gender_category, time, place,
    is_all_time_record, record_still_held, broken_by_athlete_id, created_by
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const r of resultsRegistry.values()) {
  insertResult.run(
    r.id,
    r.athlete_id,
    r.club_id,
    r.tournament_id,
    r.event,
    r.course,
    r.age_category,
    r.gender_category,
    r.time,
    r.place,
    r.is_all_time_record,
    r.record_still_held,
    r.broken_by_athlete_id,
    'system@igla.org'
  );
}
console.log(`Seeded Swimming Results (${resultsRegistry.size} total results).`);

// 9. Seed Water Polo Standings
if (IGLA_DATA.waterPolo && IGLA_DATA.waterPolo.divisions) {
  const insertWPTeam = db.prepare(`
    INSERT INTO water_polo_teams (id, tournament_id, club_id, division, final_placement, team_name, wins, losses, goals_for, goals_against, points, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertWPRoster = db.prepare(`
    INSERT INTO water_polo_rosters (team_id, athlete_id, cap_number, is_captain)
    VALUES (?, ?, ?, ?)
  `);

  const divMap = { 'A': 'Competitive', 'B': 'Intermediate', 'C': 'Recreational' };

  for (const div of IGLA_DATA.waterPolo.divisions) {
    const divisionName = divMap[div.id] || div.id;
    for (const team of div.standings) {
      const clubId = team.teamId.split('-')[0];
      
      // Insert Team Standing
      insertWPTeam.run(
        team.teamId,
        'valencia-2026',
        clubId,
        divisionName,
        team.place,
        team.team,
        team.wins,
        team.losses,
        team.goalsFor,
        team.goalsAgainst,
        team.points,
        'system@igla.org'
      );

      // Insert Roster members
      for (const p of team.roster) {
        if (p.athleteId) {
          insertWPRoster.run(
            team.teamId,
            p.athleteId,
            p.cap,
            p.captain ? 1 : 0
          );
        }
      }
    }
  }
}
console.log('Seeded Valencia 2026 Water Polo Standings & Rosters.');

// Seed historical water polo champions from records
const insertWPTeamHist = db.prepare(`
  INSERT OR IGNORE INTO water_polo_teams (id, tournament_id, club_id, division, final_placement, team_name, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const divMapHist = { 'A': 'Competitive', 'B': 'Intermediate', 'C': 'Recreational' };

for (const wp of IGLA_RECORDS.waterPolo) {
  const tId = getTournamentId(wp.tournament, wp.year);
  if (!tId) continue;
  
  const teamId = wp.year === 2026 ? `${wp.clubId}-wp` : `${wp.clubId}-wp-${wp.year}`;
  const divisionName = divMapHist[wp.division] || wp.division;

  insertWPTeamHist.run(
    teamId,
    tId,
    wp.clubId,
    divisionName,
    1, // Champions
    wp.champion,
    'system@igla.org'
  );
}
console.log('Seeded Historical Water Polo Champions.');

console.log('--- Database Seeding Completed Successfully! ---');
db.close();
