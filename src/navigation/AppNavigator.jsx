import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarDays, ClipboardCheck, Home, Settings } from 'lucide-react-native';
import { colors } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddFastScreen from '../screens/AddFastScreen';
import AddFastChoiceScreen from '../screens/AddFastChoiceScreen';
import ReminderTimesScreen from '../screens/ReminderTimesScreen';
import FastDetailsScreen from '../screens/FastDetailsScreen';
import WeeklyFastScreen from '../screens/WeeklyFastScreen';
import RecurringFastListScreen from '../screens/RecurringFastListScreen';

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (Icon) => ({ color, size }) => <Icon color={color} size={size} strokeWidth={2.2} />;

function MainTabs() {
  return <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 68, paddingBottom: 9, paddingTop: 7 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon(Home) }} />
    <Tabs.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: tabIcon(CalendarDays) }} />
    <Tabs.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: tabIcon(ClipboardCheck) }} />
    <Tabs.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: tabIcon(Settings) }} />
  </Tabs.Navigator>;
}

export default function AppNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen name="AddFast" component={AddFastScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="AddFastChoice" component={AddFastChoiceScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="FastDetails" component={FastDetailsScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="WeeklyFast" component={WeeklyFastScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="RecurringFastList" component={RecurringFastListScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="ReminderTimes" component={ReminderTimesScreen} options={{ presentation: 'modal' }} />
  </Stack.Navigator>;
}
