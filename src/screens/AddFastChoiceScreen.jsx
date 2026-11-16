import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Bell, CalendarDays, ChevronRight, Repeat2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { Screen } from '../components/ui';

export default function AddFastChoiceScreen({ navigation }) {
  return (
    <Screen>
      <View style={styles.topBar}><Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft size={21} color={colors.ink} /></Pressable><Text style={styles.title}>Add a fast</Text><View style={styles.spacer} /></View>
      <View style={styles.heroCard}><View style={styles.heroIcon}><CalendarDays size={26} color={colors.accent} /></View><View style={styles.heroCopy}><Text style={styles.heroEyebrow}>PLAN YOUR FAST</Text><Text style={styles.heroTitle}>How would you like to fast?</Text><Text style={styles.heroBody}>Choose a one-time reminder or a weekly schedule.</Text></View></View>

      <Text style={styles.eyebrow}>CHOOSE A SCHEDULE</Text>
      <ChoiceCard eyebrow="ONE TIME" icon={<Bell size={24} color={colors.accent} />} title="One-time reminder fast" description="Add one fast with your personal reminders." onPress={() => navigation.navigate('AddFast')} />
      <ChoiceCard eyebrow="REPEATING" icon={<Repeat2 size={24} color={colors.accent} />} title="Weekly fast" description="Repeat on the same weekday with a fixed total or no limit." onPress={() => navigation.navigate('WeeklyFast')} />
    </Screen>
  );
}

function ChoiceCard({ eyebrow, icon, title, description, onPress }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}><View style={styles.choiceAccent} /><View style={styles.choiceIcon}>{icon}</View><View style={styles.choiceCopy}><Text style={styles.choiceEyebrow}>{eyebrow}</Text><Text style={styles.choiceTitle}>{title}</Text><Text style={styles.choiceDescription}>{description}</Text></View><View style={styles.choiceArrow}><ChevronRight size={19} color={colors.accentDark} /></View></Pressable>;
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 40, justifyContent: 'center', width: 40 },
  spacer: { width: 40 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10 },
  heroCard: { alignItems: 'center', backgroundColor: '#FFF0E3', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', marginTop: spacing.lg, padding: spacing.md },
  heroIcon: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#F2C9A7', borderRadius: radius.pill, borderWidth: 1, height: 58, justifyContent: 'center', width: 58 },
  heroCopy: { flex: 1, marginLeft: spacing.sm },
  heroEyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: '#54291D', fontSize: 18, fontWeight: '900', marginTop: 4 },
  heroBody: { color: '#9C6650', fontSize: 11, lineHeight: 16, marginTop: 4 },
  eyebrow: { color: colors.accentDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.1, marginBottom: spacing.sm, marginTop: spacing.lg },
  choiceCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, elevation: 2, flexDirection: 'row', marginBottom: spacing.sm, minHeight: 104, overflow: 'hidden', padding: spacing.md, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  choiceAccent: { backgroundColor: colors.accent, borderRadius: radius.pill, bottom: 18, left: 0, position: 'absolute', top: 18, width: 4 },
  choiceIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, height: 56, justifyContent: 'center', width: 56 },
  choiceCopy: { flex: 1, marginLeft: spacing.sm, marginRight: spacing.sm },
  choiceEyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  choiceTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 3 },
  choiceDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  choiceArrow: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 32, justifyContent: 'center', width: 32 },
  pressed: { opacity: 0.82 },
});
