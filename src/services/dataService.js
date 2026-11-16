import { supabase } from './supabase';
import { localStore } from './storage';

const uuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const toLocal = (row) => ({
  id: row.id,
  userId: row.user_id,
  fastName: row.fast_name,
  fastType: row.fast_type,
  fastingDate: row.fasting_date,
  description: row.description || '',
  isRecurring: Boolean(row.is_recurring),
  recurrenceDay: row.recurrence_day,
  recurrenceGroupId: row.recurrence_group_id || null,
  recurrenceLimit: row.recurrence_limit ?? null,
  reminderEnabled: row.reminder_enabled !== false,
  status: row.status || 'upcoming',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toRow = (event) => ({
  id: event.id,
  user_id: event.userId || null,
  fast_name: event.fastName,
  fast_type: event.fastType,
  fasting_date: event.fastingDate,
  description: event.description || null,
  is_recurring: Boolean(event.isRecurring),
  recurrence_day: event.recurrenceDay ?? null,
  recurrence_group_id: event.recurrenceGroupId || null,
  recurrence_limit: event.recurrenceLimit ?? null,
  reminder_enabled: event.reminderEnabled !== false,
  status: event.status || 'upcoming',
  updated_at: new Date().toISOString(),
});

const toUpdateRow = (changes) => {
  const row = {};
  if (changes.fastName !== undefined) row.fast_name = changes.fastName;
  if (changes.fastType !== undefined) row.fast_type = changes.fastType;
  if (changes.fastingDate !== undefined) row.fasting_date = changes.fastingDate;
  if (changes.description !== undefined) row.description = changes.description || null;
  if (changes.isRecurring !== undefined) row.is_recurring = Boolean(changes.isRecurring);
  if (changes.recurrenceDay !== undefined) row.recurrence_day = changes.recurrenceDay;
  if (changes.recurrenceGroupId !== undefined) row.recurrence_group_id = changes.recurrenceGroupId || null;
  if (changes.recurrenceLimit !== undefined) row.recurrence_limit = changes.recurrenceLimit ?? null;
  if (changes.reminderEnabled !== undefined) row.reminder_enabled = changes.reminderEnabled !== false;
  if (changes.status !== undefined) row.status = changes.status;
  return row;
};

const sorted = (events) => [...events].sort((a, b) => a.fastingDate.localeCompare(b.fastingDate));

export const dataService = {
  async listEvents() {
    if (!supabase) return sorted(await localStore.getEvents());
    const { data, error } = await supabase.from('fasting_events').select('*').order('fasting_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(toLocal);
  },

  async createEvent(input) {
    const event = {
      ...input,
      id: input.id || uuid(),
      status: input.status || 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!supabase) {
      const events = await localStore.getEvents();
      await localStore.saveEvents(sorted([...events, event]));
      return event;
    }
    const { data, error } = await supabase.from('fasting_events').insert(toRow(event)).select().single();
    if (error) throw error;
    return toLocal(data);
  },

  async updateEvent(id, changes) {
    if (!supabase) {
      const events = await localStore.getEvents();
      const updated = events.map((event) => event.id === id ? { ...event, ...changes, updatedAt: new Date().toISOString() } : event);
      await localStore.saveEvents(sorted(updated));
      return updated.find((event) => event.id === id);
    }
    const { data, error } = await supabase.from('fasting_events').update(toUpdateRow(changes)).eq('id', id).select().single();
    if (error) throw error;
    return toLocal(data);
  },

  async deleteEvent(id) {
    if (!supabase) {
      const events = await localStore.getEvents();
      await localStore.saveEvents(events.filter((event) => event.id !== id));
      return;
    }
    const { error } = await supabase.from('fasting_events').delete().eq('id', id);
    if (error) throw error;
  },

  async saveHistory(event) {
    const history = {
      id: uuid(),
      fastingEventId: event.id,
      fastName: event.fastName,
      fastType: event.fastType,
      fastingDate: event.fastingDate,
      completionStatus: 'saved',
      savedAt: new Date().toISOString(),
    };
    if (!supabase) {
      const current = await localStore.getHistory();
      await localStore.saveHistory([history, ...current.filter((item) => item.fastingEventId !== event.id)]);
      return history;
    }
    const { error } = await supabase.from('fasting_history').insert({
      id: history.id,
      user_id: event.userId || null,
      fasting_event_id: history.fastingEventId,
      fast_name: history.fastName,
      fast_type: history.fastType,
      fasting_date: history.fastingDate,
      completion_status: history.completionStatus,
      saved_at: history.savedAt,
    });
    if (error) throw error;
    return history;
  },

  async listHistory() {
    if (!supabase) return localStore.getHistory();
    const { data, error } = await supabase.from('fasting_history').select('*').order('fasting_date', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      fastingEventId: row.fasting_event_id,
      fastName: row.fast_name,
      fastType: row.fast_type,
      fastingDate: row.fasting_date,
      completionStatus: row.completion_status,
      savedAt: row.saved_at,
    }));
  },
};
