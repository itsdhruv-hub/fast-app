import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { addDays, isAfter, startOfDay } from 'date-fns';
import { displayDate, formatTime, parseDateOnly, timeToDate } from '../utils/dateUtils';
import { localStore } from './storage';

export const configureNotifications = async () => {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('fasting-reminders', {
        name: 'Fasting reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D87537',
      });
    }
  } catch {
    // Notification setup must never prevent the calendar UI from opening.
  }
};

export const getNotificationPermission = async () => {
  try {
    if (!Device.isDevice) return { status: 'unsupported', granted: false };
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return { status: current.status, granted: true };
    const requested = await Notifications.requestPermissionsAsync();
    return { status: requested.status, granted: requested.granted };
  } catch {
    return { status: 'unavailable', granted: false };
  }
};

const schedule = async (event, date, title, body, type) => {
  if (date <= new Date()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { eventId: event.id, notificationType: type },
        sound: 'default',
      },
      trigger: Platform.OS === 'android'
        ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'fasting-reminders' }
        : { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch {
    return null;
  }
};

const reminderBody = (event, daysRemaining) => {
  if (daysRemaining === 1) return `Tomorrow is your ${event.fastName}. Don't forget!`;
  if (daysRemaining === 0) return `Today is your ${event.fastName}. Remember your fast!`;
  return `Reminder: Your ${event.fastName} is coming in ${daysRemaining} days.`;
};

export const cancelForEvent = async (eventId) => {
  const registry = await localStore.getNotificationRegistry();
  await Promise.allSettled((registry[eventId] || []).map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  delete registry[eventId];
  await localStore.saveNotificationRegistry(registry);
};

export const cancelAll = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // The registry is still cleared so a later permission grant can rebuild it.
  }
  await localStore.saveNotificationRegistry({});
};

export const scheduleForEvent = async (event, settings) => {
  await cancelForEvent(event.id);
  if (!settings.remindersEnabled || !event.reminderEnabled || event.status === 'saved') return [];
  const eventDate = parseDateOnly(event.fastingDate);
  const today = startOfDay(new Date());
  if (eventDate < today) return [];
  const ids = [];
  const times = settings.reminderTimes.slice(0, settings.dailyReminderFrequency);
  for (let offset = 3; offset >= 1; offset -= 1) {
    const reminderDate = addDays(eventDate, -offset);
    for (const time of times) {
      if (offset === 1 && time === settings.previousNightTime) continue;
      const id = await schedule(
        event,
        timeToDate(event.fastingDate, time),
        'Fasting reminder',
        reminderBody(event, offset),
        'countdown',
      );
      if (id) ids.push(id);
    }
  }
  const nightDate = addDays(eventDate, -1);
  const nightId = await schedule(
    event,
    timeToDate(`${nightDate.getFullYear()}-${String(nightDate.getMonth() + 1).padStart(2, '0')}-${String(nightDate.getDate()).padStart(2, '0')}`, settings.previousNightTime),
    'Tomorrow is your fast',
    `Reminder: Tomorrow is your ${event.fastName}. Don't forget!`,
    'previous-night',
  );
  if (nightId) ids.push(nightId);
  for (const time of [settings.morningTime, settings.eveningTime]) {
    const id = await schedule(event, timeToDate(event.fastingDate, time), 'Fasting day', reminderBody(event, 0), 'fasting-day');
    if (id) ids.push(id);
  }
  const registry = await localStore.getNotificationRegistry();
  registry[event.id] = ids;
  await localStore.saveNotificationRegistry(registry);
  return ids;
};

export const rescheduleAll = async (events, settings) => {
  const permission = await getNotificationPermission();
  if (!permission.granted) return permission;
  await Promise.all(events.map((event) => scheduleForEvent(event, settings)));
  return permission;
};
