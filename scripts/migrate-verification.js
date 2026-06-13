const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../igla.db');
console.log(`Migrating Database: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

try {
  db.transaction(() => {
    // 1. Check if column already exists in swimming_results
    const swimmingInfo = db.pragma('table_info(swimming_results)');
    const hasSwimVerified = swimmingInfo.some(col => col.name === 'verified');
    if (!hasSwimVerified) {
      console.log('Adding verification columns to swimming_results...');
      db.prepare("ALTER TABLE swimming_results ADD COLUMN verified BOOLEAN NOT NULL DEFAULT 1").run();
      db.prepare("ALTER TABLE swimming_results ADD COLUMN verified_at TEXT").run();
      db.prepare("ALTER TABLE swimming_results ADD COLUMN verified_by TEXT").run();
      db.prepare("UPDATE swimming_results SET verified_at = datetime('now'), verified_by = 'system@igla.org'").run();
    } else {
      console.log('swimming_results already has verification columns.');
    }

    // 2. Check if column already exists in water_polo_teams
    const wpInfo = db.pragma('table_info(water_polo_teams)');
    const hasWpVerified = wpInfo.some(col => col.name === 'verified');
    if (!hasWpVerified) {
      console.log('Adding verification columns to water_polo_teams...');
      db.prepare("ALTER TABLE water_polo_teams ADD COLUMN verified BOOLEAN NOT NULL DEFAULT 1").run();
      db.prepare("ALTER TABLE water_polo_teams ADD COLUMN verified_at TEXT").run();
      db.prepare("ALTER TABLE water_polo_teams ADD COLUMN verified_by TEXT").run();
      db.prepare("UPDATE water_polo_teams SET verified_at = datetime('now'), verified_by = 'system@igla.org'").run();
    } else {
      console.log('water_polo_teams already has verification columns.');
    }
  })();
  console.log('Migration completed successfully.');
} catch (err) {
  console.error('Migration failed:', err);
} finally {
  db.close();
}
