import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Archive, CheckCircle2, Info } from 'lucide-react-native';
import { endOfDay, isWithinInterval, subMonths } from 'date-fns';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { displayDate, parseDateOnly } from '../utils/dateUtils';
import { Screen } from '../components/ui';

const FILTERS = ['All', 'Monthly', 'Weekly'];

export default function HistoryScreen() {
  const { history, events } = useApp();
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => history.filter((item) => {
    if (filter === 'Monthly') return isWithinInterval(parseDateOnly(item.fastingDate), { start: subMonths(new Date(), 1), end: endOfDay(new Date()) });
    if (filter === 'Weekly') return events.some((event) => event.id === item.fastingEventId && event.isRecurring);
    return true;
  }), [history, filter, events]);
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerMarkOuter}><View style={styles.headerMarkMiddle}><View style={styles.headerMarkInner}><Archive size={23} color={colors.accentDark} /></View></View></View>
          <View style={styles.headerCopy}><Text style={styles.eyebrow}>YOUR JOURNEY</Text><Text style={styles.title}>Fasting history</Text><Text style={styles.subtitle}>Your completed fasts, all in one place</Text></View>
        </View>
      </View>
      <View style={styles.filters}>{FILTERS.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item}</Text></Pressable>)}</View>
      {filtered.length ? filtered.map((item) => <View key={item.id} style={styles.historyCard}><View style={styles.historyDate}><Text style={styles.dateDay}>{displayDate(item.fastingDate, 'd')}</Text><Text style={styles.dateMonth}>{displayDate(item.fastingDate, 'MMM').toUpperCase()}</Text></View><View style={styles.historyDetails}><Text style={styles.historyName}>{item.fastName}</Text><View style={styles.savedRow}><CheckCircle2 size={14} color={colors.green} /><Text style={styles.savedText}>Saved {item.savedAt ? displayDate(item.savedAt.slice(0, 10), 'd MMM yyyy') : ''}</Text></View></View></View>) : <View style={styles.emptyCard}><View style={styles.emptyIcon}><CheckCircle2 size={27} color={colors.green} /></View><Text style={styles.emptyTitle}>Your history is empty</Text><Text style={styles.emptyDescription}>Completed fasts that you save will appear here.</Text></View>}
      <View style={styles.info}><View style={styles.infoIcon}><Info size={16} color={colors.accent} /></View><Text style={styles.infoText}>Save a completed fast from Home to build your personal history.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#FFF0E3', borderColor: '#F1D9C5', borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 13 },
  headerBrand: { alignItems: 'center', flexDirection: 'row' },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#54291D', fontSize: 23, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  headerCopy: { flex: 1, paddingLeft: spacing.sm },
  subtitle: { color: '#9C6650', fontSize: 11, marginTop: 4 },
  headerMarkOuter: { alignItems: 'center', backgroundColor: '#FBE0CC', borderRadius: radius.pill, height: 58, justifyContent: 'center', width: 58 },
  headerMarkMiddle: { alignItems: 'center', backgroundColor: '#F6C7A5', borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  headerMarkInner: { alignItems: 'center', backgroundColor: '#FFF8F1', borderRadius: radius.pill, height: 38, justifyContent: 'center', width: 38 },
  filters: { backgroundColor: colors.surfaceMuted, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', padding: 4 },
  filter: { alignItems: 'center', borderRadius: 8, flex: 1, paddingVertical: 10 },
  activeFilter: { backgroundColor: colors.surface },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  activeFilterText: { color: colors.ink },
  emptyCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: radius.pill, height: 64, justifyContent: 'center', marginBottom: spacing.md, width: 64 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  emptyDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  historyCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', marginTop: 10, padding: spacing.sm },
  historyDate: { alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: radius.sm, justifyContent: 'center', minHeight: 60, width: 56 },
  dateDay: { color: colors.green, fontSize: 21, fontWeight: '900' },
  dateMonth: { color: colors.green, fontSize: 10, fontWeight: '900', marginTop: 2 },
  historyDetails: { flex: 1, marginLeft: 12 },
  historyName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  savedRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 9 },
  savedText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  info: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, flexDirection: 'row', gap: 9, marginTop: spacing.md, padding: spacing.sm },
  infoIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 28, justifyContent: 'center', width: 28 },
  infoText: { color: colors.muted, flex: 1, fontSize: 11, lineHeight: 16 },
});
