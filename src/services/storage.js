import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = '@fasting-reminder/events';
const HISTORY_KEY = '@fasting-reminder/history';
const SETTINGS_KEY = '@fasting-reminder/settings';
const NOTIFICATIONS_KEY = '@fasting-reminder/notifications';

const read = async (key, fallback) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

export const localStore = {
  getEvents: () => read(EVENTS_KEY, []),
  saveEvents: (events) => write(EVENTS_KEY, events),
  getHistory: () => read(HISTORY_KEY, []),
  saveHistory: (history) => write(HISTORY_KEY, history),
  getSettings: () => read(SETTINGS_KEY, null),
  saveSettings: (settings) => write(SETTINGS_KEY, settings),
  getNotificationRegistry: () => read(NOTIFICATIONS_KEY, {}),
  saveNotificationRegistry: (registry) => write(NOTIFICATIONS_KEY, registry),
};

export const defaultSettings = {
  remindersEnabled: true,
  dailyReminderFrequency: 4,
  reminderTimes: ['08:00', '12:00', '17:00', '21:00'],
  previousNightTime: '21:00',
  morningTime: '05:00',
  eveningTime: '17:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
};
