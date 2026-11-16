import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, BellOff, CheckCircle2, Clock3, Info, MapPin, ShieldCheck } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/dateUtils';
import { Screen, SectionTitle } from '../components/ui';

const timeDate = (value) => { const [hour, minute] = value.split(':').map(Number); const result = new Date(); result.setHours(hour, minute, 0, 0); return result; };
const dateTimeValue = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function SettingsScreen() {
  const { settings, permission, updateSettings, requestPermission } = useApp();
  const [picker, setPicker] = useState(null);
  const chooseTime = (key, value) => { setPicker({ key, value }); };
  return (
    <Screen>
      <View style={styles.header}><View><Text style={styles.eyebrow}>PERSONALISE</Text><Text style={styles.title}>Settings</Text></View><View style={styles.icon}><ShieldCheck size={20} color={colors.accent} /></View></View>
      <View style={styles.statusCard}><View style={[styles.statusIcon, permission.granted ? styles.statusGood : styles.statusOff]}>{permission.granted ? <Bell size={19} color={colors.green} /> : <BellOff size={19} color={colors.accentDark} />}</View><View style={{ flex: 1 }}><Text style={styles.statusTitle}>{permission.granted ? 'Notifications are ready' : 'Notifications need access'}</Text><Text style={styles.statusBody}>{permission.granted ? 'Your reminders can arrive while the app is closed.' : 'Allow notifications to receive fasting reminders.'}</Text></View>{!permission.granted && <Pressable onPress={requestPermission}><Text style={styles.enable}>Enable</Text></Pressable>}</View>
      <SectionTitle title="Reminder controls" />
      <SettingRow icon={<Bell size={18} color={colors.accent} />} title="Enable reminders" description="Schedule local reminders for your fasts" right={<Switch value={settings.remindersEnabled} onValueChange={(value) => updateSettings({ remindersEnabled: value })} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={settings.remindersEnabled ? colors.accent : '#FAFAFA'} />} />
      <SettingRow icon={<Clock3 size={18} color={colors.accent} />} title="Daily reminder frequency" description="Choose 3 or 4 reminders before a fast" right={<View style={styles.frequency}><Pressable onPress={() => updateSettings({ dailyReminderFrequency: 3 })} style={[styles.frequencyButton, settings.dailyReminderFrequency === 3 && styles.frequencyActive]}><Text style={[styles.frequencyText, settings.dailyReminderFrequency === 3 && styles.frequencyActiveText]}>3×</Text></Pressable><Pressable onPress={() => updateSettings({ dailyReminderFrequency: 4 })} style={[styles.frequencyButton, settings.dailyReminderFrequency === 4 && styles.frequencyActive]}><Text style={[styles.frequencyText, settings.dailyReminderFrequency === 4 && styles.frequencyActiveText]}>4×</Text></Pressable></View>} />
      <SectionTitle title="Reminder times" />
      {settings.reminderTimes.map((value, index) => <TimeRow key={`${value}-${index}`} label={`Daily reminder ${index + 1}`} value={value} onPress={() => chooseTime(`reminderTimes.${index}`, value)} />)}
      <TimeRow label="Morning reminder" value={settings.morningTime} onPress={() => chooseTime('morningTime', settings.morningTime)} />
      <TimeRow label="Evening reminder" value={settings.eveningTime} onPress={() => chooseTime('eveningTime', settings.eveningTime)} />
      <TimeRow label="Night before" value={settings.previousNightTime} onPress={() => chooseTime('previousNightTime', settings.previousNightTime)} />
      {picker && <DateTimePicker value={timeDate(picker.value)} mode="time" onChange={(_, selected) => { setPicker(null); if (selected) { const value = dateTimeValue(selected); if (picker.key.startsWith('reminderTimes.')) { const index = Number(picker.key.split('.')[1]); const reminderTimes = [...settings.reminderTimes]; reminderTimes[index] = value; updateSettings({ reminderTimes }); } else updateSettings({ [picker.key]: value }); } }} />}
      <SectionTitle title="About" />
      <View style={styles.about}><View style={styles.aboutRow}><MapPin size={17} color={colors.muted} /><Text style={styles.aboutLabel}>Timezone</Text><Text style={styles.aboutValue}>{settings.timezone}</Text></View><View style={styles.aboutRow}><Info size={17} color={colors.muted} /><Text style={styles.aboutLabel}>App version</Text><Text style={styles.aboutValue}>1.0.0</Text></View><View style={styles.aboutRow}><CheckCircle2 size={17} color={colors.green} /><Text style={styles.aboutLabel}>Storage</Text><Text style={styles.aboutValue}>Personal mode</Text></View></View>
      <Text style={styles.footer}>Fasting Reminder keeps your schedule personal and focused. Local reminders work without keeping the app open.</Text>
    </Screen>
  );
}

const SettingRow = ({ icon, title, description, right }) => <View style={styles.settingRow}><View style={styles.settingIcon}>{icon}</View><View style={styles.settingText}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View>{right}</View>;
const TimeRow = ({ label, value, onPress }) => <Pressable onPress={onPress} style={styles.timeRow}><Text style={styles.timeLabel}>{label}</Text><Text style={styles.timeValue}>{formatTime(value)}</Text></Pressable>;

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 4 },
  icon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
  statusCard: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, flexDirection: 'row', gap: 10, padding: spacing.sm },
  statusIcon: { alignItems: 'center', borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
  statusGood: { backgroundColor: colors.greenSoft },
  statusOff: { backgroundColor: '#F3D6BC' },
  statusTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  statusBody: { color: colors.muted, fontSize: 11, marginTop: 3 },
  enable: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  settingRow: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, flexDirection: 'row', gap: 10, marginBottom: 8, padding: spacing.sm },
  settingIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 36, justifyContent: 'center', width: 36 },
  settingText: { flex: 1 },
  settingTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  settingDescription: { color: colors.muted, fontSize: 11, marginTop: 3 },
  frequency: { backgroundColor: colors.surfaceMuted, borderRadius: 8, flexDirection: 'row', padding: 3 },
  frequencyButton: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  frequencyActive: { backgroundColor: colors.surface },
  frequencyText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  frequencyActiveText: { color: colors.accentDark },
  timeRow: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: spacing.md },
  timeLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  timeValue: { color: colors.accentDark, fontSize: 14, fontWeight: '900' },
  about: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md },
  aboutRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 48 },
  aboutLabel: { color: colors.muted, flex: 1, fontSize: 13 },
  aboutValue: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  footer: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: spacing.lg, textAlign: 'center' },
});
