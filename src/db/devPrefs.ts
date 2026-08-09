import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { DATABASE_NAME } from './client';

const DEMO_DATA_KEY = 'demo_data_enabled';
const TODAY_DEMO_DATE_KEY = 'today_demo_date';

let prefsClient: SQLiteDatabase | null = null;
let prefsTableReady = false;

function getPrefsClient(): SQLiteDatabase {
  if (!prefsClient) {
    prefsClient = openDatabaseSync(DATABASE_NAME, {
      enableChangeListener: true,
    });
    prefsClient.execSync('PRAGMA foreign_keys = ON');
  }
  if (!prefsTableReady) {
    ensureDevPrefsTable(prefsClient);
    prefsTableReady = true;
  }
  return prefsClient;
}

function ensureDevPrefsTable(client: SQLiteDatabase): void {
  client.execSync(`
    CREATE TABLE IF NOT EXISTS _dev_prefs (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

/**
 * DEV-only: whether docs/demo-data.md sessions may be seeded / kept.
 * Defaults to on when unset so existing simulator behavior is unchanged.
 */
export function isDemoDataEnabled(): boolean {
  if (!__DEV__) {
    return false;
  }

  const client = getPrefsClient();
  const row = client.getFirstSync<{ value: string }>(
    'SELECT value FROM _dev_prefs WHERE key = ?',
    DEMO_DATA_KEY,
  );

  if (row == null) {
    return true;
  }

  return row.value === '1';
}

/** DEV-only: persist the demo-data toggle. */
export function setDemoDataEnabled(enabled: boolean): void {
  if (!__DEV__) {
    return;
  }

  const client = getPrefsClient();
  client.runSync(
    'INSERT OR REPLACE INTO _dev_prefs (key, value) VALUES (?, ?)',
    DEMO_DATA_KEY,
    enabled ? '1' : '0',
  );
}

/**
 * DEV-only: calendar day (YYYY-MM-DD) that already received a rolling today-demo inject.
 * Null when never set. Not shown in UI.
 */
export function getTodayDemoDate(): string | null {
  if (!__DEV__) {
    return null;
  }

  const client = getPrefsClient();
  const row = client.getFirstSync<{ value: string }>(
    'SELECT value FROM _dev_prefs WHERE key = ?',
    TODAY_DEMO_DATE_KEY,
  );

  return row?.value ?? null;
}

/** DEV-only: mark that rolling today-demo was applied for this calendar day. */
export function setTodayDemoDate(date: string): void {
  if (!__DEV__) {
    return;
  }

  const client = getPrefsClient();
  client.runSync(
    'INSERT OR REPLACE INTO _dev_prefs (key, value) VALUES (?, ?)',
    TODAY_DEMO_DATE_KEY,
    date,
  );
}

/** DEV-only: clear the rolling today-demo tag (toggle off / reset). */
export function clearTodayDemoDate(): void {
  if (!__DEV__) {
    return;
  }

  const client = getPrefsClient();
  client.runSync('DELETE FROM _dev_prefs WHERE key = ?', TODAY_DEMO_DATE_KEY);
}
