import * as SQLite from 'expo-sqlite';

const DB_NAME = 'mobile_dev.db';

export interface Task {
  id: number;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

interface CreateTaskInput {
  title: string;
  completed?: number;
}

const database = SQLite.openDatabaseSync(DB_NAME);

let isInitialized = false;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      resolve();
      return;
    }

    database.execAsync(
      `CREATE TABLE IF NOT EXISTS schema_versions (
        version INTEGER PRIMARY KEY
      );`
    ).then(async () => {
      const row: any = await database.getFirstAsync('SELECT MAX(version) as version FROM schema_versions');
      const currentVersion = row?.version ?? 0;
      
      if (currentVersion < 1) {
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT (datetime('now')),
            updated_at DATETIME DEFAULT (datetime('now'))
          );
          CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
          INSERT OR REPLACE INTO schema_versions (version) VALUES (1);
        `);
        console.log('✅ Database schema v1 created and migrated');
      }
      isInitialized = true;
      resolve();
    }).catch((error) => {
      console.error('Database init failed:', error);
      reject(error);
    });
  });
};

export const createTask = (input: CreateTaskInput): Promise<Task> => {
  return initDB().then(async () => {
    const result = await database.runAsync(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      input.title,
      input.completed ?? 0
    );
    const task = await database.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', result.lastInsertRowId!);
    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  });
};

export const getAllTasks = (): Promise<Task[]> => {
  return initDB().then(() => database.getAllAsync<Task>('SELECT * FROM tasks ORDER BY created_at DESC'));
};

export const getTask = (id: number): Promise<Task | null> => {
  return initDB().then(() => database.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', id));
};

export const updateTask = async (id: number, updates: Partial<Task>): Promise<Task | null> => {
  await initDB();
  const setParts = Object.keys(updates).map((key) => `${key} = ?`);
  const values = Object.values(updates) as any[];
  await database.runAsync(`UPDATE tasks SET ${setParts.join(', ')}, updated_at = datetime('now') WHERE id = ?`, ...values, id);
  const task = await getTask(id);
  return task;
};

export const deleteTask = (id: number): Promise<void> => {
  return initDB().then(() => {
    database.runAsync('DELETE FROM tasks WHERE id = ?', id);
    return Promise.resolve();
  });
};

export const deleteAllTasks = (): Promise<void> => {
  return initDB().then(() => {
    database.execAsync('DELETE FROM tasks');
    return Promise.resolve();
  });
};

// Convenience exports
export const tasks = {
  create: createTask,
  getAll: getAllTasks,
  get: getTask,
  update: async (id: number, updates: Partial<Task>): Promise<Task> => {
    const task = await updateTask(id, updates);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    return task;
  },
  delete: deleteTask,
  deleteAll: deleteAllTasks,
};

// Auto-init on import (optional)
initDB().catch(console.error);

