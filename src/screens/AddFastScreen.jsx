import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Repeat2, Save } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { FAST_TYPES, WEEKDAYS } from '../constants/fastTypes';
import { useApp } from '../context/AppContext';
import { parseDateOnly, toDateOnly } from '../utils/dateUtils';
import { PrimaryButton, Screen } from '../components/ui';

export default function AddFastScreen({ navigation, route }) {
  const { events, createEvent, updateEvent } = useApp();
  const editing = useMemo(() => events.find((event) => event.id === route.params?.eventId), [events, route.params?.eventId]);
  const [fastName, setFastName] = useState(editing?.fastName || '');
  const [fastType, setFastType] = useState(editing?.fastType || FAST_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [date, setDate] = useState(parseDateOnly(editing?.fastingDate || toDateOnly(new Date())));
  const [description, setDescription] = useState(editing?.description || '');
  const [reminderEnabled, setReminderEnabled] = useState(editing?.reminderEnabled !== false);
  const [isRecurring, setIsRecurring] = useState(Boolean(editing?.isRecurring));
  const [recurrenceDay, setRecurrenceDay] = useState(editing?.recurrenceDay ?? 6);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit fast' : 'Add fast' });
  }, [editing, navigation]);

  const submit = async () => {
    const resolvedType = fastType === 'Other Custom Fast' ? customType.trim() : fastType;
    if (!fastName.trim() || !resolvedType || !date) {
      Alert.alert('Complete the details', 'Add a fast name, type and date to continue.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fastName: fastName.trim(),
        fastType: resolvedType,
        fastingDate: toDateOnly(date),
        description: description.trim(),
        reminderEnabled,
        isRecurring,
        recurrenceDay: isRecurring ? recurrenceDay : null,
        recurrenceGroupId: editing?.recurrenceGroupId || (isRecurring ? `group-${Date.now()}` : null),
      };
      if (editing) await updateEvent(editing.id, payload);
      else await createEvent(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.topBar}><Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft size={21} color={colors.ink} /></Pressable><Text style={styles.title}>{editing ? 'Edit fast' : 'Add a new fast'}</Text><View style={{ width: 40 }} /></View>
      <Text style={styles.intro}>{editing ? 'Keep the details current so your reminders stay accurate.' : 'Add a date to your personal fasting calendar.'}</Text>

      <Text style={styles.label}>FAST NAME</Text>
      <TextInput value={fastName} onChangeText={setFastName} placeholder="e.g. Poonam Fast" placeholderTextColor="#AA9D93" style={styles.input} />

      <Text style={styles.label}>FAST TYPE</Text>
      <View style={styles.chips}>{FAST_TYPES.map((type) => <Pressable key={type} onPress={() => setFastType(type)} style={[styles.chip, fastType === type && styles.selectedChip]}><Text style={[styles.chipText, fastType === type && styles.selectedChipText]}>{type}</Text></Pressable>)}</View>
      {fastType === 'Other Custom Fast' && <TextInput value={customType} onChangeText={setCustomType} placeholder="Name your custom fast" placeholderTextColor="#AA9D93" style={styles.input} />}

      <Text style={styles.label}>FASTING DATE</Text>
      <Pressable onPress={() => setShowDate(true)} style={styles.dateInput}><CalendarDays size={19} color={colors.accent} /><Text style={styles.dateText}>{date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text><ChevronDown size={18} color={colors.muted} /></Pressable>
      {showDate && <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={(_, selected) => { setShowDate(false); if (selected) setDate(selected); }} />}

      <Text style={styles.label}>NOTES <Text style={styles.optional}>OPTIONAL</Text></Text>
      <TextInput value={description} onChangeText={setDescription} multiline placeholder="Preparation notes or a personal intention" placeholderTextColor="#AA9D93" style={[styles.input, styles.notes]} />

      <View style={styles.switchRow}><View style={styles.switchLabel}><View style={styles.switchIcon}><CalendarDays size={17} color={colors.accent} /></View><View><Text style={styles.switchTitle}>Reminders</Text><Text style={styles.switchBody}>Notify me before and on the fasting day</Text></View></View><Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={reminderEnabled ? colors.accent : '#FAFAFA'} /></View>
      <View style={styles.switchRow}><View style={styles.switchLabel}><View style={styles.switchIcon}><Repeat2 size={17} color={colors.accent} /></View><View><Text style={styles.switchTitle}>Repeat weekly</Text><Text style={styles.switchBody}>Keep a rolling schedule for this weekday</Text></View></View><Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={isRecurring ? colors.accent : '#FAFAFA'} /></View>
      {isRecurring && <View style={styles.weekdayBox}><Text style={styles.weekdayTitle}>Repeat every</Text><View style={styles.weekdayRow}>{WEEKDAYS.map((day) => <Pressable key={day.value} onPress={() => setRecurrenceDay(day.value)} style={[styles.dayChip, recurrenceDay === day.value && styles.selectedDay]}><Text style={[styles.dayText, recurrenceDay === day.value && styles.selectedDayText]}>{day.short}</Text></Pressable>)}</View></View>}

      <PrimaryButton title={saving ? 'Saving…' : editing ? 'Save changes' : 'Add fast'} disabled={saving} onPress={submit} icon={editing ? <Save size={19} color={colors.surface} /> : <Check size={19} color={colors.surface} />} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 40, justifyContent: 'center', width: 40 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg, marginTop: 10 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8, marginTop: spacing.md },
  optional: { color: '#B7AAA0', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  input: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 50, paddingHorizontal: 14 },
  notes: { minHeight: 82, paddingTop: 14, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  selectedChip: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  selectedChipText: { color: colors.accentDark },
  dateInput: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, paddingHorizontal: 14 },
  dateText: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: '600' },
  switchRow: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, padding: spacing.sm },
  switchLabel: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 10 },
  switchIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 36, justifyContent: 'center', width: 36 },
  switchTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  switchBody: { color: colors.muted, fontSize: 11, marginTop: 2 },
  weekdayBox: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, marginTop: spacing.sm, padding: spacing.sm },
  weekdayTitle: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 9 },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 36, justifyContent: 'center', width: 38 },
  selectedDay: { backgroundColor: colors.accent },
  dayText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  selectedDayText: { color: colors.surface },
});
