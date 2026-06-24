import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { createDatabase, DATABASE_NAME } from './client';
import { ensurePersistedRows } from './repositories';
import migrations from './migrations/migrations';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { hydrateStores } from '../stores';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

function MigrationGate({ children }: { children: React.ReactNode }) {
  const expoDb = useSQLiteContext();
  const db = useMemo(() => createDatabase(expoDb), [expoDb]);
  const { success, error } = useMigrations(db, migrations);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    if (!success) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await ensurePersistedRows(db);
        await hydrateStores(db);
        if (!cancelled) {
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setBootError(err instanceof Error ? err.message : 'Database boot failed');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [success, db]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Migration failed: {error.message}</Text>
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{bootError}</Text>
      </View>
    );
  }

  if (!success || !ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors['content-1']} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} options={{ enableChangeListener: true }}>
      <MigrationGate>{children}</MigrationGate>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['bg-1'],
    padding: spacing['s-8'],
  },
  errorText: {
    ...typography.para2,
    ...textCase.none,
  },
});
