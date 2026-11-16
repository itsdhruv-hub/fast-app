import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addMonths, isSameMonth, isSameDay, subMonths } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { displayDate, monthGrid, monthTitle, toDateOnly } from '../utils/dateUtils';
import FastCard from '../components/FastCard';
import { EmptyState, Screen, SectionTitle } from '../components/ui';

export default function CalendarScreen({ navigation }) {
  const { events } = useApp();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const grid = useMemo(() => monthGrid(month), [month]);
  const selectedEvents = events.filter((event) => isSameDay(new Date(`${event.fastingDate}T12:00:00`), selected));
  return (
    <Screen>
      <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR SCHEDULE</Text><Text style={styles.title}>Fasting calendar</Text></View><Pressable onPress={() => navigation.navigate('AddFast')} style={styles.add}><Plus size={21} color={colors.surface} /></Pressable></View>
      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}><Pressable onPress={() => setMonth(subMonths(month, 1))} style={styles.monthButton}><ChevronLeft size={19} color={colors.ink} /></Pressable><Text style={styles.monthTitle}>{monthTitle(month)}</Text><Pressable onPress={() => setMonth(addMonths(month, 1))} style={styles.monthButton}><ChevronRight size={19} color={colors.ink} /></Pressable></View>
        <View style={styles.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekText}>{day}</Text>)}</View>
        <View style={styles.grid}>{grid.map((day) => {
          const dateKey = toDateOnly(day);
          const dayEvents = events.filter((event) => event.fastingDate === dateKey);
          const isSelected = isSameDay(day, selected);
          return <Pressable key={dateKey} onPress={() => setSelected(day)} style={[styles.day, !isSameMonth(day, month) && styles.outside, isSelected && styles.selectedDay]}><Text style={[styles.dayNumber, isSelected && styles.selectedNumber]}>{day.getDate()}</Text>{dayEvents.length > 0 && <View style={styles.dots}>{dayEvents.slice(0, 3).map((event, index) => <View key={event.id} style={[styles.dot, event.status === 'completed' ? styles.completedDot : event.isRecurring ? styles.recurringDot : null, index > 0 && { marginLeft: 2 }]} />)}</View>}</Pressable>;
        })}</View>
        <View style={styles.legend}><Legend color={colors.accent} label="Upcoming" /><Legend color={colors.green} label="Completed" /><Legend color={colors.blue} label="Recurring" /></View>
      </View>
      <SectionTitle title={displayDate(toDateOnly(selected), 'EEEE, d MMMM')} />
      {selectedEvents.length ? selectedEvents.map((event) => <FastCard key={event.id} event={event} onPress={() => navigation.navigate('AddFast', { eventId: event.id })} />) : <EmptyState icon={<CalendarDays size={25} color={colors.accent} />} title="Nothing scheduled" description="Choose another date or add a fast here." action={<Pressable onPress={() => navigation.navigate('AddFast')} style={styles.inlineAdd}><Plus size={16} color={colors.accent} /><Text style={styles.inlineText}>Add fast</Text></Pressable>} />}
    </Screen>
  );
}

const Legend = ({ color, label }) => <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>;

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 4 },
  add: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
  calendarCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  monthTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  monthButton: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, height: 34, justifyContent: 'center', width: 34 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekText: { color: colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center', width: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: radius.sm, height: 48, justifyContent: 'center', marginBottom: 2, width: '14.285%' },
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
  inlineAdd: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 16 },
  inlineText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
});
