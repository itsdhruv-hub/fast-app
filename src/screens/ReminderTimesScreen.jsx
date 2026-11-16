import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Bell, Clock3, Plus, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/dateUtils';
import { Screen } from '../components/ui';

const timeDate = (value = '08:00') => {
  const [hour, minute] = value.split(':').map(Number);
  const result = new Date();
  result.setHours(hour, minute, 0, 0);
  return result;
};

const dateTimeValue = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function ReminderTimesScreen({ navigation }) {
  const { settings, updateSettings } = useApp();
  const [picker, setPicker] = useState(null);
  const dailyTimes = settings.reminderTimes || [];
  const dailyEnabled = settings.reminderTimeEnabled || [];
  const specialTimes = useMemo(() => [
    { key: 'morningTime', enabledKey: 'morningReminderEnabled', label: 'Fasting day morning', value: settings.morningTime, enabled: settings.morningReminderEnabled !== false },
    { key: 'eveningTime', enabledKey: 'eveningReminderEnabled', label: 'Fasting day evening', value: settings.eveningTime, enabled: settings.eveningReminderEnabled !== false },
    { key: 'previousNightTime', enabledKey: 'previousNightReminderEnabled', label: 'Night before fasting day', value: settings.previousNightTime, enabled: settings.previousNightReminderEnabled !== false },
  ], [settings.eveningReminderEnabled, settings.eveningTime, settings.morningReminderEnabled, settings.morningTime, settings.previousNightReminderEnabled, settings.previousNightTime]);
  const activeCount = dailyTimes.filter((_, index) => dailyEnabled[index] !== false).length + specialTimes.filter((item) => item.value && item.enabled).length;

  const openPicker = (key, value, index = null) => setPicker({ key, value: value || '08:00', index });

  const savePickerValue = (_, selected) => {
    const currentPicker = picker;
    setPicker(null);
    if (!selected || !currentPicker) return;
    const value = dateTimeValue(selected);
    if (currentPicker.key === 'reminderTimes') {
      const nextTimes = [...dailyTimes];
      if (nextTimes.some((item, index) => item === value && index !== currentPicker.index)) {
        Alert.alert('Reminder already exists', 'Choose a different time.');
        return;
      }
      if (currentPicker.index === null) nextTimes.push(value);
      else nextTimes[currentPicker.index] = value;
      const nextEnabled = [...dailyEnabled];
      if (currentPicker.index === null) nextEnabled.push(true);
      updateSettings({ reminderTimes: nextTimes, reminderTimeEnabled: nextEnabled });
      return;
    }
    updateSettings({ [currentPicker.key]: value });
  };

  const toggleDailyReminder = (index, enabled) => updateSettings({ reminderTimeEnabled: dailyTimes.map((_, itemIndex) => itemIndex === index ? enabled : dailyEnabled[itemIndex] !== false) });
  const toggleSpecialReminder = (reminder, enabled) => updateSettings({ [reminder.enabledKey]: enabled });

  const deleteDailyReminder = (index) => {
    Alert.alert('Delete this reminder?', `Remove daily reminder ${index + 1}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateSettings({ reminderTimes: dailyTimes.filter((_, itemIndex) => itemIndex !== index), reminderTimeEnabled: dailyEnabled.filter((_, itemIndex) => itemIndex !== index) }) },
    ]);
  };

  const deleteSpecialReminder = (reminder) => {
    Alert.alert('Delete this reminder?', `Remove ${reminder.label.toLowerCase()} from your schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => updateSettings({ [reminder.key]: null, [reminder.enabledKey]: false }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Screen contentStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft size={21} color={colors.ink} /></Pressable>
          <View style={styles.titleBlock}><Text style={styles.eyebrow}>YOUR SCHEDULE</Text><Text style={styles.title}>Reminders</Text></View>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}><Bell size={23} color={colors.accent} /></View>
          <View style={styles.summaryCopy}><Text style={styles.summaryKicker}>FASTING REMINDERS</Text><Text style={styles.summaryTitle}>Stay on track</Text><Text style={styles.summaryBody}>Choose when your reminders should arrive.</Text></View>
          <View style={styles.countBadge}><Text style={styles.countNumber}>{activeCount}</Text><Text style={styles.countLabel}>active</Text></View>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Reminder times</Text><Text style={styles.sectionBody}>Tap a time to edit it</Text></View><Text style={styles.sectionCount}>{dailyTimes.length + specialTimes.filter((item) => item.value).length}</Text></View>

        <View style={styles.alarmList}>
          {dailyTimes.map((value, index) => <ReminderRow key={`${value}-${index}`} value={value} label="Daily reminder" enabled={dailyEnabled[index] !== false} onPress={() => openPicker('reminderTimes', value, index)} onToggle={(enabled) => toggleDailyReminder(index, enabled)} onDelete={() => deleteDailyReminder(index)} />)}
          {specialTimes.filter((item) => item.value).map((reminder) => <ReminderRow key={reminder.key} value={reminder.value} label={reminder.label} enabled={reminder.enabled} onPress={() => openPicker(reminder.key, reminder.value)} onToggle={(enabled) => toggleSpecialReminder(reminder, enabled)} onDelete={() => deleteSpecialReminder(reminder)} />)}
          {!dailyTimes.length && !specialTimes.some((item) => item.value) && <View style={styles.empty}><View style={styles.emptyIcon}><Bell size={24} color={colors.accent} /></View><Text style={styles.emptyTitle}>No reminders yet</Text><Text style={styles.emptyBody}>Add a time to get a notification for your fast.</Text></View>}
        </View>
      </Screen>

      <Pressable accessibilityLabel="Add reminder" onPress={() => openPicker('reminderTimes', '10:00')} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Plus size={20} color={colors.surface} /><Text style={styles.addButtonText}>Add reminder</Text></Pressable>
      {picker && <DateTimePicker value={timeDate(picker.value)} mode="time" onChange={savePickerValue} />}
    </View>
  );
}

const ReminderRow = ({ value, label, enabled, onPress, onToggle, onDelete }) => {
  const [clock, period] = formatTime(value).split(' ');
  return <View style={[styles.alarmRow, !enabled && styles.disabledRow]}>
    <View style={styles.clockIcon}><Clock3 size={18} color={enabled ? colors.accent : colors.muted} /></View>
    <Pressable onPress={onPress} style={styles.alarmMain}><Text style={styles.alarmTime}>{clock} <Text style={styles.alarmPeriod}>{period}</Text></Text><Text style={styles.alarmLabel}>{label}</Text></Pressable>
    <Pressable accessibilityLabel="Delete reminder" hitSlop={8} onPress={onDelete} style={styles.deleteButton}><Trash2 size={16} color={enabled ? colors.muted : colors.line} /></Pressable>
    <Switch value={enabled} onValueChange={onToggle} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={enabled ? colors.accent : '#FAFAFA'} />
  </View>;
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 100 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  topSpacer: { width: 42 },
  titleBlock: { alignItems: 'center', flex: 1 },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 2 },
  summaryCard: { alignItems: 'center', backgroundColor: '#FFF0E3', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', marginTop: spacing.lg, padding: spacing.md },
  summaryIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#F2C9A7', borderRadius: radius.pill, borderWidth: 1, height: 56, justifyContent: 'center', width: 56 },
  summaryCopy: { flex: 1, marginLeft: spacing.sm },
  summaryKicker: { color: colors.accentDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  summaryTitle: { color: '#54291D', fontSize: 19, fontWeight: '900', marginTop: 2 },
  summaryBody: { color: '#9C6650', fontSize: 11, lineHeight: 16, marginTop: 3 },
  countBadge: { alignItems: 'center', backgroundColor: '#FAD9BF', borderRadius: radius.pill, height: 58, justifyContent: 'center', width: 58 },
  countNumber: { color: colors.accentDark, fontSize: 19, fontWeight: '900' },
  countLabel: { color: '#9C6650', fontSize: 9, fontWeight: '800', marginTop: 1 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionBody: { color: colors.muted, fontSize: 11, marginTop: 3 },
  sectionCount: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, color: colors.accentDark, fontSize: 12, fontWeight: '900', minWidth: 28, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textAlign: 'center' },
  alarmList: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', paddingHorizontal: spacing.sm },
  alarmRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', minHeight: 78, paddingVertical: spacing.sm },
  alarmRowLast: { borderBottomWidth: 0 },
  disabledRow: { opacity: 0.48 },
  clockIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
  alarmMain: { flex: 1, justifyContent: 'center', marginLeft: 11, paddingVertical: 3 },
  alarmTime: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  alarmPeriod: { color: colors.muted, fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  alarmLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },
  deleteButton: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, height: 34, justifyContent: 'center', marginRight: 8, width: 34 },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 56, justifyContent: 'center', width: 56 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.md },
  emptyBody: { color: colors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' },
  addButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.accent, borderRadius: radius.pill, bottom: 22, elevation: 5, flexDirection: 'row', gap: 7, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 13, position: 'absolute', shadowColor: colors.shadow, shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } },
  addButtonText: { color: colors.surface, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
