// db.js — opens the SQLite database and creates the tables if needed.
// The database file lives in server/data/ (git-ignored). No credentials are
// needed for SQLite; the file path can be changed with DB_FILE in .env.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const file = process.env.DB_FILE || path.join(__dirname, 'data', 'students.db');
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // makes ON DELETE CASCADE work

db.exec(`
  -- Student Account
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id    TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,              -- bcrypt hash, never plain text
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Student Profile (exactly one per account)
  CREATE TABLE IF NOT EXISTS profiles (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    course     TEXT NOT NULL,
    year_level TEXT NOT NULL,
    about      TEXT NOT NULL DEFAULT '',
    skills     TEXT NOT NULL DEFAULT '[]',    -- JSON array of strings
    picture    TEXT,                          -- data:image/jpeg;base64,... (from the camera)
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Active login sessions. Logging out deletes the row, which invalidates
  -- the token even though the JWT itself has not expired yet.
  CREATE TABLE IF NOT EXISTS sessions (
    jti        TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL               -- unix seconds
  );
`);

module.exports = db;
