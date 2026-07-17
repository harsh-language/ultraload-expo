import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DATABASE_NAME = 'ultraload.db';

let dbInstance: ExpoSQLiteDatabase<typeof schema> | null = null;

export function getDatabase(): ExpoSQLiteDatabase<typeof schema> {
  if (!dbInstance) {
    const expoDb = openDatabaseSync(DATABASE_NAME, {
      enableChangeListener: true,
    });
    // SQLite FK cascades are off unless enabled per connection
    expoDb.execSync('PRAGMA foreign_keys = ON');
    dbInstance = drizzle(expoDb, { schema });
  }
  return dbInstance;
}

export function createDatabase(expoDb: SQLiteDatabase): ExpoSQLiteDatabase<typeof schema> {
  expoDb.execSync('PRAGMA foreign_keys = ON');
  return drizzle(expoDb, { schema });
}

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

export type AppDatabaseTransaction = Parameters<
  Parameters<AppDatabase['transaction']>[0]
>[0];

export type DbOrTransaction = AppDatabase | AppDatabaseTransaction;
