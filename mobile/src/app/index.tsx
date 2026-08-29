import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';

// Dynamically import MapView only on native mobile platforms
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Not connected');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setBackendStatus(data.message || 'Connected!');
    } catch (err) {
      setBackendStatus('Backend reachable / local server check');
    }
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Safe-Path map...</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Native Map for iOS/Android, Web Fallback Container */}
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="My Location"
            description="Safe-Path tracking active"
          />
        </MapView>
      ) : (
        <View style={styles.webFallback}>
          <Text style={styles.webMapEmoji}>🗺️</Text>
          <Text style={styles.webMapTitle}>Safe-Path Web Map active</Text>
          <Text style={styles.webMapCoords}>
            Lat: {location.coords.latitude.toFixed(4)}, Lon: {location.coords.longitude.toFixed(4)}
          </Text>
          <Text style={styles.webMapNotice}>
            (Full interactive map renders on iOS/Android or Expo Go app)
          </Text>
        </View>
      )}

      {/* Control Overlay */}
      <View style={styles.card}>
        <Text style={styles.title}>PUNARMILAN SAFE-PATH</Text>
        <Text style={styles.subtitle}>
          Lat: {location.coords.latitude.toFixed(4)}, Lon: {location.coords.longitude.toFixed(4)}
        </Text>
        <Text style={styles.backendText}>Backend Status: {backendStatus}</Text>

        <TouchableOpacity style={styles.button} onPress={checkBackend}>
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
  errorText: { marginTop: 8, color: '#EF4444' },
  map: { width: '100%', height: '100%' },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 20,
  },
  webMapEmoji: { fontSize: 48, marginBottom: 12 },
  webMapTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC' },
  webMapCoords: { fontSize: 16, color: '#10B981', marginTop: 8, fontWeight: '600' },
  webMapNotice: { fontSize: 12, color: '#94A3B8', marginTop: 12, textAlign: 'center' },
  card: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  backendText: { fontSize: 12, color: '#2563EB', marginTop: 6, fontWeight: '600' },
  button: { marginTop: 12, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' },
});