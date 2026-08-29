import { Tabs } from 'expo-router';
import React from 'react';
import { SymbolView } from 'expo-symbols';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Safe-Path',
          tabBarIcon: ({ color }) => (
            <SymbolView name="shield.fill" tintColor={color} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Punarmilan',
          tabBarIcon: ({ color }) => (
            <SymbolView name="person.2.fill" tintColor={color} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Disaster Net',
          tabBarIcon: ({ color }) => (
            <SymbolView name="antenna.radiowaves.left.and.right" tintColor={color} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
    </Tabs>
  );
}