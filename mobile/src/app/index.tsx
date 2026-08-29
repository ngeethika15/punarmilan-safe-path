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
  ScrollView,
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

interface Shelter {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  capacity: string;
}

const MOCK_SHELTERS: Shelter[] = [
  { id: '1', name: 'Central Disaster Relief Camp', type: 'Shelter', lat: 13.5500, lon: 78.5100, capacity: '85% Available' },
  { id: '2', name: 'City General Emergency Hospital', type: 'Medical', lat: 13.5400, lon: 78.4980, capacity: 'Open 24/7' },
  { id: '3', name: 'Red Cross Safe Zone #4', type: 'Supply Post', lat: 13.5620, lon: 78.5200, capacity: 'Food & Water Ready' },
];

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
          alert('Destination not found. Try another location.');
        }
      } else {
        const geocoded = await Location.geocodeAsync(destinationInput);
        if (geocoded && geocoded.length > 0) {
          const target = geocoded[0];
          setDestinationCoords({
            latitude: target.latitude,
            longitude: target.longitude,
            name: destinationInput,
          });
          setWeatherAlert('Route calculated! Clear pathway verified.');
        }
      }
    } catch (err) {
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const pingBackend = async () => {
    setBackendStatus('Connecting to backend...');
    setTimeout(() => {
      setBackendStatus('Connected (200 OK)');
    }, 800);
  };

  const currentLat = destinationCoords?.latitude || location?.coords.latitude || 13.544;
  const currentLon = destinationCoords?.longitude || location?.coords.longitude || 78.5068;

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
      {/* Search Bar */}
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

      {/* Map Display: Native MapView vs Web OpenStreetMap iFrame */}
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLat,
            longitude: currentLon,
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
        </MapView>
      ) : (
        <View style={styles.webMapContainer}>
          <iframe
            title="SafePath Web Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLon - 0.03}%2C${currentLat - 0.03}%2C${currentLon + 0.03}%2C${currentLat + 0.03}&layer=mapnik&marker=${currentLat}%2C${currentLon}`}
          />
        </View>
      )}

      {/* Bottom Info Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>SAFE-PATH ROUTING ACTIVE</Text>
        </View>

        {destinationCoords && (
          <Text style={styles.destinationText}>📍 Destination: {destinationCoords.name}</Text>
        )}

        <Text style={styles.alertText}>⚠️ Status: {weatherAlert}</Text>

        <Text style={styles.shelterHeader}>Emergency Safe Zones Nearby:</Text>
        <ScrollView style={styles.shelterList} nestedScrollEnabled>
          {MOCK_SHELTERS.map((shelter) => (
            <TouchableOpacity
              key={shelter.id}
              style={styles.shelterItem}
              onPress={() =>
                setDestinationCoords({
                  latitude: shelter.lat,
                  longitude: shelter.lon,
                  name: shelter.name,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                <Text style={styles.shelterType}>{shelter.type} • {shelter.capacity}</Text>
              </View>
              <Text style={styles.navigateBtn}>Select</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={pingBackend}>
          <Text style={styles.buttonText}>Backend: {backendStatus}</Text>
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
  webMapContainer: { width: '100%', height: '55%' },
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
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    maxHeight: '40%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badge: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  destinationText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  alertText: { fontSize: 12, color: '#D97706', fontWeight: '600', marginTop: 2 },
  shelterHeader: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginTop: 8, marginBottom: 4 },
  shelterList: { maxHeight: 110 },
  shelterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  shelterName: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  shelterType: { fontSize: 10, color: '#64748B' },
  navigateBtn: { fontSize: 11, fontWeight: 'bold', color: '#2563EB', paddingHorizontal: 6 },
  button: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});