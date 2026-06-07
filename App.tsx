import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MangaDetailScreen from './src/screens/MangaDetailScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import FilterScreen from './src/screens/FilterScreen';
import { FiltersProvider } from './src/context/FiltersContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { PurchasesProvider } from './src/context/PurchasesContext';
import PaywallScreen from './src/screens/PaywallScreen';
import type { RootStackParamList } from './src/types/manga';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: '#16213e' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#1a1a2e' },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...HEADER_OPTS,
        tabBarStyle: { backgroundColor: '#16213e', borderTopColor: '#0f3460' },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Manga Hub',
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'My Library',
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PurchasesProvider>
    <SettingsProvider>
      <FiltersProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={HEADER_OPTS}>
            <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="MangaDetail"
              component={MangaDetailScreen}
              options={({ route }) => ({ title: route.params.title })}
            />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FilterScreen"
              component={FilterScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FiltersProvider>
    </SettingsProvider>
    </PurchasesProvider>
  );
}
