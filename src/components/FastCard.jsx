import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, CalendarDays, Check, CircleAlert, Repeat2, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { dateLabel, displayDate } from '../utils/dateUtils';
import { TextButton } from './ui';

export default function FastCard({ event, onPress, onSave, onDelete, compact = false }) {
  const completed = event.status === 'completed';
  const saved = event.status === 'saved';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <View style={[styles.dateBox, completed && styles.completedDate]}>
        <Text style={styles.dateDay}>{displayDate(event.fastingDate, 'd')}</Text>
        <Text style={styles.dateMonth}>{displayDate(event.fastingDate, 'MMM').toUpperCase()}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{event.fastName}</Text>
          {event.isRecurring && <Repeat2 size={15} color={colors.accent} />}
        </View>
        <Text style={styles.type}>{event.fastType}</Text>
        <View style={styles.metaRow}>
          {completed || saved ? <Check size={14} color={colors.green} /> : <CalendarDays size={14} color={colors.muted} />}
          <Text style={styles.meta}>{saved ? 'Saved in history' : completed ? 'Needs your review' : dateLabel(event.fastingDate)}</Text>
          {event.reminderEnabled && !completed && !saved && <Bell size={14} color={colors.muted} />}
        </View>
        {completed && !saved && (
          <View style={styles.actions}>
            <TextButton title="Save to history" onPress={onSave} />
            <TextButton title="Delete" color={colors.red} onPress={onDelete} />
          </View>
        )}
      </View>
      {completed && !saved ? <CircleAlert size={20} color={colors.accent} /> : !compact && <View style={styles.statusDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', marginBottom: 10, minHeight: 84, padding: spacing.sm, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  compact: { minHeight: 72 },
  pressed: { opacity: 0.82 },
  dateBox: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, justifyContent: 'center', marginRight: spacing.sm, minHeight: 64, width: 58 },
  completedDate: { backgroundColor: colors.greenSoft },
  dateDay: { color: colors.accentDark, fontSize: 22, fontWeight: '900' },
  dateMonth: { color: colors.accentDark, fontSize: 11, fontWeight: '800', marginTop: 1 },
  details: { flex: 1 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  title: { color: colors.ink, flexShrink: 1, fontSize: 15, fontWeight: '800' },
  type: { color: colors.muted, fontSize: 12, marginTop: 3 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 8 },
  meta: { color: colors.muted, flex: 1, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 18, marginTop: 10 },
  statusDot: { backgroundColor: colors.accent, borderRadius: 5, height: 8, width: 8 },
});
