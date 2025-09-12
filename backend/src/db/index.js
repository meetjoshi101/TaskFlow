const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '../../database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Database schema
const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK (role IN ('product_manager', 'engineer'))
      )`,

      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`,

      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done')),
        assignedUserId INTEGER,
        projectId INTEGER NOT NULL,
        FOREIGN KEY (assignedUserId) REFERENCES users(id),
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        authorId INTEGER NOT NULL,
        taskId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id),
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      )`
    ];

    const promises = tables.map(sql => {
      return new Promise((resolveTable, rejectTable) => {
        db.run(sql, (err) => {
          if (err) {
            rejectTable(err);
          } else {
            resolveTable();
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => resolve())
      .catch(reject);
  });
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await createTables();
    await seedDatabase();
    console.log('Database tables created and seeded successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

// Seed database with test data
const seedDatabase = async () => {
  try {
    // Seed users
    await runQuery(
      'INSERT OR IGNORE INTO users (name, role) VALUES (?, ?)',
      ['Alice Johnson', 'product_manager']
    );
    await runQuery(
      'INSERT OR IGNORE INTO users (name, role) VALUES (?, ?)',
      ['Bob Smith', 'engineer']
    );
    await runQuery(
      'INSERT OR IGNORE INTO users (name, role) VALUES (?, ?)',
      ['Carol Davis', 'engineer']
    );

    // Seed projects
    const project1 = await runQuery(
      'INSERT OR IGNORE INTO projects (name) VALUES (?)',
      ['TaskFlow MVP']
    );
    const project2 = await runQuery(
      'INSERT OR IGNORE INTO projects (name) VALUES (?)',
      ['Mobile App Redesign']
    );

    // Seed tasks
    await runQuery(
      'INSERT OR IGNORE INTO tasks (title, description, status, assignedUserId, projectId) VALUES (?, ?, ?, ?, ?)',
      ['Setup project structure', 'Initialize the basic project structure and dependencies', 'Done', 1, 1]
    );
    await runQuery(
      'INSERT OR IGNORE INTO tasks (title, description, status, assignedUserId, projectId) VALUES (?, ?, ?, ?, ?)',
      ['Implement user authentication', 'Add user login and registration functionality', 'In Progress', 2, 1]
    );
    await runQuery(
      'INSERT OR IGNORE INTO tasks (title, description, status, assignedUserId, projectId) VALUES (?, ?, ?, ?, ?)',
      ['Design database schema', 'Create the database schema for the application', 'To Do', 3, 2]
    );

    // Seed comments
    await runQuery(
      'INSERT OR IGNORE INTO comments (text, authorId, taskId) VALUES (?, ?, ?)',
      ['This looks good, let me review the implementation details', 1, 1]
    );
    await runQuery(
      'INSERT OR IGNORE INTO comments (text, authorId, taskId) VALUES (?, ?, ?)',
      ['I think we should consider using a different approach for the authentication flow', 2, 2]
    );
    await runQuery(
      'INSERT OR IGNORE INTO comments (text, authorId, taskId) VALUES (?, ?, ?)',
      ['The database schema looks solid. Have you considered adding indexes for performance?', 3, 3]
    );

    console.log('Database seeded with test data');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Helper function to run queries with promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single row
const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get all rows
const getAllRows = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getRow,
  getAllRows,
  closeDatabase
};