import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Archive, CheckCircle2, Filter } from 'lucide-react-native';
import { endOfDay, isWithinInterval, subMonths } from 'date-fns';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { displayDate, parseDateOnly, toDateOnly } from '../utils/dateUtils';
import { EmptyState, Screen } from '../components/ui';

const FILTERS = ['All', 'Monthly', 'Weekly', 'Custom'];

export default function HistoryScreen() {
  const { history, events } = useApp();
  const [filter, setFilter] = useState('All');
  const [customStart, setCustomStart] = useState(subMonths(new Date(), 1));
  const [customEnd, setCustomEnd] = useState(new Date());
  const [picker, setPicker] = useState(null);
  const filtered = useMemo(() => history.filter((item) => {
    if (filter === 'Monthly') return isWithinInterval(parseDateOnly(item.fastingDate), { start: subMonths(new Date(), 1), end: endOfDay(new Date()) });
    if (filter === 'Weekly') return events.some((event) => event.id === item.fastingEventId && event.isRecurring);
    if (filter === 'Custom') return isWithinInterval(parseDateOnly(item.fastingDate), { start: customStart, end: endOfDay(customEnd) });
    return true;
  }), [history, filter, events]);
  return (
    <Screen>
      <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR JOURNEY</Text><Text style={styles.title}>Fasting history</Text></View><View style={styles.icon}><Archive size={20} color={colors.accent} /></View></View>
      <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item}</Text></Pressable>)}</View>
      {filter === 'Custom' && <View style={styles.rangeBox}><Text style={styles.rangeLabel}>Date range</Text><View style={styles.rangeRow}><Pressable onPress={() => setPicker('start')} style={styles.rangeButton}><Text style={styles.rangeButtonText}>{displayDate(toDateOnly(customStart), 'd MMM yyyy')}</Text></Pressable><Text style={styles.rangeDash}>to</Text><Pressable onPress={() => setPicker('end')} style={styles.rangeButton}><Text style={styles.rangeButtonText}>{displayDate(toDateOnly(customEnd), 'd MMM yyyy')}</Text></Pressable></View></View>}
      {picker && <DateTimePicker value={picker === 'start' ? customStart : customEnd} mode="date" maximumDate={new Date()} onChange={(_, selected) => { setPicker(null); if (!selected) return; if (picker === 'start') setCustomStart(selected); else setCustomEnd(selected); }} />}
      {filtered.length ? filtered.map((item) => <View key={item.id} style={styles.historyCard}><View style={styles.historyDate}><Text style={styles.dateDay}>{displayDate(item.fastingDate, 'd')}</Text><Text style={styles.dateMonth}>{displayDate(item.fastingDate, 'MMM').toUpperCase()}</Text></View><View style={styles.historyDetails}><Text style={styles.historyName}>{item.fastName}</Text><Text style={styles.historyType}>{item.fastType}</Text><View style={styles.savedRow}><CheckCircle2 size={14} color={colors.green} /><Text style={styles.savedText}>Saved {item.savedAt ? displayDate(item.savedAt.slice(0, 10), 'd MMM yyyy') : ''}</Text></View></View></View>) : <EmptyState icon={<CheckCircle2 size={26} color={colors.green} />} title="Your history is empty" description="Saved completed fasts will appear here." />}
      <View style={styles.info}><Filter size={16} color={colors.muted} /><Text style={styles.infoText}>Save a completed fast from Home to keep it in your personal history.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 4 },
  icon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
  filters: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, flexDirection: 'row', padding: 4 },
  filter: { alignItems: 'center', borderRadius: 8, flex: 1, paddingVertical: 10 },
  activeFilter: { backgroundColor: colors.surface },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  activeFilterText: { color: colors.ink },
  rangeBox: { backgroundColor: colors.surface, borderRadius: radius.sm, marginTop: 10, padding: spacing.sm },
  rangeLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 7 },
  rangeRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  rangeButton: { backgroundColor: colors.surfaceMuted, borderRadius: 8, flex: 1, paddingHorizontal: 8, paddingVertical: 10 },
  rangeButtonText: { color: colors.ink, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  rangeDash: { color: colors.muted, fontSize: 11 },
  historyCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', marginTop: 10, padding: spacing.sm },
  historyDate: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: radius.sm, justifyContent: 'center', minHeight: 60, width: 56 },
  dateDay: { color: colors.green, fontSize: 21, fontWeight: '900' },
  dateMonth: { color: colors.green, fontSize: 10, fontWeight: '900', marginTop: 2 },
  historyDetails: { flex: 1, marginLeft: 12 },
  historyName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  historyType: { color: colors.muted, fontSize: 12, marginTop: 3 },
  savedRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 9 },
  savedText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  info: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, flexDirection: 'row', gap: 8, marginTop: 22, padding: spacing.sm },
  infoText: { color: colors.muted, flex: 1, fontSize: 11, lineHeight: 16 },
});
