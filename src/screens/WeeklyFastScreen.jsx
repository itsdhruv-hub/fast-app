import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, CalendarDays, Check, ChevronRight, Repeat2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { WEEKDAYS } from '../constants/fastTypes';
import { useApp } from '../context/AppContext';
import { toDateOnly } from '../utils/dateUtils';
import { PrimaryButton, Screen } from '../components/ui';

const nextWeekdayDate = (weekday) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const distance = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + distance);
  return toDateOnly(date);
};

export default function WeeklyFastScreen({ navigation }) {
  const { createEvent } = useApp();
  const [recurrenceDay, setRecurrenceDay] = useState(new Date().getDay());
  const [limitMode, setLimitMode] = useState('fixed');
  const [totalCount, setTotalCount] = useState('5');
  const [saving, setSaving] = useState(false);
  const selectedDay = useMemo(() => WEEKDAYS.find((day) => day.value === recurrenceDay), [recurrenceDay]);
  const generatedName = `${selectedDay?.label || 'Weekly'} Fast`;

  const submit = async () => {
    const count = Number(totalCount);
    if (limitMode === 'fixed' && (!Number.isInteger(count) || count < 1)) {
      Alert.alert('Enter a valid total', 'Choose how many weekly fasts you want to schedule.');
      return;
    }
    setSaving(true);
    try {
      await createEvent({
        fastName: generatedName,
        fastType: generatedName,
        fastingDate: nextWeekdayDate(recurrenceDay),
        description: `Every ${selectedDay?.label || 'week'}`,
        reminderEnabled: true,
        isRecurring: true,
        recurrenceDay,
        recurrenceGroupId: `weekly-${Date.now()}`,
        recurrenceLimit: limitMode === 'fixed' ? count : null,
      });
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
          <Text style={styles.eyebrow}>REPEAT YOUR FAST</Text>
          <Text style={styles.title}>Weekly fast</Text>
        </View>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}><Repeat2 size={23} color={colors.accent} /></View>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>Build a weekly routine</Text>
          <Text style={styles.introBody}>Choose one day and we’ll schedule the fast automatically.</Text>
        </View>
      </View>

      <View style={styles.scheduleCard}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><CalendarDays size={19} color={colors.accent} /></View>
          <View style={styles.sectionCopy}>
            <Text style={styles.cardTitle}>Repeat every week</Text>
            <Text style={styles.cardBody}>Select the day for your weekly fast.</Text>
          </View>
        </View>
        <View style={styles.selectedPreview}>
          <Text style={styles.previewLabel}>YOUR FAST</Text>
          <Text style={styles.previewName}>{generatedName}</Text>
        </View>
        <Text style={styles.label}>REPEAT ON</Text>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day) => (
            <Pressable key={day.value} onPress={() => setRecurrenceDay(day.value)} style={[styles.dayChip, recurrenceDay === day.value && styles.selectedDay]}>
              <Text style={[styles.dayText, recurrenceDay === day.value && styles.selectedDayText]}>{day.short}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.lengthSection}>
        <Text style={styles.label}>SCHEDULE LENGTH</Text>
        <View style={styles.limitOptions}>
          <Pressable onPress={() => setLimitMode('fixed')} style={[styles.limitOption, limitMode === 'fixed' && styles.selectedLimit]}>
            <View style={styles.optionDot}>{limitMode === 'fixed' && <View style={styles.optionDotInner} />}</View>
            <View style={styles.limitCopy}><Text style={[styles.limitTitle, limitMode === 'fixed' && styles.selectedLimitText]}>Fixed total</Text><Text style={styles.limitBody}>Stop after a set number of fasts</Text></View>
            <ChevronRight size={18} color={limitMode === 'fixed' ? colors.accent : colors.muted} />
          </Pressable>
          <Pressable onPress={() => setLimitMode('unlimited')} style={[styles.limitOption, limitMode === 'unlimited' && styles.selectedLimit]}>
            <View style={styles.optionDot}>{limitMode === 'unlimited' && <View style={styles.optionDotInner} />}</View>
            <View style={styles.limitCopy}><Text style={[styles.limitTitle, limitMode === 'unlimited' && styles.selectedLimitText]}>No limit</Text><Text style={styles.limitBody}>Keep repeating until you delete it</Text></View>
            <ChevronRight size={18} color={limitMode === 'unlimited' ? colors.accent : colors.muted} />
          </Pressable>
        </View>
      </View>

      {limitMode === 'fixed' && <View style={styles.totalBox}><View style={styles.totalHeader}><Text style={styles.totalLabel}>TOTAL FASTS</Text><Text style={styles.totalHint}>Remaining count reduces automatically</Text></View><TextInput value={totalCount} onChangeText={(value) => setTotalCount(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" style={styles.totalInput} placeholder="5" placeholderTextColor="#AA9D93" /></View>}
      {limitMode === 'unlimited' && <View style={styles.unlimitedNote}><Repeat2 size={17} color={colors.accent} /><Text style={styles.unlimitedText}>This schedule will continue until you delete it.</Text></View>}

      <PrimaryButton title={saving ? 'Saving...' : 'Create weekly fast'} disabled={saving} onPress={submit} icon={<Check size={19} color={colors.surface} />} />
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
  scheduleCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.lg, padding: spacing.md },
  sectionHeading: { alignItems: 'center', flexDirection: 'row' },
  sectionIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  sectionCopy: { flex: 1, marginLeft: 10 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  cardBody: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  selectedPreview: { backgroundColor: colors.background, borderRadius: radius.sm, marginTop: spacing.md, padding: spacing.sm },
  previewLabel: { color: colors.accentDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  previewName: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 2 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8, marginTop: spacing.md },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: { alignItems: 'center', backgroundColor: colors.background, borderColor: colors.line, borderRadius: radius.pill, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  selectedDay: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  selectedDayText: { color: colors.surface },
  lengthSection: { marginTop: spacing.md },
  limitOptions: { gap: 8 },
  limitOption: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: spacing.sm },
  selectedLimit: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  optionDot: { alignItems: 'center', borderColor: colors.line, borderRadius: radius.pill, borderWidth: 2, height: 20, justifyContent: 'center', width: 20 },
  optionDotInner: { backgroundColor: colors.accent, borderRadius: radius.pill, height: 10, width: 10 },
  limitCopy: { flex: 1, marginLeft: 10 },
  limitTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  selectedLimitText: { color: colors.accentDark },
  limitBody: { color: colors.muted, fontSize: 11, marginTop: 3 },
  totalBox: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.sm, padding: spacing.md },
  totalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  totalHint: { color: colors.muted, flex: 1, fontSize: 10, marginLeft: 10, textAlign: 'right' },
  totalInput: { borderBottomColor: colors.accent, borderBottomWidth: 1, color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5, paddingVertical: 4 },
  unlimitedNote: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, flexDirection: 'row', gap: 8, marginTop: spacing.sm, padding: spacing.md },
  unlimitedText: { color: colors.accentDark, flex: 1, fontSize: 12, fontWeight: '700' },
});
