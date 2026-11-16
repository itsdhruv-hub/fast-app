import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { dataService } from '../services/dataService';
import { cancelAll, configureNotifications, cancelForEvent, getNotificationPermission, rescheduleAll } from '../services/notificationService';
import { isSupabaseConfigured } from '../services/supabase';
import { defaultSettings, localStore } from '../services/storage';
import { syncRecurringEvents } from '../services/recurrenceService';
import { isPastDate, toDateOnly } from '../utils/dateUtils';

const AppContext = createContext(null);

const demoDate = (daysFromToday) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return toDateOnly(date);
};

const demoEvents = [
  { fastName: 'Poonam Fast', fastType: 'Poonam Fast', description: 'A peaceful full-moon fast.', fastingDate: demoDate(1), reminderEnabled: true, isRecurring: false },
  { fastName: 'Ekadashi Fast', fastType: 'Ekadashi Fast', description: 'Keep the day calm and focused.', fastingDate: demoDate(3), reminderEnabled: true, isRecurring: false },
  { fastName: 'Saturday Fast', fastType: 'Saturday Fast', description: 'A simple weekly devotional fast.', fastingDate: demoDate(6), reminderEnabled: true, isRecurring: false },
  { fastName: 'Amavasya Fast', fastType: 'Amavasya Fast', description: 'Personal fasting reminder.', fastingDate: demoDate(9), reminderEnabled: true, isRecurring: false },
];

export const AppProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [permission, setPermission] = useState({ status: 'undetermined', granted: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      let nextEvents = await dataService.listEvents();
      if (!isSupabaseConfigured && !(await localStore.getDemoDataSeeded())) {
        const seededEvents = await Promise.all(demoEvents.map((event) => dataService.createEvent(event)));
        nextEvents = [...nextEvents, ...seededEvents].sort((a, b) => a.fastingDate.localeCompare(b.fastingDate));
        await localStore.saveDemoDataSeeded(true);
      }
      const expiredOneTime = nextEvents.filter((event) => !event.isRecurring && isPastDate(event.fastingDate));
      if (expiredOneTime.length) {
        for (const event of expiredOneTime) {
          await cancelForEvent(event.id);
          await dataService.deleteEvent(event.id);
        }
        nextEvents = nextEvents.filter((event) => event.isRecurring || !isPastDate(event.fastingDate));
      }
      const storedSettings = await localStore.getSettings();
      const nextSettings = { ...defaultSettings, ...(storedSettings || {}) };
      nextEvents = await syncRecurringEvents(nextEvents);
      for (const event of nextEvents) {
        if (event.status === 'upcoming' && isPastDate(event.fastingDate)) {
          await dataService.updateEvent(event.id, { status: 'completed' });
          event.status = 'completed';
        }
      }
      const nextHistory = await dataService.listHistory();
      setSettings(nextSettings);
      setEvents(nextEvents);
      setHistory(nextHistory);
      const currentPermission = await getNotificationPermission();
      setPermission(currentPermission);
      if (currentPermission.granted) await rescheduleAll(nextEvents, nextSettings);
    } catch (err) {
      setError(err.message || 'Could not load your fasting data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    configureNotifications().finally(refresh);
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const createEvent = async (input) => {
    try {
      const event = await dataService.createEvent(input);
      await refresh();
      return event;
    } catch (err) {
      setError(err.message || 'Could not add this fast.');
      throw err;
    }
  };

  const updateEvent = async (id, changes) => {
    try {
      await cancelForEvent(id);
      await dataService.updateEvent(id, changes);
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not update this fast.');
      throw err;
    }
  };

  const saveCompletedEvent = async (event) => {
    await dataService.saveHistory(event);
    await dataService.updateEvent(event.id, { status: 'saved' });
    await cancelForEvent(event.id);
    await refresh();
  };

  const deleteEvent = async (event) => {
    await cancelForEvent(event.id);
    if (event.recurrenceGroupId) {
      const related = events.filter((item) => item.recurrenceGroupId === event.recurrenceGroupId);
      await Promise.all(related.map((item) => cancelForEvent(item.id)));
      await Promise.all(related.map((item) => dataService.deleteEvent(item.id)));
    } else {
      await dataService.deleteEvent(event.id);
    }
    await refresh();
  };

  const updateSettings = async (changes) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    await localStore.saveSettings(next);
    const currentPermission = next.remindersEnabled ? await getNotificationPermission() : permission;
    setPermission(currentPermission);
    if (currentPermission.granted && next.remindersEnabled) await rescheduleAll(events, next);
    if (!next.remindersEnabled) await cancelAll();
  };

  const requestPermission = async () => {
    const next = await getNotificationPermission();
    setPermission(next);
    if (next.granted) await rescheduleAll(events, settings);
    return next;
  };

  const value = useMemo(() => ({
    events,
    history,
    settings,
    permission,
    loading,
    error,
    refresh,
    createEvent,
    updateEvent,
    saveCompletedEvent,
    deleteEvent,
    updateSettings,
    requestPermission,
  }), [events, history, settings, permission, loading, error, refresh]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
