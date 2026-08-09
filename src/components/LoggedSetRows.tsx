import { StyleSheet, View } from 'react-native';
import type { DisplayUnit } from '../data/exercise-catalogue';
import { toDeletableSet, type DeletableSet } from '../domain/deletable-set';
import { buildLoggedSetRowModels } from '../domain/logged-set-rows';
import { kgToDisplay } from '../domain/units';
import type { TodaySet } from '../stores/todaySlice';
import { LogRow } from './LogRow';

interface LoggedSetRowsProps {
  exerciseId: string;
  sets: TodaySet[];
  units: DisplayUnit;
  unitLabel: string;
  onEdit: (set: TodaySet, exerciseId: string, setIndex?: number) => void;
  onDelete: (set: DeletableSet) => void;
}

export function LoggedSetRows({
  exerciseId,
  sets,
  units,
  unitLabel,
  onEdit,
  onDelete,
}: LoggedSetRowsProps) {
  const rows = buildLoggedSetRowModels(sets);

  return (
    <View style={styles.stack}>
      {rows.map((row, index) => {
        const set = sets[index];
        if (!set) {
          return null;
        }

        if (row.warmUp) {
          return (
            <LogRow
              key={row.id}
              onDelete={() => {
                onDelete(toDeletableSet(set));
              }}
              onEdit={() => {
                onEdit(set, exerciseId);
              }}
              reps={row.reps}
              showActions
              showBottomBorder={row.showBottomBorder}
              type="set"
              unit={unitLabel}
              warmUp
              weight={kgToDisplay(row.weight, units)}
            />
          );
        }

        return (
          <LogRow
            key={row.id}
            onDelete={() => {
              onDelete(toDeletableSet(set, row.setIndex));
            }}
            onEdit={() => {
              onEdit(set, exerciseId, row.setIndex);
            }}
            reps={row.reps}
            setIndex={row.setIndex}
            showActions
            showBottomBorder={row.showBottomBorder}
            type="set"
            unit={unitLabel}
            weight={kgToDisplay(row.weight, units)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: '100%',
    gap: 0,
  },
});
