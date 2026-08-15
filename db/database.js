const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'amira.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Helper function to load and execute SQL scripts
function initializeDatabase() {
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Strip SQL comments first
    const cleanSql = sql.replace(/--.*$/gm, '');
    
    // Split SQL by semicolons to execute statements individually
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) console.error('Error enabling foreign keys:', err);
      });

      for (const statement of statements) {
        db.run(statement, (err) => {
          if (err) {
            console.error('Error executing SQL statement:', statement, err.message);
          }
        });
      }
      console.log('Database tables verified and seeded successfully.');
    });
  } catch (error) {
    console.error('Failed to read or execute schema.sql:', error.message);
  }
}

// Promisified database helpers for cleaner async/await usage
const dbHelper = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = dbHelper;
