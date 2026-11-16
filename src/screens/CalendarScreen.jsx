import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addMonths, isSameMonth, isSameDay, subMonths } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { displayDate, monthGrid, monthTitle, toDateOnly } from '../utils/dateUtils';
import FastCard from '../components/FastCard';
import { Screen } from '../components/ui';

export default function CalendarScreen({ navigation }) {
  const { events } = useApp();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const grid = useMemo(() => monthGrid(month), [month]);
  const selectedEvents = events.filter((event) => isSameDay(new Date(`${event.fastingDate}T12:00:00`), selected));
  const moveMonth = (nextMonth) => {
    setMonth(nextMonth);
    setSelected(nextMonth);
  };
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerIconOuter}><View style={styles.headerIconMiddle}><View style={styles.headerIcon}><CalendarDays size={24} color={colors.accentDark} /></View></View></View>
          <View style={styles.headerCopy}><Text style={styles.eyebrow}>YOUR SCHEDULE</Text><Text style={styles.title}>Fasting calendar</Text><Text style={styles.subtitle}>Choose a date to view your fasts</Text></View>
        </View>
      </View>
      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}><Pressable accessibilityLabel="Previous month" onPress={() => moveMonth(subMonths(month, 1))} style={styles.monthButton}><ChevronLeft size={19} color={colors.ink} /></Pressable><Text style={styles.monthTitle}>{monthTitle(month)}</Text><Pressable accessibilityLabel="Next month" onPress={() => moveMonth(addMonths(month, 1))} style={styles.monthButton}><ChevronRight size={19} color={colors.ink} /></Pressable></View>
        <View style={styles.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekText}>{day}</Text>)}</View>
        <View style={styles.grid}>{grid.map((day) => {
          const dateKey = toDateOnly(day);
          const dayEvents = events.filter((event) => event.fastingDate === dateKey);
          const isSelected = isSameDay(day, selected);
          return <Pressable key={dateKey} onPress={() => setSelected(day)} style={[styles.day, !isSameMonth(day, month) && styles.outside, dayEvents.length > 0 && styles.dayWithEvents, isSelected && styles.selectedDay]}><Text style={[styles.dayNumber, isSelected && styles.selectedNumber]}>{day.getDate()}</Text>{dayEvents.length > 0 && <View style={styles.dots}>{dayEvents.slice(0, 3).map((event, index) => <View key={event.id} style={[styles.dot, event.status === 'completed' ? styles.completedDot : event.isRecurring ? styles.recurringDot : null, index > 0 && { marginLeft: 2 }]} />)}</View>}</Pressable>;
        })}</View>
        <View style={styles.legend}><Legend color={colors.accent} label="Upcoming" /><Legend color={colors.green} label="Completed" /><Legend color={colors.blue} label="Recurring" /></View>
      </View>
      <View style={styles.selectedHeader}>
        <View><Text style={styles.selectedEyebrow}>SELECTED DATE</Text><Text style={styles.selectedTitle}>{displayDate(toDateOnly(selected), 'EEEE, d MMMM')}</Text></View>
        {selectedEvents.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{selectedEvents.length}</Text></View>}
      </View>
      {selectedEvents.length ? <View style={styles.eventList}><View style={styles.eventListHeader}><Text style={styles.eventListTitle}>Scheduled fasts</Text><Text style={styles.eventListHint}>Tap to edit</Text></View>{selectedEvents.map((event) => <FastCard key={event.id} event={event} onPress={() => navigation.navigate('AddFast', { eventId: event.id })} />)}</View> : <View style={styles.selectedEmpty}><View style={styles.selectedEmptyIcon}><CalendarDays size={24} color={colors.accent} /></View><View style={styles.selectedEmptyCopy}><Text style={styles.selectedEmptyTitle}>Nothing scheduled</Text><Text style={styles.selectedEmptyDescription}>Choose another date or add a fast here.</Text></View><Pressable onPress={() => navigation.navigate('AddFastChoice')} style={styles.inlineAdd}><Plus size={16} color={colors.accent} /><Text style={styles.inlineText}>Add fast</Text></Pressable></View>}
    </Screen>
  );
}

const Legend = ({ color, label }) => <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>;

const styles = StyleSheet.create({
  header: { backgroundColor: '#FFF0E3', borderColor: '#F1D9C5', borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 13 },
  headerBrand: { alignItems: 'center', flexDirection: 'row' },
  headerIconOuter: { alignItems: 'center', backgroundColor: '#FBE0CC', borderRadius: radius.pill, height: 58, justifyContent: 'center', marginRight: spacing.sm, width: 58 },
  headerIconMiddle: { alignItems: 'center', backgroundColor: '#F6C7A5', borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  headerIcon: { alignItems: 'center', backgroundColor: '#FFF8F1', borderRadius: radius.pill, height: 38, justifyContent: 'center', width: 38 },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#54291D', fontSize: 23, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { color: '#9C6650', fontSize: 11, marginTop: 4 },
  calendarCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 12 },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  monthTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  monthButton: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, height: 34, justifyContent: 'center', width: 34 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekText: { color: colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center', width: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: radius.sm, height: 50, justifyContent: 'center', marginBottom: 2, width: '14.285%' },
  dayWithEvents: { backgroundColor: '#FFF1E5', borderColor: '#F5D8C3', borderWidth: 1 },
  outside: { opacity: 0.3 },
  selectedDay: { backgroundColor: colors.accent },
  dayNumber: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  selectedNumber: { color: colors.surface },
  dots: { flexDirection: 'row', marginTop: 4 },
  dot: { backgroundColor: colors.accent, borderRadius: 3, height: 5, width: 5 },
  completedDot: { backgroundColor: colors.green },
  recurringDot: { backgroundColor: colors.blue },
  legend: { borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 9, paddingTop: 12 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
  legendText: { color: colors.muted, fontSize: 10 },
  selectedHeader: { alignItems: 'center', backgroundColor: '#FFF1E5', borderColor: '#F1D7C3', borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 12 },
  selectedEyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  selectedTitle: { color: '#54291D', fontSize: 18, fontWeight: '900', marginTop: 4 },
  countBadge: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 32, justifyContent: 'center', minWidth: 32, paddingHorizontal: 9 },
  countText: { color: colors.accentDark, fontSize: 13, fontWeight: '900' },
  eventList: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.sm },
  eventListHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  eventListTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  eventListHint: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  selectedEmpty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md },
  selectedEmptyIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 54, justifyContent: 'center', marginRight: spacing.sm, width: 54 },
  selectedEmptyCopy: { flex: 1, minWidth: 170 },
  selectedEmptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  selectedEmptyDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  inlineAdd: { alignItems: 'center', borderColor: colors.accent, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: spacing.md, paddingHorizontal: 14, paddingVertical: 9, width: '100%' },
  inlineText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
});
