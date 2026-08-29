import { Tabs } from 'expo-router';
import React from 'react';
import { DisasterProvider } from '../context/DisasterContext';

export default function RootLayout() {
  return (
    <DisasterProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
          tabBarActiveTintColor: '#38BDF8',
          tabBarInactiveTintColor: '#64748B',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Safe-Path' }} />
        <Tabs.Screen name="explore" options={{ title: 'Punarmilan' }} />
        <Tabs.Screen name="docs" options={{ title: 'Disaster Net' }} />
      </Tabs>
    </DisasterProvider>
  );
}