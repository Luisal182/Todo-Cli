const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path. database/ folder at project root
const DB_PATH = path.join(__dirname, '../../database/todos.db');

// To be sure database dir exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Start database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

// Start database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create lists table
    db.run(`
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          list_id INTEGER NOT NULL,
          task TEXT NOT NULL,
          done BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// Database operations
const dbOperations = {
  // Create a new list
  createList: (listName) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO lists (name) VALUES (?)',
        [listName],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              reject(new Error(`List "${listName}" already exists`));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, name: listName });
          }
        }
      );
    });
  },

  // Get list by name
  getListByName: (listName) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM lists WHERE name = ?',
        [listName],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Add task to list
  addTask: (listName, taskText) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist. Create it first with --create ${listName}`));
          return;
        }

        db.run(
          'INSERT INTO tasks (list_id, task) VALUES (?, ?)',
          [list.id, taskText],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, task: taskText, done: false });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  // Get all tasks from a list
  getTasks: (listName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist`));
          return;
        }

        db.all(
          'SELECT * FROM tasks WHERE list_id = ? ORDER BY created_at ASC',
          [list.id],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  // Check task as done ( text or ID)
  markTaskDone: (listName, taskIdentifier) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist`));
          return;
        }

        let query, params;
        
        //Check identifier it starts with # (like #01, #02)
        if (taskIdentifier.startsWith('#')) {
          const taskId = parseInt(taskIdentifier.substring(1));
          if (isNaN(taskId)) {
            reject(new Error(`Invalid task ID format: ${taskIdentifier}`));
            return;
          }
          query = 'UPDATE tasks SET done = TRUE WHERE list_id = ? AND id = ?';
          params = [list.id, taskId];
        } else {
          // Search by task text
          query = 'UPDATE tasks SET done = TRUE WHERE list_id = ? AND task = ? AND done = FALSE';
          params = [list.id, taskIdentifier];
        }

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error(`Task "${taskIdentifier}" not found or already completed in list "${listName}"`));
          } else {
            resolve({ changes: this.changes });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete task (by text or ID)
  deleteTask: (listName, taskIdentifier) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist`));
          return;
        }

        let query, params;
        
        // Check if identifier starts with # (ID format)
        if (taskIdentifier.startsWith('#')) {
          const taskId = parseInt(taskIdentifier.substring(1));
          if (isNaN(taskId)) {
            reject(new Error(`Invalid task ID format: ${taskIdentifier}`));
            return;
          }
          query = 'DELETE FROM tasks WHERE list_id = ? AND id = ?';
          params = [list.id, taskId];
        } else {
          // Search by task text
          query = 'DELETE FROM tasks WHERE list_id = ? AND task = ?';
          params = [list.id, taskIdentifier];
        }

        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error(`Task "${taskIdentifier}" not found in list "${listName}"`));
          } else {
            resolve({ changes: this.changes });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Clear all completed tasks
  clearCompletedTasks: (listName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist`));
          return;
        }

        db.run(
          'DELETE FROM tasks WHERE list_id = ? AND done = TRUE',
          [list.id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ deletedCount: this.changes });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  // Delete entire list and all the tasks
  deleteList: (listName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await dbOperations.getListByName(listName);
        if (!list) {
          reject(new Error(`List "${listName}" does not exist`));
          return;
        }

        db.run(
          'DELETE FROM lists WHERE id = ?',
          [list.id],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ deletedList: listName });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  initDatabase,
  dbOperations,
  closeDatabase
};