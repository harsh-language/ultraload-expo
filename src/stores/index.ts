import { useProfileStore } from './profileSlice';
import { usePlanStore } from './planSlice';
import { useSettingsStore } from './settingsSlice';
import { useTodayStore } from './todaySlice';
import { useTimerStore } from './timerSlice';

export { useProfileStore } from './profileSlice';
export { usePlanStore } from './planSlice';
export { useSettingsStore } from './settingsSlice';
export { useTodayStore } from './todaySlice';
export { useTimerStore } from './timerSlice';

export async function hydrateStores(db: Parameters<
  ReturnType<typeof useProfileStore.getState>['hydrate']
>[0]): Promise<void> {
  await Promise.all([
    useProfileStore.getState().hydrate(db),
    usePlanStore.getState().hydrate(db),
    useSettingsStore.getState().hydrate(db),
    useTodayStore.getState().hydrate(db),
  ]);
}
