import { useProfileStore } from './profileSlice';
import { usePlanStore } from './planSlice';
import { useTodayStore } from './todaySlice';
import { useTimerStore } from './timerSlice';
import { useHistoryStore } from './historySlice';

export { useProfileStore } from './profileSlice';
export { usePlanStore } from './planSlice';
export { useTodayStore } from './todaySlice';
export { useTimerStore } from './timerSlice';
export { useHistoryStore } from './historySlice';

export async function hydrateStores(db: Parameters<
  ReturnType<typeof useProfileStore.getState>['hydrate']
>[0]): Promise<void> {
  await Promise.all([
    useProfileStore.getState().hydrate(db),
    usePlanStore.getState().hydrate(db),
    useTodayStore.getState().hydrate(db),
    useHistoryStore.getState().hydrate(db),
  ]);
}
