import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Flame, Plus } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { displayDate, isPastDate } from '../utils/dateUtils';
import FastCard from '../components/FastCard';
import { ErrorBanner, LoadingState, Screen, SectionTitle } from '../components/ui';

const UPCOMING_PAGE_SIZE = 4;

export default function HomeScreen({ navigation }) {
  const { events, loading, permission, error, refresh, saveCompletedEvent, deleteEvent } = useApp();
  const { width } = useWindowDimensions();
  const [nextFastIndex, setNextFastIndex] = useState(0);
  const [upcomingPage, setUpcomingPage] = useState(0);
  const nextScrollRef = useRef(null);
  const upcoming = useMemo(() => {
    const noLimitGroups = new Set();
    return events
      .filter((event) => event.status === 'upcoming' && !isPastDate(event.fastingDate))
      .sort((a, b) => a.fastingDate.localeCompare(b.fastingDate))
      .filter((event) => {
        const isNoLimit = event.isRecurring && (event.recurrenceLimit === null || event.recurrenceLimit === undefined);
        if (!isNoLimit) return true;
        const groupKey = event.recurrenceGroupId || event.id;
        if (noLimitGroups.has(groupKey)) return false;
        noLimitGroups.add(groupKey);
        return true;
      });
  }, [events]);
  const completed = useMemo(() => events.filter((event) => event.status === 'completed'), [events]);
  const recurring = upcoming.filter((event) => event.isRecurring);
  const slideWidth = Math.min(Math.max(width - 32, 280), 620);
  const activeNextFastIndex = Math.min(nextFastIndex, Math.max(0, upcoming.length - 1));
  const upcomingPageCount = Math.max(1, Math.ceil(upcoming.length / UPCOMING_PAGE_SIZE));
  const visibleUpcoming = upcoming.slice(upcomingPage * UPCOMING_PAGE_SIZE, (upcomingPage + 1) * UPCOMING_PAGE_SIZE);

  useEffect(() => {
    if (upcoming.length <= 1) return undefined;
    const timer = setInterval(() => {
      setNextFastIndex((current) => (current + 1) % upcoming.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [upcoming.length]);

  useEffect(() => {
    if (!upcoming.length) return;
    nextScrollRef.current?.scrollTo({ x: activeNextFastIndex * slideWidth, animated: true });
  }, [activeNextFastIndex, slideWidth, upcoming.length]);

  useEffect(() => {
    setUpcomingPage((current) => Math.min(current, Math.max(0, upcomingPageCount - 1)));
  }, [upcomingPageCount]);

  if (loading) return <LoadingState />;

  const confirmDelete = (event) => Alert.alert('Delete this fast?', `Remove ${event.fastName} and cancel its reminders?`, [
    { text: 'Keep it', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(event) },
  ]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoShell}><Image source={require('../../assect/icon.png')} style={styles.headerImage} resizeMode="contain" accessibilityLabel="Fasting reminder logo" /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>FASTING REMINDER</Text>
            <Text style={styles.greeting}>Vrat Smaran</Text>
            <Text style={styles.headerSubtitle}>Your peaceful fasting companion</Text>
          </View>
        </View>
      </View>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {!permission.granted && (
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.permissionBanner}>
          <Bell size={18} color={colors.accentDark} />
          <View style={styles.bannerText}><Text style={styles.bannerTitle}>Reminders are off</Text><Text style={styles.bannerBody}>Tap to enable fasting notifications.</Text></View>
          <ChevronRight size={18} color={colors.accentDark} />
        </Pressable>
      )}

      <Image source={require('../../assect/bannera.png')} style={styles.heroImage} resizeMode="cover" accessibilityLabel="Fasting reminder banner" />

      <View style={styles.nextScroller}>
        <ScrollView
          ref={nextScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nextScrollerContent}
          onMomentumScrollEnd={({ nativeEvent }) => setNextFastIndex(Math.round(nativeEvent.contentOffset.x / slideWidth))}
        >
          {upcoming.length ? upcoming.map((event) => <View key={event.id} style={{ width: slideWidth }}><NextFastCard event={event} navigation={navigation} /></View>) : <View style={{ width: slideWidth }}><NextFastCard navigation={navigation} /></View>}
        </ScrollView>
        {upcoming.length > 1 && <View style={styles.pageDots}>{upcoming.map((event, index) => <View key={event.id} style={[styles.pageDot, index === activeNextFastIndex && styles.pageDotActive]} />)}</View>}
      </View>

      <SectionTitle title="Upcoming fasts" action="Calendar" onAction={() => navigation.navigate('Calendar')} />
      {upcoming.length ? <>
        <View style={styles.upcomingList}>{visibleUpcoming.map((event, index) => <UpcomingFastRow key={event.id} event={event} onPress={() => navigation.navigate('FastDetails', { eventId: event.id })} last={index === visibleUpcoming.length - 1} />)}</View>
        {upcomingPageCount > 1 && <View style={styles.listPager}>
          <Pressable accessibilityLabel="Previous upcoming fasts" disabled={upcomingPage === 0} onPress={() => setUpcomingPage((current) => Math.max(0, current - 1))} style={({ pressed }) => [styles.pageButton, upcomingPage === 0 && styles.pageButtonDisabled, pressed && styles.pressed]}>
            <ChevronLeft size={17} color={upcomingPage === 0 ? colors.line : colors.accent} />
            <Text style={[styles.pageButtonText, upcomingPage === 0 && styles.pageButtonTextDisabled]}>Previous</Text>
          </Pressable>
          <Text style={styles.pageCounter}>{upcomingPage + 1} / {upcomingPageCount}</Text>
          <Pressable accessibilityLabel="Next upcoming fasts" disabled={upcomingPage === upcomingPageCount - 1} onPress={() => setUpcomingPage((current) => Math.min(upcomingPageCount - 1, current + 1))} style={({ pressed }) => [styles.pageButton, upcomingPage === upcomingPageCount - 1 && styles.pageButtonDisabled, pressed && styles.pressed]}>
            <Text style={[styles.pageButtonText, upcomingPage === upcomingPageCount - 1 && styles.pageButtonTextDisabled]}>Next</Text>
            <ChevronRight size={17} color={upcomingPage === upcomingPageCount - 1 ? colors.line : colors.accent} />
          </Pressable>
        </View>}
      </> : <View style={styles.emptyUpcoming}>
        <View style={styles.emptyIcon}><CalendarDays size={25} color={colors.accent} /></View>
        <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>No upcoming fasts</Text><Text style={styles.emptyDescription}>Add a fast to start your personal reminder calendar.</Text></View>
        <Pressable onPress={() => navigation.navigate('AddFastChoice')} style={({ pressed }) => [styles.emptyAddButton, pressed && styles.pressed]}>
          <Plus size={20} color={colors.surface} />
          <Text style={styles.fabText}>Schedule a fast</Text>
        </Pressable>
      </View>}
      {upcoming.length > 0 && <Pressable onPress={() => navigation.navigate('AddFastChoice')} style={({ pressed }) => [styles.bottomAdd, pressed && styles.pressed]}>
        <Plus size={18} color={colors.accent} />
        <Text style={styles.bottomAddText}>Add another fast</Text>
      </Pressable>}

      {recurring.length > 0 && <>
        <SectionTitle title="Active recurring fasts" />
        <Pressable onPress={() => navigation.navigate('RecurringFastList')} style={({ pressed }) => [styles.recurringCard, pressed && styles.pressed]}><View style={styles.recurringIcon}><Flame size={20} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.recurringTitle}>{new Set(recurring.map((event) => event.recurrenceGroupId)).size} weekly schedule{new Set(recurring.map((event) => event.recurrenceGroupId)).size === 1 ? '' : 's'}</Text><Text style={styles.recurringBody}>Tap to view all scheduled fasts.</Text></View><ChevronRight size={18} color={colors.muted} /></Pressable>
      </>}

      {completed.length > 0 && <>
        <SectionTitle title="Needs your review" />
        {completed.slice(0, 3).map((event) => <FastCard key={event.id} event={event} onSave={() => saveCompletedEvent(event)} onDelete={() => confirmDelete(event)} onPress={() => {}} />)}
      </>}

    </Screen>
  );
}

function UpcomingFastRow({ event, onPress, last }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.upcomingRow, !last && styles.upcomingRowDivider, pressed && styles.pressed]}>
    <View style={styles.upcomingIcon}><CalendarDays size={22} color={colors.accent} /></View>
    <View style={styles.upcomingDetails}>
      <Text numberOfLines={1} style={styles.upcomingTitle}>{event.fastName}</Text>
    </View>
    <ChevronRight size={19} color={colors.muted} />
  </Pressable>;
}

function NextFastCard({ event, navigation }) {
  return <View style={styles.nextFastCard}>
    <View style={styles.nextAccentBar} />
    <View style={styles.nextFastCopy}>
      <Text style={styles.nextLabel}>UP NEXT</Text>
      <Text numberOfLines={1} style={styles.nextName}>{event ? event.fastName : 'No fast scheduled'}</Text>
      <View style={styles.nextMeta}><CalendarDays size={15} color={colors.accentDark} /><Text style={styles.nextDate}>{event ? displayDate(event.fastingDate, 'EEEE, d MMMM') : 'Add a fast to begin'}</Text></View>
    </View>
    {event ? <View style={styles.daysBadge}><Text style={styles.daysNumber}>{Math.max(0, Math.ceil((new Date(`${event.fastingDate}T00:00:00`) - new Date(new Date().toDateString())) / 86400000))}</Text><Text style={styles.daysLabel}>days left</Text></View> : <Pressable onPress={() => navigation.navigate('AddFastChoice')} style={({ pressed }) => [styles.nextAdd, pressed && styles.pressed]}><Plus size={18} color={colors.surface} /><Text style={styles.nextAddText}>Add</Text></Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#FFF1E5', borderColor: '#F1D2BA', borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  headerTop: { alignItems: 'center', flexDirection: 'row' },
  logoShell: { alignItems: 'center', backgroundColor: '#FFFDFB', borderColor: '#F2C9A7', borderRadius: 20, borderWidth: 1, height: 64, justifyContent: 'center', marginRight: spacing.sm, overflow: 'hidden', width: 64 },
  headerImage: { height: 58, width: 58 },
  headerCopy: { flex: 1, paddingRight: spacing.sm },
  eyebrow: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  greeting: { color: '#54291D', fontSize: 23, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  headerSubtitle: { color: '#9C6650', fontSize: 11, marginTop: 4 },
  permissionBanner: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, flexDirection: 'row', gap: 10, marginBottom: spacing.md, padding: spacing.sm },
  bannerText: { flex: 1 },
  bannerTitle: { color: colors.accentDark, fontSize: 13, fontWeight: '800' },
  bannerBody: { color: colors.accentDark, fontSize: 12, marginTop: 2 },
  heroImage: { borderRadius: radius.lg, height: 178, marginBottom: spacing.md, width: '100%' },
  nextScroller: { marginBottom: 2 },
  nextScrollerContent: { alignItems: 'stretch' },
  nextFastCard: { alignItems: 'center', backgroundColor: '#FFF1E6', borderColor: '#F1D7C3', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 110, overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  nextAccentBar: { backgroundColor: colors.accent, borderRadius: radius.pill, height: 62, left: 0, position: 'absolute', width: 5 },
  nextFastCopy: { flex: 1, paddingLeft: 4, paddingRight: spacing.sm },
  nextLabel: { color: colors.accentDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  nextName: { color: '#54291D', fontSize: 21, fontWeight: '800', marginTop: 5 },
  nextMeta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 9 },
  nextDate: { color: '#9C6650', flexShrink: 1, fontSize: 12, fontWeight: '700' },
  daysBadge: { alignItems: 'center', backgroundColor: '#FBE0CC', borderColor: '#EFA56F', borderRadius: radius.pill, borderWidth: 2, elevation: 2, height: 72, justifyContent: 'center', shadowColor: '#B95728', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, width: 72 },
  daysNumber: { color: colors.accentDark, fontSize: 23, fontWeight: '900' },
  daysLabel: { color: '#9C6650', fontSize: 9, fontWeight: '800' },
  nextAdd: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.pill, flexDirection: 'row', gap: 5, paddingHorizontal: 14, paddingVertical: 10 },
  nextAddText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  pageDots: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 8 },
  pageDot: { backgroundColor: '#E5C5AE', borderRadius: 4, height: 6, width: 6 },
  pageDotActive: { backgroundColor: colors.accent, width: 18 },
  upcomingList: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.sm, overflow: 'hidden', paddingVertical: 3 },
  upcomingRow: { alignItems: 'center', flexDirection: 'row', minHeight: 70, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  upcomingRowDivider: { borderBottomColor: colors.line, borderBottomWidth: 1 },
  listPager: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  pageButton: { alignItems: 'center', borderColor: colors.accent, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 3, paddingHorizontal: 11, paddingVertical: 7 },
  pageButtonDisabled: { borderColor: colors.line },
  pageButtonText: { color: colors.accentDark, fontSize: 11, fontWeight: '800' },
  pageButtonTextDisabled: { color: colors.line },
  pageCounter: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  upcomingIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  upcomingDetails: { flex: 1, marginLeft: spacing.sm, minWidth: 0 },
  upcomingTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  recurringCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', gap: 12, padding: spacing.md },
  recurringIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  recurringTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  recurringBody: { color: colors.muted, fontSize: 12, marginTop: 4 },
  emptyUpcoming: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, padding: spacing.md },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 56, justifyContent: 'center', marginRight: spacing.sm, width: 56 },
  emptyCopy: { flex: 1, minWidth: 170 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  emptyDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  emptyAddButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.pill, elevation: 3, flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: spacing.md, paddingHorizontal: 16, paddingVertical: 11, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 7, width: '100%' },
  fabText: { color: colors.surface, fontSize: 14, fontWeight: '900' },
  bottomAdd: { alignItems: 'center', alignSelf: 'center', borderColor: colors.accent, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 6, marginTop: spacing.md, paddingHorizontal: 16, paddingVertical: 9 },
  bottomAddText: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
