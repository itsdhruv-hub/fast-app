import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Bell, BellOff, ChevronRight, Clock3, Code2, Settings2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/ui';

export default function SettingsScreen({ navigation }) {
  const { settings, permission, updateSettings, requestPermission } = useApp();
  const activeReminderCount = (settings.reminderTimes || []).filter((_, index) => (settings.reminderTimeEnabled || [])[index] !== false).length
    + [[settings.morningTime, settings.morningReminderEnabled], [settings.eveningTime, settings.eveningReminderEnabled], [settings.previousNightTime, settings.previousNightReminderEnabled]].filter(([time, enabled]) => time && enabled !== false).length;
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerIconOuter}><View style={styles.headerIconMiddle}><View style={styles.headerIcon}><Settings2 size={23} color={colors.accentDark} /></View></View></View>
          <View style={styles.headerCopy}><Text style={styles.eyebrow}>PERSONALISE</Text><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Make your fasting plan feel personal</Text></View>
        </View>
      </View>
      <View style={styles.statusCard}><View style={[styles.statusIcon, permission.granted ? styles.statusGood : styles.statusOff]}>{permission.granted ? <Bell size={19} color={colors.green} /> : <BellOff size={19} color={colors.accentDark} />}</View><View style={{ flex: 1 }}><Text style={styles.statusTitle}>{permission.granted ? 'Notifications are ready' : 'Notifications need access'}</Text><Text style={styles.statusBody}>{permission.granted ? 'Your reminders can arrive while the app is closed.' : 'Allow notifications to receive fasting reminders.'}</Text></View>{!permission.granted && <Pressable onPress={requestPermission}><Text style={styles.enable}>Enable</Text></Pressable>}</View>
      <SettingsSectionTitle title="Reminder controls" />
      <SettingRow icon={<Bell size={18} color={colors.accent} />} title="Enable reminders" description="Schedule local reminders for your fasts" right={<Switch value={settings.remindersEnabled} onValueChange={(value) => updateSettings({ remindersEnabled: value })} trackColor={{ false: '#DDD5CC', true: '#EAB790' }} thumbColor={settings.remindersEnabled ? colors.accent : '#FAFAFA'} />} />
      <SettingsSectionTitle title="Reminder times" />
      <Pressable onPress={() => navigation.navigate('ReminderTimes')} style={({ pressed }) => [styles.reminderLink, pressed && styles.pressed]}><View style={styles.reminderLinkIcon}><Clock3 size={19} color={colors.accent} /></View><View style={styles.reminderLinkText}><Text style={styles.reminderLinkTitle}>Manage your reminders</Text><Text style={styles.reminderLinkDescription}>Add, edit, pause or delete reminder times</Text></View><View style={styles.reminderCount}><Text style={styles.reminderCountText}>{activeReminderCount}</Text></View><ChevronRight size={19} color={colors.muted} /></Pressable>
      <SettingsSectionTitle title="Developer" />
      <View style={styles.developerCard}>
        <View style={styles.developerHeader}><View style={styles.developerIcon}><Code2 size={18} color={colors.accent} /></View><View><Text style={styles.developerEyebrow}>DEVELOPMENT TEAM</Text><Text style={styles.developerIntro}>Built with care</Text></View></View>
        <View style={styles.developerPeople}><View style={styles.personRow}><View style={styles.initials}><Text style={styles.initialsText}>CS</Text></View><Text style={styles.personName}>Chetan Suthar</Text></View><View style={styles.personRow}><View style={styles.initials}><Text style={styles.initialsText}>DP</Text></View><Text style={styles.personName}>Dhruv Parekh</Text></View></View>
      </View>
      <Text style={styles.footer}>App version 1.0.0</Text>
    </Screen>
  );
}

const SettingRow = ({ icon, title, description, right }) => <View style={styles.settingRow}><View style={styles.settingIcon}>{icon}</View><View style={styles.settingText}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View>{right}</View>;
const SettingsSectionTitle = ({ title }) => <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text></View>;
const styles = StyleSheet.create({
  header: { backgroundColor: '#FFF0E3', borderColor: '#F1D9C5', borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 13 },
  headerBrand: { alignItems: 'center', flexDirection: 'row' },
  headerIconOuter: { alignItems: 'center', backgroundColor: '#FBE0CC', borderRadius: radius.pill, height: 58, justifyContent: 'center', marginRight: spacing.sm, width: 58 },
  headerIconMiddle: { alignItems: 'center', backgroundColor: '#F6C7A5', borderRadius: radius.pill, height: 48, justifyContent: 'center', width: 48 },
  headerIcon: { alignItems: 'center', backgroundColor: '#FFF8F1', borderRadius: radius.pill, height: 38, justifyContent: 'center', width: 38 },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#54291D', fontSize: 23, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { color: '#9C6650', fontSize: 11, marginTop: 4 },
  statusCard: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.lg, flexDirection: 'row', gap: 10, padding: spacing.md },
  statusIcon: { alignItems: 'center', borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
  statusGood: { backgroundColor: colors.greenSoft },
  statusOff: { backgroundColor: '#F3D6BC' },
  statusTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  statusBody: { color: colors.muted, fontSize: 11, marginTop: 3 },
  enable: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  sectionHeader: { marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  settingRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 8, minHeight: 76, padding: spacing.sm },
  settingIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 36, justifyContent: 'center', width: 36 },
  settingText: { flex: 1 },
  settingTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  settingDescription: { color: colors.muted, fontSize: 11, marginTop: 3 },
  reminderLink: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.sm, minHeight: 76, padding: spacing.sm },
  reminderLinkIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
  reminderLinkText: { flex: 1, marginLeft: 10 },
  reminderLinkTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  reminderLinkDescription: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  reminderCount: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 28, justifyContent: 'center', marginRight: 8, minWidth: 28, paddingHorizontal: 7 },
  reminderCountText: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.8 },
  developerCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  developerHeader: { alignItems: 'center', flexDirection: 'row' },
  developerIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 38, justifyContent: 'center', width: 38 },
  developerEyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 10 },
  developerIntro: { color: colors.muted, fontSize: 12, marginLeft: 10, marginTop: 3 },
  developerPeople: { borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 10, marginTop: spacing.sm, paddingTop: spacing.sm },
  personRow: { alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.sm, flex: 1, flexDirection: 'row', padding: 8 },
  initials: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 30, justifyContent: 'center', width: 30 },
  initialsText: { color: colors.accentDark, fontSize: 10, fontWeight: '900' },
  personName: { color: colors.ink, flex: 1, fontSize: 11, fontWeight: '800', marginLeft: 7 },
  footer: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: spacing.lg, textAlign: 'center' },
});
