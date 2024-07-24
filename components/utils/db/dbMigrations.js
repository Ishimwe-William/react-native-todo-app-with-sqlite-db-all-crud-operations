export async function migrateDbIfNeeded(db) {
  const DATABASE_VERSION = 1;
  let result = await db.getFirstAsync('PRAGMA user_version');
  let currentDbVersion = result.user_version;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    // Initial database setup
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL,
        description TEXT,
        created DATETIME NOT NULL,
        isComplete BOOLEAN NOT NULL,
        toBeComplete DATETIME,
        reminder DATETIME
      );
    `);

    // Insert initial data if needed
    await db.runAsync(
      'INSERT INTO todos (value, description, created, isComplete, toBeComplete, reminder) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'Hello',
        'Hello description',
        new Date().getTime(),
        false,
        new Date().getTime() + 86400000,
        new Date().getTime() + 86200000,
      ]
    );
    await db.runAsync(
      'INSERT INTO todos (value, description, created, isComplete, toBeComplete, reminder) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'World',
        'World description',
        new Date().getTime(),
        false,
        new Date().getTime() + 172800000,
        new Date().getTime() + 172600000,
      ]
    );
    currentDbVersion = 1;
  }
  // Future migrations can be handled here
  // if (currentDbVersion === 1) {
  //   // Perform database migrations for version 2
  //   currentDbVersion = 2;
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
