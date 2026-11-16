import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Plus } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';

export const Screen = ({ children, scroll = true, contentStyle }) => {
  const insets = useSafeAreaInsets();
  const Container = scroll ? require('react-native').ScrollView : View;
  return (
    <Container style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={[scroll && styles.scrollContent, contentStyle]} showsVerticalScrollIndicator={false}>
      {children}
    </Container>
  );
};

export const SectionTitle = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable>}
  </View>
);

export const PrimaryButton = ({ title, onPress, icon, disabled }) => (
  <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed]}>
    {icon || <Plus size={19} color={colors.surface} />}
    <Text style={styles.primaryButtonText}>{title}</Text>
  </Pressable>
);

export const TextButton = ({ title, onPress, color = colors.accent }) => (
  <Pressable onPress={onPress} hitSlop={8}><Text style={[styles.textButton, { color }]}>{title}</Text></Pressable>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>{icon}</View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {action}
  </View>
);

export const LoadingState = () => <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;

export const ErrorBanner = ({ message, onRetry }) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && <Pressable onPress={onRetry}><Text style={styles.retryText}>Retry</Text></Pressable>}
  </View>
);

export const ChevronAction = ({ onPress }) => <Pressable onPress={onPress} style={styles.chevron}><ChevronRight size={19} color={colors.muted} /></Pressable>;

export const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { alignSelf: 'center', maxWidth: 620, paddingBottom: 116, paddingHorizontal: spacing.md, paddingTop: spacing.sm, width: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  sectionAction: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  primaryButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: colors.accent, borderRadius: radius.md, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52, marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  primaryButtonText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82 },
  textButton: { fontSize: 14, fontWeight: '800' },
  emptyState: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, marginTop: spacing.sm },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.pill, height: 60, justifyContent: 'center', marginBottom: spacing.md, width: 60 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: 280, textAlign: 'center' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  errorBanner: { backgroundColor: colors.redSoft, borderRadius: radius.sm, flexDirection: 'row', gap: 10, marginBottom: spacing.md, padding: spacing.sm },
  errorText: { color: colors.red, flex: 1, fontSize: 12, lineHeight: 17 },
  retryText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  chevron: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
});
