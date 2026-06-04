-- SQLite Relational Database Schema for IGLA+ Records

PRAGMA foreign_keys = ON;

-- 1. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    flag TEXT NOT NULL,
    region TEXT NOT NULL,
    founded_year INTEGER NOT NULL,
    color TEXT NOT NULL,
    tagline TEXT NOT NULL,
    website TEXT,
    sports TEXT,
    members INTEGER NOT NULL DEFAULT 0
);

-- 2. Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    co_name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    flag TEXT NOT NULL,
    year INTEGER NOT NULL,
    dates TEXT NOT NULL,
    status TEXT CHECK(status IN ('live', 'upcoming', 'past')) NOT NULL,
    color TEXT NOT NULL,
    website TEXT,
    podium TEXT,
    venue TEXT,
    description TEXT,
    participants INTEGER,
    nations INTEGER,
    clubs INTEGER,
    records INTEGER,
    expected_athletes INTEGER,
    expected_nations INTEGER,
    expected_clubs INTEGER
);

-- 3. Club Tournament History Table
CREATE TABLE IF NOT EXISTS club_tournament_history (
    club_id TEXT NOT NULL,
    tournament_id TEXT, -- nullable because some historical tournaments are stubbed / not fully defined
    medals_gold INTEGER NOT NULL DEFAULT 0,
    medals_silver INTEGER NOT NULL DEFAULT 0,
    medals_bronze INTEGER NOT NULL DEFAULT 0,
    records_set INTEGER NOT NULL DEFAULT 0,
    wp_division TEXT,
    wp_finish INTEGER,
    -- Custom fields to store textual metadata for items without detailed tournament entities
    historical_year INTEGER,
    historical_tournament TEXT,
    historical_flag TEXT,
    PRIMARY KEY (club_id, historical_year, historical_tournament),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
);

-- 4. Athletes Table
CREATE TABLE IF NOT EXISTS athletes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    current_club_id TEXT,
    pronouns TEXT NOT NULL DEFAULT '',
    hometown TEXT NOT NULL DEFAULT '',
    is_claimed BOOLEAN NOT NULL DEFAULT 0,
    email TEXT,
    FOREIGN KEY (current_club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- 5. Swimming Results Table
CREATE TABLE IF NOT EXISTS swimming_results (
    id TEXT PRIMARY KEY,
    athlete_id TEXT,
    club_id TEXT NOT NULL,
    tournament_id TEXT NOT NULL,
    event TEXT NOT NULL,
    course TEXT CHECK(course IN ('LCM', 'SCM')) NOT NULL,
    age_category TEXT NOT NULL,
    gender_category TEXT NOT NULL,
    time TEXT NOT NULL,
    place INTEGER NOT NULL,
    is_all_time_record BOOLEAN NOT NULL DEFAULT 0,
    record_still_held BOOLEAN NOT NULL DEFAULT 0,
    broken_by_athlete_id TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    updated_at TEXT,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (broken_by_athlete_id) REFERENCES athletes(id) ON DELETE SET NULL
);

-- 6. Water Polo Teams Table
CREATE TABLE IF NOT EXISTS water_polo_teams (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    division TEXT NOT NULL,
    final_placement INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    wins INTEGER,
    losses INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    points INTEGER,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    updated_at TEXT,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- 7. Water Polo Rosters Table
CREATE TABLE IF NOT EXISTS water_polo_rosters (
    team_id TEXT NOT NULL,
    athlete_id TEXT NOT NULL,
    cap_number INTEGER NOT NULL,
    is_captain BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY (team_id, athlete_id),
    FOREIGN KEY (team_id) REFERENCES water_polo_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
);

-- Indices for Fast Queries
CREATE INDEX IF NOT EXISTS idx_swimming_results_athlete ON swimming_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_swimming_results_lookup ON swimming_results(event, age_category, gender_category, course);
CREATE INDEX IF NOT EXISTS idx_wp_rosters_athlete ON water_polo_rosters(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wp_teams_tournament ON water_polo_teams(tournament_id);
