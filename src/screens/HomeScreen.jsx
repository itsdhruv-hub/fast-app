import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, CalendarDays, ChevronRight, Clock3, Flame, Plus, Sparkles } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { dateLabel, displayDate, isPastDate, todayDateOnly } from '../utils/dateUtils';
import FastCard from '../components/FastCard';
import { EmptyState, ErrorBanner, LoadingState, Screen, SectionTitle } from '../components/ui';

export default function HomeScreen({ navigation }) {
  const { events, loading, permission, error, refresh, saveCompletedEvent, deleteEvent } = useApp();
  const upcoming = useMemo(() => events.filter((event) => event.status === 'upcoming' && !isPastDate(event.fastingDate)), [events]);
  const completed = useMemo(() => events.filter((event) => event.status === 'completed'), [events]);
  const nextFast = upcoming[0];
  const recurring = upcoming.filter((event) => event.isRecurring);

  if (loading) return <LoadingState />;

  const confirmDelete = (event) => Alert.alert('Delete this fast?', `Remove ${event.fastName} and cancel its reminders?`, [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(event) },
  ]);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PERSONAL FASTING</Text>
          <Text style={styles.greeting}>Your mindful calendar</Text>
        </View>
        <View style={styles.headerIcon}><Flame size={21} color={colors.accent} /></View>
      </View>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {!permission.granted && (
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.permissionBanner}>
          <Bell size={18} color={colors.accentDark} />
          <View style={styles.bannerText}><Text style={styles.bannerTitle}>Reminders are off</Text><Text style={styles.bannerBody}>Tap to enable fasting notifications.</Text></View>
          <ChevronRight size={18} color={colors.accentDark} />
        </Pressable>
      )}

      <View style={styles.todayCard}>
        <View style={styles.todayTop}><Text style={styles.todayLabel}>TODAY</Text><Text style={styles.todayDate}>{displayDate(todayDateOnly(), 'EEEE, d MMMM')}</Text></View>
        {nextFast ? <>
          <Text style={styles.nextLabel}>NEXT FAST</Text>
          <Text style={styles.nextName}>{nextFast.fastName}</Text>
          <View style={styles.nextMeta}><CalendarDays size={16} color={colors.accentDark} /><Text style={styles.nextDate}>{displayDate(nextFast.fastingDate)}</Text><View style={styles.divider} /><Clock3 size={16} color={colors.accentDark} /><Text style={styles.nextDate}>{dateLabel(nextFast.fastingDate)}</Text></View>
        </> : <View style={styles.noNext}><Sparkles size={23} color={colors.accent} /><Text style={styles.noNextText}>Your calendar is clear.</Text></View>}
      </View>

      <SectionTitle title="Upcoming fasts" action="Calendar" onAction={() => navigation.navigate('Calendar')} />
      {upcoming.length ? upcoming.slice(0, 5).map((event) => <FastCard key={event.id} event={event} onPress={() => navigation.navigate('AddFast', { eventId: event.id })} />) : <EmptyState icon={<CalendarDays size={26} color={colors.accent} />} title="No upcoming fasts" description="Add a fast to start your personal reminder calendar." />}

      {recurring.length > 0 && <>
        <SectionTitle title="Active recurring fasts" />
        <View style={styles.recurringCard}><View style={styles.recurringIcon}><Flame size={20} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.recurringTitle}>{new Set(recurring.map((event) => event.recurrenceGroupId)).size} weekly schedule{new Set(recurring.map((event) => event.recurrenceGroupId)).size === 1 ? '' : 's'}</Text><Text style={styles.recurringBody}>Reminders are prepared for the next 8 weeks.</Text></View><ChevronRight size={18} color={colors.muted} /></View>
      </>}

      {completed.length > 0 && <>
        <SectionTitle title="Needs your review" />
        {completed.slice(0, 3).map((event) => <FastCard key={event.id} event={event} onSave={() => saveCompletedEvent(event)} onDelete={() => confirmDelete(event)} onPress={() => {}} />)}
      </>}

      <Pressable onPress={() => navigation.navigate('AddFast')} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}><Plus size={24} color={colors.surface} /><Text style={styles.fabText}>Add fast</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  greeting: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 4 },
  headerIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 44, justifyContent: 'center', width: 44 },
  permissionBanner: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, flexDirection: 'row', gap: 10, marginBottom: spacing.md, padding: spacing.sm },
  bannerText: { flex: 1 },
  bannerTitle: { color: colors.accentDark, fontSize: 13, fontWeight: '800' },
  bannerBody: { color: colors.accentDark, fontSize: 12, marginTop: 2 },
  todayCard: { backgroundColor: colors.ink, borderRadius: radius.lg, minHeight: 178, overflow: 'hidden', padding: spacing.lg },
  todayTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  todayLabel: { color: '#E9B78E', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  todayDate: { color: '#F7EDE3', fontSize: 12 },
  nextLabel: { color: '#BFB4AB', fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: 28 },
  nextName: { color: colors.surface, fontSize: 26, fontWeight: '900', marginTop: 3 },
  nextMeta: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 14 },
  nextDate: { color: '#E9B78E', fontSize: 13, fontWeight: '700' },
  divider: { backgroundColor: '#655A52', height: 18, marginHorizontal: 3, width: 1 },
  noNext: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  noNextText: { color: '#F7EDE3', fontSize: 16, fontWeight: '700', marginTop: 8 },
  recurringCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', gap: 12, padding: spacing.md },
  recurringIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  recurringTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  recurringBody: { color: colors.muted, fontSize: 12, marginTop: 4 },
  fab: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.accent, borderRadius: radius.pill, bottom: 80, elevation: 5, flexDirection: 'row', gap: 7, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 13, position: 'absolute', shadowColor: colors.shadow, shadowOpacity: 0.25, shadowRadius: 10 },
  fabText: { color: colors.surface, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
