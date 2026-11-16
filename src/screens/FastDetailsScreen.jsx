import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Bell, CalendarDays, Pencil, Repeat2, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { dateLabel, displayDate } from '../utils/dateUtils';
import { PrimaryButton, Screen } from '../components/ui';

export default function FastDetailsScreen({ navigation, route }) {
  const { events, deleteEvent } = useApp();
  const event = useMemo(() => events.find((item) => item.id === route.params?.eventId), [events, route.params?.eventId]);
  const weeklyGroup = useMemo(() => event?.isRecurring ? events.filter((item) => (item.recurrenceGroupId || item.id) === (event.recurrenceGroupId || event.id)) : [], [event, events]);

  if (!event) {
    return <Screen><View style={styles.topBar}><Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft size={21} color={colors.ink} /></Pressable><Text style={styles.title}>Fast details</Text><View style={styles.backPlaceholder} /></View><View style={styles.notFound}><Text style={styles.notFoundTitle}>Fast not found</Text><Text style={styles.notFoundBody}>This fast may have been deleted.</Text></View></Screen>;
  }

  const confirmDelete = () => Alert.alert('Delete this fast?', `Remove ${event.fastName} and cancel its reminders?`, [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEvent(event); navigation.goBack(); } },
  ]);

  return (
    <Screen>
      <View style={styles.topBar}><Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft size={21} color={colors.ink} /></Pressable><Text style={styles.title}>Fast details</Text><View style={styles.backPlaceholder} /></View>
      <Text style={styles.intro}>View and manage your scheduled fast.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}><CalendarDays size={28} color={colors.accent} /></View>
        <Text style={styles.fastName}>{event.fastName}</Text>
        <View style={styles.datePill}><CalendarDays size={16} color={colors.accentDark} /><Text style={styles.datePillText}>{displayDate(event.fastingDate, 'EEEE, d MMMM yyyy')}</Text></View>
      </View>

      <View style={styles.infoCard}>
        <DetailRow icon={<CalendarDays size={18} color={colors.accent} />} label="Date" value={dateLabel(event.fastingDate)} />
        <DetailRow icon={<Bell size={18} color={colors.accent} />} label="Reminders" value={event.reminderEnabled === false ? 'Off' : 'On'} />
        <DetailRow icon={<Repeat2 size={18} color={colors.accent} />} label="Schedule" value={event.isRecurring ? (event.recurrenceLimit ? `Weekly · ${weeklyGroup.filter((item) => item.status === 'upcoming').length} left` : 'Weekly · No limit') : 'One time'} last />
      </View>

      {event.description ? <View style={styles.notesCard}><Text style={styles.cardLabel}>NOTES</Text><Text style={styles.notesText}>{event.description}</Text></View> : null}

      <PrimaryButton title="Edit fast" onPress={() => navigation.navigate('AddFast', { eventId: event.id })} icon={<Pencil size={18} color={colors.surface} />} />
      <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Trash2 size={18} color={colors.red} /><Text style={styles.deleteText}>Delete fast</Text></Pressable>
    </Screen>
  );
}

function DetailRow({ icon, label, value, last }) {
  return <View style={[styles.detailRow, !last && styles.detailRowBorder]}><View style={styles.detailIcon}>{icon}</View><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 40, justifyContent: 'center', width: 40 },
  backPlaceholder: { width: 40 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  intro: { color: colors.muted, fontSize: 14, marginTop: 10 },
  summaryCard: { alignItems: 'center', backgroundColor: '#FFF1E5', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, elevation: 2, marginTop: spacing.lg, padding: spacing.lg, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  summaryIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#F2C9A7', borderRadius: radius.pill, borderWidth: 1, height: 64, justifyContent: 'center', width: 64 },
  fastName: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: spacing.sm, textAlign: 'center' },
  datePill: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, flexDirection: 'row', gap: 7, marginTop: spacing.md, paddingHorizontal: 13, paddingVertical: 9 },
  datePillText: { color: colors.accentDark, fontSize: 13, fontWeight: '800' },
  infoCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  detailRow: { alignItems: 'center', flexDirection: 'row', minHeight: 60 },
  detailRowBorder: { borderBottomColor: colors.line, borderBottomWidth: 1 },
  detailIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 34, justifyContent: 'center', marginRight: spacing.sm, width: 34 },
  detailLabel: { color: colors.muted, flex: 1, fontSize: 14, fontWeight: '700' },
  detailValue: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  notesCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  cardLabel: { color: colors.accentDark, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  notesText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  deleteButton: { alignItems: 'center', borderColor: colors.redSoft, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: spacing.sm, minHeight: 50 },
  deleteText: { color: colors.red, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.82 },
  notFound: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.lg, padding: spacing.xl },
  notFoundTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  notFoundBody: { color: colors.muted, fontSize: 14, marginTop: 6 },
});
