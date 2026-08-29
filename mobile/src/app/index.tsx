import React, { useEffect, useState, useRef } from 'react';
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

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const OFFLINE_VILLAGE_DATABASE = [
  {
    name: 'Bengaluru',
    lat: 12.9716,
    lon: 77.5946,
    weather: 'Sunny (28°C)',
    hazard: 'CLEAR',
    nextVillageWarning: 'No upcoming weather hazards detected.',
    breakfastStop: { name: 'Vidyarthi Bhavan', item: 'Crispy Masala Dosa & Filter Coffee', distanceKm: 4 },
  },
  {
    name: 'Sultanpur Village',
    lat: 13.0827,
    lon: 77.5877,
    weather: 'Heavy Rain & Thunderstorms',
    hazard: 'WARNING',
    nextVillageWarning: 'Rain starting in 15 mins! Road slippery near Sector 4.',
    breakfastStop: { name: 'Highway Dhaba & Shelter', item: 'Hot Parathas & Tea', distanceKm: 12 },
  },
  {
    name: 'Mysuru',
    lat: 12.2958,
    lon: 76.6394,
    weather: 'Cloudy (24°C)',
    hazard: 'CLEAR',
    nextVillageWarning: 'Clear pathway verified.',
    breakfastStop: { name: 'Hotel Mylari', item: 'Butter Dosa', distanceKm: 140 },
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getTimeOfDayCategory(): { meal: string; greeting: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return { meal: 'Breakfast', greeting: 'Morning' };
  if (hour >= 11 && hour < 16) return { meal: 'Lunch', greeting: 'Afternoon' };
  if (hour >= 16 && hour < 22) return { meal: 'Dinner', greeting: 'Evening' };
  return { meal: 'Late Night Snack', greeting: 'Night' };
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
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; timeMins: number } | null>(null);
  const [journeyState, setJourneyState] = useState<'IDLE' | 'CONFIRM_PRE_START' | 'IN_NAV'>('IDLE');

  const [offlineGovData, setOfflineGovData] = useState<{
    weatherAlert: string;
    nextVillageCondition: string;
    hazardLevel: 'CLEAR' | 'WARNING' | 'CRITICAL';
  }>({
    weatherAlert: 'Loaded Local Offline Government Cache',
    nextVillageCondition: 'Scanning regional maps...',
    hazardLevel: 'CLEAR',
  });

  const [foodAdvice, setFoodAdvice] = useState<any | null>(null);
  const pollTimer = useRef<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permissions needed for offline GPS.');
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (e) {
        setLocation({
          coords: {
            latitude: 12.9716,
            longitude: 77.5946,
            altitude: 0,
            accuracy: 5,
            altitudeAccuracy: 5,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    })();

    pollTimer.current = setInterval(() => {
      const target = OFFLINE_VILLAGE_DATABASE[Math.floor(Math.random() * OFFLINE_VILLAGE_DATABASE.length)];
      setOfflineGovData({
        weatherAlert: `${target.name}: ${target.weather}`,
        nextVillageCondition: target.nextVillageWarning,
        hazardLevel: target.hazard as any,
      });
    }, 3000);

    return () => clearInterval(pollTimer.current);
  }, []);

  const handleOfflineRouteSearch = async () => {
    if (!destinationInput.trim() || !location) return;

    setSearching(true);
    let targetLat = 12.9716;
    let targetLon = 77.5946;
    let targetName = destinationInput;
    let matchedOffline = OFFLINE_VILLAGE_DATABASE.find((v) =>
      v.name.toLowerCase().includes(destinationInput.toLowerCase())
    );

    if (matchedOffline) {
      targetLat = matchedOffline.lat;
      targetLon = matchedOffline.lon;
      targetName = matchedOffline.name;
    } else {
      targetLat = location.coords.latitude + 0.15;
      targetLon = location.coords.longitude + 0.12;
    }

    setDestinationCoords({ latitude: targetLat, longitude: targetLon, name: targetName });

    const dist = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      targetLat,
      targetLon
    );
    const estTime = Math.max(10, Math.round((dist / 40) * 60));
    setRouteInfo({ distanceKm: dist, timeMins: estTime });

    const timeInfo = getTimeOfDayCategory();
    const recommendedFood = matchedOffline?.breakfastStop || {
      name: 'Highway Local Eatery',
      item: 'Fresh Breakfast & Tea',
      distanceKm: 5,
    };

    setFoodAdvice({
      name: recommendedFood.name,
      type: timeInfo.meal,
      reason: `Offline Recommendation: Next 30 km has upcoming rain. Have your ${timeInfo.meal} here (${recommendedFood.item}) before entering low-signal zone.`,
    });

    setJourneyState('CONFIRM_PRE_START');
    setSearching(false);
  };

  const startJourney = () => {
    setJourneyState('IN_NAV');
  };

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Offline Maps & Offline Database...</Text>
      </View>
    );
  }

  const userLat = location.coords.latitude;
  const userLon = location.coords.longitude;
  const targetLat = destinationCoords?.latitude || userLat;
  const targetLon = destinationCoords?.longitude || userLon;
  const timeInfo = getTimeOfDayCategory();

  return (
    <View style={styles.container}>
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineBannerText}>📡 OFFLINE MODE: Running without internet connection</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Offline Search (e.g. Sultanpur, Bengaluru)..."
          placeholderTextColor="#94A3B8"
          value={destinationInput}
          onChangeText={setDestinationInput}
          onSubmitEditing={handleOfflineRouteSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleOfflineRouteSearch} disabled={searching}>
          {searching ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.searchButtonText}>Calculate</Text>}
        </TouchableOpacity>
      </View>

      {Platform.OS !== 'web' && MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: userLat, longitude: userLon, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          showsUserLocation={true}
        >
          <Marker coordinate={{ latitude: userLat, longitude: userLon }} title="Current GPS" />
          {destinationCoords && <Marker coordinate={{ latitude: targetLat, longitude: targetLon }} title={destinationCoords.name} pinColor="green" />}
        </MapView>
      ) : (
        <View style={styles.webMapContainer}>
          <iframe
            title="SafePath Offline Web Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(userLon, targetLon) - 0.05}%2C${Math.min(userLat, targetLat) - 0.05}%2C${Math.max(userLon, targetLon) + 0.05}%2C${Math.max(userLat, targetLat) + 0.05}&layer=mapnik&marker=${targetLat}%2C${targetLon}`}
          />
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.liveHeader}>
          <Text style={styles.offlineChip}>💾 LOCAL DATABASE ACTIVE</Text>
          <Text style={styles.timeBadge}>{timeInfo.greeting} Journey</Text>
        </View>

        <View style={[styles.alertBox, offlineGovData.hazardLevel === 'WARNING' ? styles.alertWarn : styles.alertOk]}>
          <Text style={styles.alertText}>⚠️ {offlineGovData.weatherAlert}</Text>
          <Text style={styles.subAlertText}>Offline Warning: {offlineGovData.nextVillageCondition}</Text>
        </View>

        {journeyState === 'CONFIRM_PRE_START' && routeInfo && (
          <View style={styles.preStartBox}>
            <Text style={styles.preStartTitle}>Pre-Journey Offline Check</Text>
            <Text style={styles.preStartSub}>
              Distance: <Text style={{ fontWeight: 'bold' }}>{routeInfo.distanceKm} km</Text> | Est. Time: <Text style={{ fontWeight: 'bold' }}>{routeInfo.timeMins} mins</Text>
            </Text>

            {foodAdvice && (
              <View style={styles.foodRecommendationCard}>
                <Text style={styles.foodTitle}>🍽️ Offline {timeInfo.meal} Stop Recommendation:</Text>
                <Text style={styles.foodName}>{foodAdvice.name}</Text>
                <Text style={styles.foodReason}>{foodAdvice.reason}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.startBtn} onPress={startJourney}>
              <Text style={styles.startBtnText}>▶ Start Offline Navigation</Text>
            </TouchableOpacity>
          </View>
        )}

        {journeyState === 'IN_NAV' && (
          <View style={styles.activeNavBox}>
            <Text style={styles.activeNavTitle}>🧭 Offline Navigation Active</Text>
            <Text style={styles.activeNavSub}>Using device GPS & pre-cached hazard maps...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  loadingText: { marginTop: 12, fontSize: 13, color: '#94A3B8' },
  map: { width: '100%', height: '100%' },
  webMapContainer: { width: '100%', height: '50%' },
  offlineBanner: { backgroundColor: '#1E293B', paddingVertical: 4, alignItems: 'center' },
  offlineBannerText: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold' },
  searchContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
  },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: '#1E293B' },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
  },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  offlineChip: { fontSize: 10, fontWeight: 'bold', color: '#059669', backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timeBadge: { fontSize: 10, fontWeight: 'bold', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  alertBox: { padding: 8, borderRadius: 8, marginBottom: 8 },
  alertOk: { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1 },
  alertWarn: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B', borderWidth: 1 },
  alertText: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  subAlertText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  preStartBox: { marginTop: 4 },
  preStartTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  preStartSub: { fontSize: 12, color: '#475569', marginTop: 2 },
  foodRecommendationCard: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#2563EB' },
  foodTitle: { fontSize: 11, fontWeight: 'bold', color: '#2563EB' },
  foodName: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
  foodReason: { fontSize: 11, color: '#475569', marginTop: 2 },
  startBtn: { backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  activeNavBox: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 6, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  activeNavTitle: { fontSize: 13, fontWeight: 'bold', color: '#166534' },
  activeNavSub: { fontSize: 11, color: '#15803D', marginTop: 2 },
});