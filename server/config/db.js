import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database/book_a_doctor.db');
const schemaPath = path.resolve(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new Database(dbPath, { verbose: null });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables if not existing
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

/**
 * Helper to run SQL SELECT query returning array of objects
 */
export function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (err) {
    console.error('SQL Error in query:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/**
 * Helper to run SQL SELECT query returning a single object
 */
export function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(params);
  } catch (err) {
    console.error('SQL Error in queryOne:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/**
 * Helper to run INSERT, UPDATE, DELETE query returning { changes, lastInsertRowid }
 */
export function execute(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return {
      changes: info.changes,
      lastInsertRowid: Number(info.lastInsertRowid)
    };
  } catch (err) {
    console.error('SQL Error in execute:', err.message, '\nSQL:', sql);
    throw err;
  }
}

export default db;
