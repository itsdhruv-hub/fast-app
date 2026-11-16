import { occurrencesForWeekday } from '../utils/dateUtils';
import { dataService } from './dataService';

export const syncRecurringEvents = async (events) => {
  const recurring = events.filter((event) => event.isRecurring && event.recurrenceDay !== null && event.recurrenceDay !== undefined);
  if (!recurring.length) return events;
  const additions = [];
  for (const template of recurring) {
    const dates = occurrencesForWeekday(template.recurrenceDay, new Date(), 8);
    for (const date of dates) {
      const alreadyExists = events.some((event) =>
        event.fastingDate === date &&
        event.recurrenceGroupId === template.recurrenceGroupId,
      );
      const inBatch = additions.some((event) =>
        event.fastingDate === date && event.recurrenceGroupId === template.recurrenceGroupId,
      );
      if (!alreadyExists && !inBatch) {
        additions.push(await dataService.createEvent({
          ...template,
          id: undefined,
          fastingDate: date,
          status: 'upcoming',
          recurrenceGroupId: template.recurrenceGroupId,
        }));
      }
    }
  }
  return [...events, ...additions].sort((a, b) => a.fastingDate.localeCompare(b.fastingDate));
};
