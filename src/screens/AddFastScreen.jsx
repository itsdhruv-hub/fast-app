import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Bell, CalendarDays, Check, ChevronDown, Save } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { parseDateOnly, toDateOnly } from '../utils/dateUtils';
import { PrimaryButton, Screen } from '../components/ui';

export default function AddFastScreen({ navigation, route }) {
  const { events, createEvent, updateEvent } = useApp();
  const editing = useMemo(() => events.find((event) => event.id === route.params?.eventId), [events, route.params?.eventId]);
  const [fastName, setFastName] = useState(editing?.fastName || '');
  const [date, setDate] = useState(parseDateOnly(editing?.fastingDate || toDateOnly(new Date())));
  const [description] = useState(editing?.description || '');
  const [reminderEnabled, setReminderEnabled] = useState(editing?.reminderEnabled !== false);
  const [isRecurring] = useState(Boolean(editing?.isRecurring));
  const [recurrenceDay] = useState(editing?.recurrenceDay ?? 6);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit fast' : 'Add fast' });
  }, [editing, navigation]);

  const submit = async () => {
    const name = fastName.trim();
    if (!name || !date) {
      Alert.alert('Complete the details', 'Add a fast name and date to continue.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fastName: name,
        fastType: name,
        fastingDate: toDateOnly(date),
        description: description.trim(),
        reminderEnabled,
        isRecurring,
        recurrenceDay: isRecurring ? recurrenceDay : null,
        recurrenceGroupId: editing?.recurrenceGroupId || (isRecurring ? `group-${Date.now()}` : null),
        recurrenceLimit: editing?.recurrenceLimit ?? null,
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
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={21} color={colors.ink} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{editing ? 'UPDATE YOUR FAST' : 'PLAN YOUR FAST'}</Text>
          <Text style={styles.title}>{editing ? 'Edit fast' : 'Add a new fast'}</Text>
        </View>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}><CalendarDays size={23} color={colors.accent} /></View>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>{editing ? 'Keep your schedule updated' : 'Create a personal reminder'}</Text>
          <Text style={styles.introBody}>{editing ? 'Update the details below whenever you need.' : 'Add your fast once and we’ll keep it on your calendar.'}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Fast details</Text>
        <Text style={styles.label}>FAST NAME</Text>
        <TextInput
          value={fastName}
          onChangeText={setFastName}
          placeholder="e.g. Poonam Fast"
          placeholderTextColor="#AA9D93"
          style={styles.input}
          selectionColor={colors.accent}
        />

        <Text style={styles.label}>FASTING DATE</Text>
        <Pressable onPress={() => setShowDate(true)} style={({ pressed }) => [styles.dateInput, pressed && styles.pressed]}>
          <View style={styles.dateIcon}><CalendarDays size={19} color={colors.accent} /></View>
          <View style={styles.dateCopy}>
            <Text style={styles.dateCaption}>Scheduled for</Text>
            <Text style={styles.dateText}>{date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <ChevronDown size={18} color={colors.muted} />
        </Pressable>
      </View>

      {showDate && <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={(_, selected) => { setShowDate(false); if (selected) setDate(selected); }} />}

      <View style={styles.reminderCard}>
        <View style={styles.switchLabel}>
          <View style={styles.switchIcon}><Bell size={18} color={colors.accent} /></View>
          <View style={styles.reminderCopy}>
            <Text style={styles.switchTitle}>Reminder notifications</Text>
            <Text style={styles.switchBody}>{reminderEnabled ? 'You’ll be notified before your fast.' : 'Reminders are turned off for this fast.'}</Text>
          </View>
        </View>
        <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={reminderEnabled ? colors.accent : '#FAFAFA'} />
      </View>

      <PrimaryButton title={saving ? 'Saving...' : editing ? 'Save changes' : 'Add fast'} disabled={saving} onPress={submit} icon={editing ? <Save size={19} color={colors.surface} /> : <Check size={19} color={colors.surface} />} />
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
  introCard: { alignItems: 'center', backgroundColor: '#FFF0E3', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', marginTop: spacing.lg, padding: spacing.md },
  introIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#F2C9A7', borderRadius: radius.pill, borderWidth: 1, height: 52, justifyContent: 'center', width: 52 },
  introCopy: { flex: 1, marginLeft: spacing.sm },
  introTitle: { color: '#54291D', fontSize: 15, fontWeight: '900' },
  introBody: { color: '#9C6650', fontSize: 11, lineHeight: 16, marginTop: 3 },
  formCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.lg, padding: spacing.md },
  formTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, color: colors.ink, fontSize: 16, fontWeight: '600', minHeight: 54, paddingHorizontal: 14 },
  dateInput: { alignItems: 'center', backgroundColor: colors.background, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', minHeight: 64, paddingHorizontal: 10 },
  dateIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  dateCopy: { flex: 1, marginLeft: 10 },
  dateCaption: { color: colors.muted, fontSize: 10, fontWeight: '700', marginBottom: 2 },
  dateText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  reminderCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, padding: spacing.md },
  switchLabel: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  switchIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  reminderCopy: { flex: 1, marginLeft: 10 },
  switchTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  switchBody: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  pressed: { opacity: 0.82 },
});
