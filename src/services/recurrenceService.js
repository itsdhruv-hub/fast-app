import { isPastDate, occurrencesForWeekday, parseDateOnly } from '../utils/dateUtils';
import { dataService } from './dataService';

export const syncRecurringEvents = async (events) => {
  const recurring = events.filter((event) => event.isRecurring && event.recurrenceDay !== null && event.recurrenceDay !== undefined);
  if (!recurring.length) return events;
  const templates = new Map();
  recurring.forEach((event) => {
    const groupKey = event.recurrenceGroupId || event.id;
    const current = templates.get(groupKey);
    if (!current || event.fastingDate < current.fastingDate) templates.set(groupKey, event);
  });
  const additions = [];
  for (const template of templates.values()) {
    const groupKey = template.recurrenceGroupId || template.id;
    const groupEvents = events.filter((event) => (event.recurrenceGroupId || event.id) === groupKey);
    const existingDates = new Set(groupEvents.map((event) => event.fastingDate));
    const limit = Number.isInteger(template.recurrenceLimit) && template.recurrenceLimit > 0 ? template.recurrenceLimit : null;
    const currentTotal = groupEvents.length;
    const futureTotal = groupEvents.filter((event) => !isPastDate(event.fastingDate)).length;
    const remaining = limit ? Math.max(0, limit - currentTotal) : Math.max(0, 8 - futureTotal);
    if (!remaining) continue;
    const startDate = limit || !isPastDate(template.fastingDate) ? parseDateOnly(template.fastingDate) : new Date();
    const dates = occurrencesForWeekday(template.recurrenceDay, startDate, limit ? limit + 1 : 8 + futureTotal);
    for (const date of dates) {
      const alreadyExists = existingDates.has(date) || additions.some((event) => event.fastingDate === date && (event.recurrenceGroupId || event.id) === groupKey);
      if (!alreadyExists && additions.filter((event) => (event.recurrenceGroupId || event.id) === groupKey).length < remaining) {
        additions.push(await dataService.createEvent({
          ...template,
          id: undefined,
          fastingDate: date,
          status: 'upcoming',
          recurrenceGroupId: template.recurrenceGroupId,
          recurrenceLimit: template.recurrenceLimit ?? null,
        }));
      }
    }
  }
  return [...events, ...additions].sort((a, b) => a.fastingDate.localeCompare(b.fastingDate));
};
