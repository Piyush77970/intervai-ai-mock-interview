const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'intervai.db');

// Ensure database file exists, if not initialized, we can trigger init later
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    // Enable Foreign Keys in SQLite
    db.run('PRAGMA foreign_keys = ON;', (fkErr) => {
      if (fkErr) console.error('Failed to enable foreign keys:', fkErr);
    });
  }
});

/**
 * Run a SQL query that does not return rows (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        // Resolve with the lastID and changes count
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Retrieve a single row (SELECT ... LIMIT 1)
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Retrieve all rows (SELECT ...)
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
};
