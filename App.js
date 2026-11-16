import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

export default function App() {
  return <SafeAreaProvider><AppProvider><NavigationContainer><StatusBar style="dark" backgroundColor={colors.background} /><AppNavigator /></NavigationContainer></AppProvider></SafeAreaProvider>;
}
