import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = '@fasting-reminder/events';
const HISTORY_KEY = '@fasting-reminder/history';
const SETTINGS_KEY = '@fasting-reminder/settings';
const NOTIFICATIONS_KEY = '@fasting-reminder/notifications';
const FAST_TYPES_KEY = '@fasting-reminder/fast-types';
const DEMO_DATA_SEEDED_KEY = '@fasting-reminder/demo-data-seeded';

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
  getFastTypes: () => read(FAST_TYPES_KEY, null),
  saveFastTypes: (fastTypes) => write(FAST_TYPES_KEY, fastTypes),
  getDemoDataSeeded: () => read(DEMO_DATA_SEEDED_KEY, false),
  saveDemoDataSeeded: (seeded) => write(DEMO_DATA_SEEDED_KEY, seeded),
};

export const defaultSettings = {
  remindersEnabled: true,
  dailyReminderFrequency: 4,
  reminderTimes: ['08:00', '12:00', '17:00', '21:00'],
  reminderTimeEnabled: [true, true, true, true],
  previousNightTime: '21:00',
  previousNightReminderEnabled: true,
  morningTime: '05:00',
  morningReminderEnabled: true,
  eveningTime: '17:00',
  eveningReminderEnabled: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
};
