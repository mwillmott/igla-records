import Database from 'better-sqlite3';
import path from 'path';

declare global {
  var _sqliteDb: Database.Database | undefined;
}

const dbPath = path.join(process.cwd(), 'igla.db');

let db: Database.Database;

if (process.env.NODE_ENV === 'production') {
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
} else {
  if (!global._sqliteDb) {
    global._sqliteDb = new Database(dbPath);
    global._sqliteDb.pragma('foreign_keys = ON');
  }
  db = global._sqliteDb;
}

export default db;
