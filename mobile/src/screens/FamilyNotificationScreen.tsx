import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

type NotificationType =
  | "GOVERNMENT"
  | "WEATHER"
  | "FAMILY";

type Severity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "INFO";

interface EmergencyNotification {
  id: string;
  type: NotificationType;
  severity: Severity;
  title: string;
  message: string;
  location?: string;
  source?: string;
  createdAt: string;
  read: boolean;
  verified?: boolean;
}

interface WeatherData {
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
}

const NOTIFICATION_KEY =
  "PUNARMILAN_EMERGENCY_NOTIFICATIONS";

const LAST_WEATHER_KEY =
  "PUNARMILAN_LAST_WEATHER_ALERT";

export default function FamilyNotificationsScreen() {
  const [notifications, setNotifications] =
    useState<EmergencyNotification[]>([]);

  const [loadingWeather, setLoadingWeather] =
    useState(false);

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [locationName, setLocationName] =
    useState("Current location");

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    await loadNotifications();
    await loadWeatherAndCreateAlerts();
  };

  // --------------------------------------------------
  // LOAD NOTIFICATIONS
  // --------------------------------------------------

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(
        NOTIFICATION_KEY
      );

      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

  // --------------------------------------------------
  // SAVE NOTIFICATIONS
  // --------------------------------------------------

  const saveNotifications = async (
    updated: EmergencyNotification[]
  ) => {
    setNotifications(updated);

    try {
      await AsyncStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error(
        "Failed to save notifications:",
        error
      );
    }
  };

  // --------------------------------------------------
  // LOCATION + WEATHER
  // --------------------------------------------------

  const loadWeatherAndCreateAlerts = async () => {
    try {
      setLoadingWeather(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLoadingWeather(false);

        return;
      }

      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      // Try to get a readable place name.
      try {
        const address =
          await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

        if (address.length > 0) {
          const place = address[0];

          const readableLocation = [
            place.city,
            place.district,
            place.region,
          ]
            .filter(Boolean)
            .join(", ");

          if (readableLocation) {
            setLocationName(
              readableLocation
            );
          }
        }
      } catch (error) {
        console.log(
          "Reverse geocoding unavailable"
        );
      }

      // Open-Meteo forecast.
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,precipitation,wind_speed_10m,weather_code` +
        `&hourly=precipitation_probability,precipitation` +
        `&forecast_days=1` +
        `&timezone=auto`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Weather request failed"
        );
      }

      const data = await response.json();

      const current =
        data.current;

      const precipitation =
        Number(
          current?.precipitation || 0
        );

      const temperature =
        Number(
          current?.temperature_2m || 0
        );

      const windSpeed =
        Number(
          current?.wind_speed_10m || 0
        );

      const currentHour =
        new Date().getHours();

      const hourlyProbability =
        Number(
          data?.hourly
            ?.precipitation_probability?.[
              currentHour
            ] || 0
        );

      const weatherData: WeatherData = {
        temperature,
        precipitation,
        precipitationProbability:
          hourlyProbability,
        windSpeed,
        weatherCode: Number(
          current?.weather_code || 0
        ),
      };

      setWeather(weatherData);

      await createWeatherAlerts(
        weatherData
      );
    } catch (error) {
      console.error(
        "Weather alert error:",
        error
      );
    } finally {
      setLoadingWeather(false);
    }
  };

  // --------------------------------------------------
  // WEATHER ALERT ENGINE
  // --------------------------------------------------

  const createWeatherAlerts = async (
    data: WeatherData
  ) => {
    const generatedAlerts: EmergencyNotification[] =
      [];

    /*
     * These thresholds are prototype rules.
     *
     * Production:
     * Combine weather forecast with:
     * - official disaster warnings
     * - rainfall thresholds
     * - flood models
     * - river levels
     * - local authority alerts
     * - road closure information
     */

    if (
      data.precipitation >= 15 ||
      data.precipitationProbability >= 80
    ) {
      generatedAlerts.push({
        id: `WEATHER-RAIN-${Date.now()}`,
        type: "WEATHER",
        severity:
          data.precipitation >= 30
            ? "HIGH"
            : "MEDIUM",
        title:
          "🌧️ Heavy Rain Safety Alert",
        message:
          "Heavy precipitation is possible at your current location. Avoid low-lying roads, underpasses and areas with visible water accumulation. Keep your emergency supplies accessible.",
        location: locationName,
        source: "Live weather forecast",
        createdAt:
          new Date().toISOString(),
        read: false,
      });
    }

    if (data.temperature >= 40) {
      generatedAlerts.push({
        id: `WEATHER-HEAT-${Date.now()}`,
        type: "WEATHER",
        severity: "HIGH",
        title:
          "🌡️ Extreme Heat Safety Alert",
        message:
          "Very high temperature conditions detected. Avoid unnecessary outdoor travel, stay hydrated and check on children, elderly people and vulnerable persons.",
        location: locationName,
        source: "Live weather forecast",
        createdAt:
          new Date().toISOString(),
        read: false,
      });
    }

    if (data.windSpeed >= 50) {
      generatedAlerts.push({
        id: `WEATHER-WIND-${Date.now()}`,
        type: "WEATHER",
        severity: "HIGH",
        title:
          "💨 Strong Wind Safety Alert",
        message:
          "Strong winds are currently forecast. Avoid exposed areas, temporary structures, trees and unsecured objects.",
        location: locationName,
        source: "Live weather forecast",
        createdAt:
          new Date().toISOString(),
        read: false,
      });
    }

    if (data.weatherCode >= 95) {
      generatedAlerts.push({
        id: `WEATHER-STORM-${Date.now()}`,
        type: "WEATHER",
        severity: "CRITICAL",
        title:
          "⛈️ Thunderstorm Alert",
        message:
          "Thunderstorm conditions are indicated by the weather service. Move indoors and avoid open fields, isolated trees and exposed electrical infrastructure.",
        location: locationName,
        source: "Live weather forecast",
        createdAt:
          new Date().toISOString(),
        read: false,
      });
    }

    if (generatedAlerts.length === 0) {
      return;
    }

    const existing =
      await AsyncStorage.getItem(
        NOTIFICATION_KEY
      );

    const currentNotifications:
      EmergencyNotification[] =
      existing
        ? JSON.parse(existing)
        : [];

    /*
     * Avoid creating the same type of
     * weather alert repeatedly every time
     * the screen opens.
     */

    const lastWeather =
      await AsyncStorage.getItem(
        LAST_WEATHER_KEY
      );

    const now = Date.now();

    if (lastWeather) {
      const lastTime =
        Number(lastWeather);

      // Don't duplicate alerts for 30 minutes.
      if (
        now - lastTime <
        30 * 60 * 1000
      ) {
        return;
      }
    }

    const updated = [
      ...generatedAlerts,
      ...currentNotifications,
    ].slice(0, 50);

    await AsyncStorage.setItem(
      NOTIFICATION_KEY,
      JSON.stringify(updated)
    );

    await AsyncStorage.setItem(
      LAST_WEATHER_KEY,
      String(now)
    );

    setNotifications(updated);
  };

  // --------------------------------------------------
  // GOVERNMENT ALERTS
  // --------------------------------------------------

  const createGovernmentAlert = async () => {
    const governmentAlert:
      EmergencyNotification = {
      id: `GOV-${Date.now()}`,
      type: "GOVERNMENT",
      severity: "HIGH",
      title:
        "🚨 Government Safety Advisory",
      message:
        "Follow instructions issued by authorized disaster-management authorities. Avoid restricted areas, monitor official announcements and move to designated relief centres when instructed.",
      location: locationName,
      source:
        "Government / SACHET integration-ready",
      createdAt:
        new Date().toISOString(),
      read: false,
    };

    const updated = [
      governmentAlert,
      ...notifications,
    ].slice(0, 50);

    await saveNotifications(updated);

    Alert.alert(
      "Government alert added",
      "This is a prototype alert. Production alerts should be received from authenticated official government sources."
    );
  };

  // --------------------------------------------------
  // FAMILY NOTIFICATION
  // --------------------------------------------------

  const createFamilyNotification = async () => {
    const notification:
      EmergencyNotification = {
      id: `FAMILY-${Date.now()}`,
      type: "FAMILY",
      severity: "INFO",
      title:
        "👨‍👩‍👧 Person Safely Located",
      message:
        "A registered volunteer has verified that this person has been safely located. In production, this notification would be delivered only to the verified family contact.",
      location:
        "Highway 44 Medical Camp",
      source:
        "Punarmilan verified responder",
      createdAt:
        new Date().toISOString(),
      read: false,
      verified: true,
    };

    const updated = [
      notification,
      ...notifications,
    ].slice(0, 50);

    await saveNotifications(updated);

    Alert.alert(
      "🔔 Safe notification created",
      "A family reunification notification has been added for the SIH demonstration."
    );
  };

  // --------------------------------------------------
  // READ / CLEAR
  // --------------------------------------------------

  const markAsRead = async (
    id: string
  ) => {
    const updated =
      notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
      );

    await saveNotifications(updated);
  };

  const clearNotifications = async () => {
    Alert.alert(
      "Clear notifications",
      "Remove notification history from this device?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await saveNotifications([]);
          },
        },
      ]
    );
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const severityLabel = (
    severity: Severity
  ) => {
    switch (severity) {
      case "CRITICAL":
        return "🔴 CRITICAL";

      case "HIGH":
        return "🟠 HIGH";

      case "MEDIUM":
        return "🟡 MEDIUM";

      default:
        return "🔵 INFO";
    }
  };

  const typeLabel = (
    type: NotificationType
  ) => {
    switch (type) {
      case "GOVERNMENT":
        return "GOVERNMENT ALERT";

      case "WEATHER":
        return "WEATHER SAFETY";

      case "FAMILY":
        return "PUNARMILAN";

      default:
        return "ALERT";
    }
  };

  const weatherDescription = (
    code: number
  ) => {
    if (code >= 95) {
      return "Thunderstorm";
    }

    if (code >= 80) {
      return "Rain showers";
    }

    if (code >= 61) {
      return "Rain";
    }

    if (code >= 51) {
      return "Drizzle";
    }

    if (code >= 1) {
      return "Cloudy";
    }

    return "Clear";
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>
            🔔
          </Text>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Emergency Notifications
            </Text>

            <Text style={styles.subtitle}>
              Weather, government & family
              safety updates
            </Text>
          </View>

          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* LOCATION */}
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>
            📍
          </Text>

          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>
              Alerts for your location
            </Text>

            <Text style={styles.locationText}>
              {locationName}
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={
              loadWeatherAndCreateAlerts
            }
          >
            <Text
              style={styles.refreshText}
            >
              ↻
            </Text>
          </Pressable>
        </View>

        {/* WEATHER STATUS */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <View>
                <Text style={styles.weatherTitle}>
                  🌦️ Current Weather Risk
                </Text>

                <Text
                  style={styles.weatherLocation}
                >
                  {weatherDescription(
                    weather.weatherCode
                  )}
                </Text>
              </View>

              <Text style={styles.temperature}>
                {weather.temperature.toFixed(
                  0
                )}
                °C
              </Text>
            </View>

            <View style={styles.weatherStats}>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>
                  🌧️
                </Text>

                <Text style={styles.weatherStatValue}>
                  {weather.precipitation.toFixed(
                    1
                  )}
                  mm
                </Text>

                <Text style={styles.weatherStatLabel}>
                  Rain now
                </Text>
              </View>

              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>
                  ☔
                </Text>

                <Text style={styles.weatherStatValue}>
                  {
                    weather.precipitationProbability
                  }
                  %
                </Text>

                <Text style={styles.weatherStatLabel}>
                  Rain chance
                </Text>
              </View>

              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>
                  💨
                </Text>

                <Text style={styles.weatherStatValue}>
                  {weather.windSpeed.toFixed(
                    0
                  )}{" "}
                  km/h
                </Text>

                <Text style={styles.weatherStatLabel}>
                  Wind
                </Text>
              </View>
            </View>

            <Text style={styles.weatherNote}>
              Weather safety alerts are
              generated from live forecast
              conditions. Official disaster
              warnings take priority.
            </Text>
          </View>
        )}

        {loadingWeather && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              🌦️ Checking local weather
              conditions...
            </Text>
          </View>
        )}

        {/* ACTION BUTTONS */}
        <Text style={styles.sectionTitle}>
          Alert Sources
        </Text>

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={
              createGovernmentAlert
            }
          >
            <Text style={styles.actionIcon}>
              🚨
            </Text>

            <Text style={styles.actionTitle}>
              Government Alert
            </Text>

            <Text style={styles.actionSubtitle}>
              Official warning
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={
              createFamilyNotification
            }
          >
            <Text style={styles.actionIcon}>
              👨‍👩‍👧
            </Text>

            <Text style={styles.actionTitle}>
              Family Safe
            </Text>

            <Text style={styles.actionSubtitle}>
              Reunification update
            </Text>
          </Pressable>
        </View>

        {/* NOTIFICATION HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            All Notifications
          </Text>

          {notifications.length > 0 && (
            <Pressable
              onPress={
                clearNotifications
              }
            >
              <Text style={styles.clearText}>
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        {/* EMPTY */}
        {notifications.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🔕
            </Text>

            <Text style={styles.emptyTitle}>
              No active alerts
            </Text>

            <Text style={styles.emptyText}>
              Weather-based safety warnings
              and verified emergency updates
              will appear here.
            </Text>
          </View>
        )}

        {/* NOTIFICATION CARDS */}
        {notifications.map(
          (notification) => (
            <Pressable
              key={notification.id}
              onPress={() =>
                markAsRead(
                  notification.id
                )
              }
              style={[
                styles.notificationCard,
                !notification.read &&
                  styles.unreadCard,
              ]}
            >
              <View
                style={
                  styles.notificationTop
                }
              >
                <View
                  style={[
                    styles.notificationIcon,
                    notification.type ===
                      "GOVERNMENT" &&
                      styles.govIcon,
                    notification.type ===
                      "WEATHER" &&
                      styles.weatherIcon,
                    notification.type ===
                      "FAMILY" &&
                      styles.familyIcon,
                  ]}
                >
                  <Text>
                    {notification.type ===
                    "GOVERNMENT"
                      ? "🚨"
                      : notification.type ===
                        "WEATHER"
                      ? "🌦️"
                      : "👨‍👩‍👧"}
                  </Text>
                </View>

                <View
                  style={
                    styles.notificationHeading
                  }
                >
                  <Text
                    style={
                      styles.notificationType
                    }
                  >
                    {typeLabel(
                      notification.type
                    )}
                  </Text>

                  {!notification.read && (
                    <View
                      style={styles.newBadge}
                    >
                      <Text
                        style={
                          styles.newBadgeText
                        }
                      >
                        NEW
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Text
                style={
                  styles.notificationTitle
                }
              >
                {notification.title}
              </Text>

              <Text
                style={styles.message}
              >
                {notification.message}
              </Text>

              {notification.location && (
                <View
                  style={styles.detailRow}
                >
                  <Text
                    style={
                      styles.detailIcon
                    }
                  >
                    📍
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    {notification.location}
                  </Text>
                </View>
              )}

              {notification.source && (
                <View
                  style={styles.detailRow}
                >
                  <Text
                    style={
                      styles.detailIcon
                    }
                  >
                    ℹ️
                  </Text>

                  <Text
                    style={
                      styles.detailText
                    }
                  >
                    Source:{" "}
                    {notification.source}
                  </Text>
                </View>
              )}

              <View
                style={styles.bottomRow}
              >
                <Text
                  style={styles.severity}
                >
                  {severityLabel(
                    notification.severity
                  )}
                </Text>

                <Text
                  style={
                    styles.timeText
                  }
                >
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </Text>
              </View>

              {notification.verified && (
                <View
                  style={
                    styles.verifiedBanner
                  }
                >
                  <Text
                    style={
                      styles.verifiedText
                    }
                  >
                    ✓ VERIFIED BY AUTHORIZED
                    RESPONDER
                  </Text>
                </View>
              )}

              {notification.type ===
                "GOVERNMENT" && (
                <View
                  style={
                    styles.officialBanner
                  }
                >
                  <Text
                    style={
                      styles.officialText
                    }
                  >
                    🛡️ Official-source
                    integration ready
                  </Text>
                </View>
              )}

              {notification.type ===
                "WEATHER" && (
                <View
                  style={
                    styles.weatherBanner
                  }
                >
                  <Text
                    style={
                      styles.weatherBannerText
                    }
                  >
                    🌦️ Generated from local
                    weather conditions
                  </Text>
                </View>
              )}
            </Pressable>
          )
        )}

        {/* GOVERNMENT INTEGRATION */}
        <View style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>
            🇮🇳 Government Alert Integration
          </Text>

          <Text style={styles.integrationText}>
            Production deployment can connect
            this notification center to
            authenticated official disaster
            warning feeds such as SACHET /
            authorized government APIs.
          </Text>

          <Pressable
            style={styles.learnButton}
            onPress={() =>
              Alert.alert(
                "Official alerts",
                "For the SIH prototype, government alerts are represented by an integration-ready layer. Connect only authenticated official sources in production."
              )
            }
          >
            <Text
              style={styles.learnButtonText}
            >
              View integration plan
            </Text>
          </Pressable>
        </View>

        {/* DEMO DISCLAIMER */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>
            ⚠️ SIH prototype
          </Text>

          <Text style={styles.noticeText}>
            Weather warnings in this prototype
            are generated from live forecast
            data and rule-based thresholds.
            Government alerts shown by the
            prototype are not official warnings
            unless connected to an authenticated
            government source. Never treat
            prototype alerts as authoritative
            emergency instructions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  container: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    backgroundColor: "#0F3B6D",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    fontSize: 34,
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#DCEAFE",
    fontSize: 13,
    marginTop: 4,
  },

  countBadge: {
    backgroundColor: "#EF4444",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: "#DCE5EF",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  locationIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  locationContent: {
    flex: 1,
  },

  locationTitle: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  locationText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },

  refreshText: {
    color: "#0369A1",
    fontSize: 24,
    fontWeight: "800",
  },

  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 20,
  },

  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  weatherTitle: {
    color: "#0F3B6D",
    fontSize: 17,
    fontWeight: "900",
  },

  weatherLocation: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },

  temperature: {
    color: "#0F3B6D",
    fontSize: 30,
    fontWeight: "900",
  },

  weatherStats: {
    flexDirection: "row",
    marginTop: 17,
    gap: 8,
  },

  weatherStat: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },

  weatherStatIcon: {
    fontSize: 18,
  },

  weatherStatValue: {
    color: "#1E334D",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },

  weatherStatLabel: {
    color: "#718096",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },

  weatherNote: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
  },

  loadingText: {
    color: "#64748B",
    textAlign: "center",
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#1E334D",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 12,
  },

  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE5EF",
  },

  actionIcon: {
    fontSize: 27,
  },

  actionTitle: {
    color: "#1E334D",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center",
  },

  actionSubtitle: {
    color: "#718096",
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  clearText: {
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE5EF",
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  emptyTitle: {
    color: "#334155",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyText: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#DCE5EF",
  },

  unreadCard: {
    borderColor: "#38BDF8",
    borderWidth: 2,
  },

  notificationTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  govIcon: {
    backgroundColor: "#FEE2E2",
  },

  weatherIcon: {
    backgroundColor: "#E0F2FE",
  },

  familyIcon: {
    backgroundColor: "#DCFCE7",
  },

  notificationHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  notificationType: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
  },

  newBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  newBadgeText: {
    color: "#1D4ED8",
    fontSize: 9,
    fontWeight: "900",
  },

  notificationTitle: {
    color: "#1E334D",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 13,
  },

  message: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 11,
  },

  detailRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  detailIcon: {
    width: 25,
  },

  detailText: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },

  severity: {
    fontSize: 11,
    fontWeight: "900",
  },

  timeText: {
    color: "#94A3B8",
    fontSize: 10,
  },

  verifiedBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 9,
    padding: 9,
    marginTop: 12,
  },

  verifiedText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },

  officialBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 9,
    padding: 9,
    marginTop: 10,
  },

  officialText: {
    color: "#1D4ED8",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  weatherBanner: {
    backgroundColor: "#F0F9FF",
    borderRadius: 9,
    padding: 9,
    marginTop: 10,
  },

  weatherBannerText: {
    color: "#0369A1",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  integrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  integrationTitle: {
    color: "#1E334D",
    fontSize: 16,
    fontWeight: "900",
  },

  integrationText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  learnButton: {
    backgroundColor: "#0F3B6D",
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 12,
  },

  learnButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  notice: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F4D58D",
    borderRadius: 16,
    padding: 16,
    marginTop: 13,
  },

  noticeTitle: {
    color: "#7C5A0A",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 5,
  },

  noticeText: {
    color: "#806B38",
    fontSize: 12,
    lineHeight: 18,
  },
});