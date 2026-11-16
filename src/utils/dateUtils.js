import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';

export const parseDateOnly = (value) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const toDateOnly = (value) => format(value, 'yyyy-MM-dd');
export const todayDateOnly = () => toDateOnly(new Date());
export const displayDate = (value, pattern = 'd MMM yyyy') => format(parseDateOnly(value), pattern);
export const daysUntil = (value) => differenceInCalendarDays(parseDateOnly(value), startOfDay(new Date()));
export const isPastDate = (value) => isBefore(parseDateOnly(value), startOfDay(new Date()));
export const isTodayDate = (value) => isSameDay(parseDateOnly(value), new Date());
export const dateLabel = (value) => {
  const remaining = daysUntil(value);
  if (remaining === 0) return 'Today';
  if (remaining === 1) return 'Tomorrow';
  if (remaining < 0) return `${Math.abs(remaining)} days ago`;
  return `In ${remaining} days`;
};

export const monthGrid = (month) => {
  const first = startOfMonth(month);
  const start = addDays(first, -getDay(first));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
};

export const monthTitle = (month) => format(month, 'MMMM yyyy');
export const monthBounds = (month) => ({ start: startOfMonth(month), end: endOfMonth(month) });

export const nextOccurrenceDate = (dateValue, weekday) => {
  const base = parseDateOnly(dateValue);
  let distance = (weekday - getDay(base) + 7) % 7;
  if (distance === 0 && isPastDate(dateValue)) distance = 7;
  return addDays(base, distance);
};

export const occurrencesForWeekday = (weekday, from = new Date(), weeks = 8) => {
  const start = startOfDay(from);
  const distance = (weekday - getDay(start) + 7) % 7;
  const first = addDays(start, distance);
  return Array.from({ length: weeks }, (_, index) => toDateOnly(addWeeks(first, index)));
};

export const timeToDate = (dateValue, timeValue) => {
  const date = parseDateOnly(dateValue);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
};

export const formatTime = (timeValue) => {
  const [hourString, minute] = timeValue.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
};
