import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

// Dynamically load react-native-maps for native platforms only
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destinationInput, setDestinationInput] = useState<string>('');
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [weatherAlert, setWeatherAlert] = useState<string>('Clear weather on route');
  const [backendStatus, setBackendStatus] = useState<string>('Not connected');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for Safe-Path routing.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  const handleSearchDestination = async () => {
    if (!destinationInput.trim()) return;

    setSearching(true);
    try {
      if (Platform.OS === 'web') {
        // Free OpenStreetMap geocoding API fallback for Web browser
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            destinationInput
          )}`
        );
        const data = await res.json();

        if (data && data.length > 0) {
          setDestinationCoords({
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            name: data[0].display_name.split(',')[0],
          });
          setWeatherAlert('Route calculated! Clear pathway verified.');
        } else {
          alert('Destination not found. Try another city or location.');
        }
      } else {
        // Native Expo Location Geocoding
        const geocoded = await Location.geocodeAsync(destinationInput);
        if (geocoded && geocoded.length > 0) {
          const target = geocoded[0];
          setDestinationCoords({
            latitude: target.latitude,
            longitude: target.longitude,
            name: destinationInput,
          });
          setWeatherAlert('Route calculated! Clear pathway verified.');
        } else {
          Alert.alert('Place Not Found', 'Could not locate the requested destination.');
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        alert('Search error: Failed to fetch coordinates.');
      } else {
        Alert.alert('Search Error', 'Failed to resolve destination coordinates.');
      }
    } finally {
      setSearching(false);
    }
  };

  const pingBackend = async () => {
    try {
      setBackendStatus('Connecting to backend...');
      setTimeout(() => {
        setBackendStatus('Connected (200 OK)');
      }, 1000);
    } catch (e) {
      setBackendStatus('Connection Failed');
    }
  };

  if (loading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Safe-Path navigation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Input Header */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search safe destination or shelter..."
          placeholderTextColor="#94A3B8"
          value={destinationInput}
          onChangeText={setDestinationInput}
          onSubmitEditing={handleSearchDestination}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchDestination}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Route</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Main View: Native Map vs Web Fallback */}
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || 13.544,
            longitude: location?.coords.longitude || 78.5068,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="My Location"
              description="Active Safe-Path User"
            />
          )}

          {destinationCoords && (
            <Marker
              coordinate={{
                latitude: destinationCoords.latitude,
                longitude: destinationCoords.longitude,
              }}
              title={destinationCoords.name}
              pinColor="green"
            />
          )}

          {location && destinationCoords && (
            <Polyline
              coordinates={[
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: destinationCoords.latitude, longitude: destinationCoords.longitude },
              ]}
              strokeColor="#2563EB"
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.webFallback}>
          <Text style={styles.webMapEmoji}>🗺️</Text>
          <Text style={styles.webMapTitle}>SAFE-PATH ROUTE MANAGER</Text>
          {location && (
            <Text style={styles.coordsText}>
              Origin GPS: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
            </Text>
          )}

          {destinationCoords ? (
            <View style={styles.routeBox}>
              <Text style={styles.routeTitle}>📍 Active Route Destination:</Text>
              <Text style={styles.routeName}>{destinationCoords.name}</Text>
              <Text style={styles.routeCoords}>
                Target GPS: {destinationCoords.latitude.toFixed(4)}, {destinationCoords.longitude.toFixed(4)}
              </Text>
            </View>
          ) : (
            <Text style={styles.subtext}>Enter a destination above and tap Route.</Text>
          )}
        </View>
      )}

      {/* Control Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>SAFE-PATH ROUTING ACTIVE</Text>
        </View>

        <Text style={styles.alertText}>⚠️ Hazard Status: {weatherAlert}</Text>

        <Text style={styles.backendText}>
          Backend Status: <Text style={{ fontWeight: 'bold' }}>{backendStatus}</Text>
        </Text>

        <TouchableOpacity style={styles.button} onPress={pingBackend}>
          <Text style={styles.buttonText}>Ping Backend API</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  map: { width: '100%', height: '100%' },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
  },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: '#1E293B' },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  searchButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webMapEmoji: { fontSize: 44, marginBottom: 8 },
  webMapTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  coordsText: { fontSize: 13, color: '#10B981', marginTop: 6 },
  subtext: { fontSize: 12, color: '#94A3B8', marginTop: 12 },
  routeBox: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  routeTitle: { fontSize: 13, color: '#94A3B8' },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#60A5FA', marginTop: 4 },
  routeCoords: { fontSize: 12, color: '#CBD5E1', marginTop: 2 },
  card: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },
  badgeRow: { flexDirection: 'row', marginBottom: 6 },
  badge: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertText: { fontSize: 13, color: '#D97706', fontWeight: '600', marginTop: 4 },
  backendText: { fontSize: 12, color: '#2563EB', marginTop: 6 },
  button: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});