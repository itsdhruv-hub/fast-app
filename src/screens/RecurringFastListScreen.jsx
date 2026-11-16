import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CalendarDays, ChevronRight, Repeat2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/ui';

export default function RecurringFastListScreen({ navigation }) {
  const { events } = useApp();
  const groups = useMemo(() => {
    const grouped = new Map();
    events.filter((event) => event.isRecurring).forEach((event) => {
      const key = event.recurrenceGroupId || event.id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(event);
    });
    return Array.from(grouped.entries()).map(([key, items]) => ({
      key,
      items: items.sort((a, b) => a.fastingDate.localeCompare(b.fastingDate)),
      template: items[0],
    }));
  }, [events]);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={21} color={colors.ink} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>YOUR ROUTINE</Text>
          <Text style={styles.title}>Weekly fasts</Text>
        </View>
        <View style={styles.topSpacer} />
      </View>
      <Text style={styles.intro}>Keep your recurring fasting days simple and organized.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}><Repeat2 size={24} color={colors.accent} /></View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryKicker}>ACTIVE ROUTINES</Text>
          <Text style={styles.summaryTitle}>{groups.length} weekly schedule{groups.length === 1 ? '' : 's'}</Text>
          <Text style={styles.summaryBody}>Your selected fasting days, ready every week.</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your schedules</Text>
        <Text style={styles.sectionCount}>{groups.length}</Text>
      </View>

      {!groups.length ? <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}><CalendarDays size={24} color={colors.accent} /></View>
        <Text style={styles.emptyTitle}>No weekly fasts yet</Text>
        <Text style={styles.emptyBody}>Your recurring fasting days will appear here.</Text>
      </View> : groups.map((group) => {
        const dayName = group.template?.description?.replace('Every ', '') || 'Weekly';
        const isUnlimited = group.template?.recurrenceLimit === null || group.template?.recurrenceLimit === undefined;
        return <Pressable key={group.key} onPress={() => navigation.navigate('FastDetails', { eventId: group.template.id })} style={({ pressed }) => [styles.scheduleCard, pressed && styles.pressed]}>
          <View style={styles.scheduleHeader}>
            <View style={styles.scheduleIcon}><Repeat2 size={19} color={colors.accent} /></View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleTitle}>{group.template?.fastName || 'Weekly Fast'}</Text>
              <Text style={styles.scheduleSubtitle}>Repeats every {dayName}</Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleDetails}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>{dayName.slice(0, 3).toUpperCase()}</Text>
            </View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>FASTING DAY</Text>
              <Text style={styles.detailValue}>{dayName}</Text>
            </View>
            <View style={styles.limitPill}>
              <Text style={styles.limitLabel}>SCHEDULE</Text>
              <Text style={styles.limitValue}>{isUnlimited ? 'No limit' : `${group.template.recurrenceLimit} fasts`}</Text>
            </View>
          </View>
        </Pressable>;
      })}

      {groups.length > 0 && <Text style={styles.helperText}>Tap a schedule to edit or delete it.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  topSpacer: { width: 42 },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  titleBlock: { alignItems: 'center', flex: 1 },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 2 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10 },
  summaryCard: { alignItems: 'center', backgroundColor: '#FFF0E3', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', marginTop: spacing.lg, padding: spacing.md },
  summaryIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#F2C9A7', borderRadius: radius.pill, borderWidth: 1, height: 58, justifyContent: 'center', width: 58 },
  summaryCopy: { flex: 1, marginLeft: spacing.sm },
  summaryKicker: { color: colors.accentDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  summaryTitle: { color: '#54291D', fontSize: 19, fontWeight: '900', marginTop: 2 },
  summaryBody: { color: '#9C6650', fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionCount: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, color: colors.accentDark, fontSize: 12, fontWeight: '900', minWidth: 28, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textAlign: 'center' },
  scheduleCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  scheduleHeader: { alignItems: 'center', flexDirection: 'row' },
  scheduleIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 44, justifyContent: 'center', width: 44 },
  scheduleCopy: { flex: 1, marginLeft: 11 },
  scheduleTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  scheduleSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  scheduleDivider: { backgroundColor: colors.line, height: 1, marginVertical: spacing.md },
  scheduleDetails: { alignItems: 'center', flexDirection: 'row' },
  dayBadge: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, height: 48, justifyContent: 'center', width: 58 },
  dayBadgeText: { color: colors.surface, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  detailCopy: { flex: 1, marginLeft: 11 },
  detailLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  detailValue: { color: colors.accentDark, fontSize: 16, fontWeight: '900', marginTop: 4 },
  limitPill: { alignItems: 'flex-end', backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  limitLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  limitValue: { color: colors.accentDark, fontSize: 12, fontWeight: '900', marginTop: 3 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.sm, padding: spacing.xl },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 58, justifyContent: 'center', width: 58 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.md },
  emptyBody: { color: colors.muted, fontSize: 13, marginTop: 5 },
  helperText: { color: colors.muted, fontSize: 11, marginBottom: spacing.md, textAlign: 'center' },
  pressed: { opacity: 0.82 },
});
