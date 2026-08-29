import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [destination, setDestination] = useState('');
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Location permission was denied.');
        setLoading(false);
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({});

      setLocation(currentLocation);
      setLoading(false);
    } catch (error) {
      setErrorMsg('Unable to get your current location.');
      setLoading(false);
    }
  };

  const findRoute = () => {
    if (!destination.trim()) {
      Alert.alert(
        'Destination Required',
        'Please enter a shelter or destination.'
      );
      return;
    }

    Alert.alert(
      'Safe Route',
      `Finding the safest route to ${destination}...`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PUNARMILAN</Text>
            <Text style={styles.appSubtitle}>SAFE-PATH</Text>
          </View>

          <View style={styles.shield}>
            <Text style={styles.shieldText}>🛡️</Text>
          </View>
        </View>

        <Text style={styles.welcome}>
          Smart Travel & Route Guidance
        </Text>

        {/* CURRENT LOCATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>
                Getting your location...
              </Text>
            </View>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : location ? (
            <View>
              <Text style={styles.locationStatus}>
                ✓ Location detected
              </Text>

              <Text style={styles.locationText}>
                Latitude: {location.coords.latitude.toFixed(4)}
              </Text>

              <Text style={styles.locationText}>
                Longitude: {location.coords.longitude.toFixed(4)}
              </Text>
            </View>
          ) : (
            <Text style={styles.errorText}>
              Location unavailable
            </Text>
          )}
        </View>

        {/* DESTINATION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🗺️ Find a Safe Route
          </Text>

          <Text style={styles.cardDescription}>
            Enter your destination or nearby shelter.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination..."
            placeholderTextColor="#94A3B8"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={findRoute}
          >
            <Text style={styles.buttonText}>
              Find Safe Route
            </Text>
          </TouchableOpacity>
        </View>

        {/* WEATHER ALERT */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertTitle}>
              Weather Alert
            </Text>
          </View>

          <Text style={styles.alertText}>
            Heavy rainfall reported ahead on Main Highway.
          </Text>

          <Text style={styles.alertRecommendation}>
            Recommendation: Consider an alternate route.
          </Text>
        </View>

        {/* SAFETY FEATURES */}
        <Text style={styles.sectionTitle}>
          Safety Features
        </Text>

        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>
              Live Location
            </Text>
            <Text style={styles.featureText}>
              Track your current position.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛣️</Text>
            <Text style={styles.featureTitle}>
              Safe Routes
            </Text>
            <Text style={styles.featureText}>
              Find safer travel paths.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚠️</Text>
            <Text style={styles.featureTitle}>
              Alerts
            </Text>
            <Text style={styles.featureText}>
              Receive route warnings.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🆘</Text>
            <Text style={styles.featureTitle}>
              Emergency
            </Text>
            <Text style={styles.featureText}>
              Get help when needed.
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            PUNARMILAN SAFE-PATH
          </Text>
          <Text style={styles.footerSubtext}>
            Travel safer. Stay connected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  appTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },

  appSubtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 2,
  },

  shield: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shieldText: {
    fontSize: 27,
  },

  welcome: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    marginLeft: 10,
    color: '#64748B',
    fontSize: 14,
  },

  locationStatus: {
    color: '#16A34A',
    fontWeight: '700',
    marginBottom: 8,
  },

  locationText: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 3,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  alertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },

  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B91C1C',
  },

  alertText: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 21,
  },

  alertRecommendation: {
    color: '#7F1D1D',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  featureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 5,
  },

  featureText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
  },

  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});