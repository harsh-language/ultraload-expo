import * as Notifications from 'expo-notifications';

const REST_TIMER_NOTIFICATION_ID = 'rest-timer-complete';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureRestTimerNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleRestTimerNotification(
  seconds: number,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    REST_TIMER_NOTIFICATION_ID,
  );

  const granted = await ensureRestTimerNotificationPermissions();
  if (!granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: REST_TIMER_NOTIFICATION_ID,
    content: {
      title: 'Time for action.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}

export async function cancelRestTimerNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    REST_TIMER_NOTIFICATION_ID,
  );
}
