import React from "react";
import { Tabs } from "expo-router";

import { DisasterProvider } from "../context/DisasterContext";
import { SOSProvider } from "../context/SOSContext";

export default function RootLayout() {
  return (
    <DisasterProvider>
      <SOSProvider>
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarStyle: {
              backgroundColor: "#1E293B",
              borderTopColor: "#334155",
            },

            tabBarActiveTintColor: "#38BDF8",
            tabBarInactiveTintColor: "#64748B",
          }}
        >
          {/* SAFE-PATH */}
          <Tabs.Screen
            name="index"
            options={{
              title: "Safe-Path",
            }}
          />

          {/* PUNARMILAN */}
          <Tabs.Screen
            name="punarmilan"
            options={{
              title: "Punarmilan",
            }}
          />

          {/* DISASTER NETWORK */}
          <Tabs.Screen
            name="docs"
            options={{
              title: "Disaster Net",
            }}
          />

          {/* DONATIONS */}
          <Tabs.Screen
            name="donation"
            options={{
              title: "Donations",
            }}
          />

          {/* OLD EXPLORE PAGE - HIDDEN */}
          <Tabs.Screen
            name="explore"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
  name="volunteer"
  options={{
    title: "Volunteer",
  }}
/>
           <Tabs.Screen
  name="notifications"
  options={{
    title: "Alerts",
  }}
/>
        </Tabs>
      </SOSProvider>
    </DisasterProvider>
  );
}