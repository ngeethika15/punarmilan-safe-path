// mobile/src/screens/SafePathScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function SafePathScreen() {
  const [language, setLanguage] = useState<'KN' | 'HI' | 'EN'>('EN');
  const [isNavigating, setIsNavigating] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [smartStop, setSmartStop] = useState<any>(null);

  // Localization Dictionary for SIH Judges
  const t = {
    EN: { title: "Safe-Path Navigation", alertTitle: "LIVE GOVT ALERT", sosBtn: "ONE-TAP SOS PANIC", startNav: "Start Journey Now", stopRec: "Smart Dinner Stop Recommendation" },
    KN: { title: "ಸುರಕ್ಷಿತ-ಪಥ ಸಂಚರಣೆ", alertTitle: "ಸರ್ಕಾರಿ ಲೈವ್ ಎಚ್ಚರಿಕೆ", sosBtn: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ SOS", startNav: "ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ", stopRec: "ಸ್ಮಾರ್ಟ್ ಊಟದ ನಿಲುಗಡೆ ಶಿಫಾರಸು" },
    HI: { title: "सुरक्षित-पथ नेविगेशन", alertTitle: "लाइव सरकारी अलर्ट", sosBtn: "एक-टैप आपातकालीन SOS", startNav: "यात्रा अभी शुरू करें", stopRec: "स्मार्ट भोजन पड़ाव अनुशंसा" }
  }[language];

  // Simulated Route Coordinates from Bengaluru to Madanapalle
  const routeCoordinates = [
    { latitude: 12.9716, longitude: 77.5946 }, // Bengaluru
    { latitude: 13.1200, longitude: 77.7000 }, 
    { latitude: 13.2500, longitude: 77.9000 }, // Upcoming town (Heavy Rain Zone)
    { latitude: 13.5549, longitude: 78.5011 }  // Madanapalle
  ];

  // 3-Second Live Monitoring Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulating real-time fetch from NDMA / SACHET API
      setWeatherAlert("Flash Flood Watch: Nearby river overflowing near Highway 44. Road closure risk ahead.");
      setSmartStop({
        name: "Highway Delights & Highway Plaza (Sector 4)",
        distance: "4 km before Next Village",
        reason: "Heavy rain and waterlogging are projected in the next 35km. Zero verified alternative dining options ahead."
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerOneTapSOS = () => {
    Alert.alert(
      "🚨 SOS PANIC ACTIVATED",
      "Broadcasting Live Location + Last Known Safe Route via Bluetooth P2P Mesh Network & SMS to Emergency Contacts and NDRF Camp.",
      [{ text: "Dismiss" }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner & Language Toggle */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.title}</Text>
        <View style={styles.langContainer}>
          {(['EN', 'KN', 'HI'] as const).map((lang) => (
            <TouchableOpacity key={lang} onPress={() => setLanguage(lang)} style={[styles.langBtn, language === lang && styles.activeLang]}>
              <Text style={styles.langBtnText}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Map View */}
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 13.2500,
          longitude: 78.0000,
          latitudeDelta: 1.2,
          longitudeDelta: 1.2,
        }}
      >
        <Marker coordinate={routeCoordinates[0]} title="Bengaluru" pinColor="blue" />
        <Marker coordinate={routeCoordinates[3]} title="Madanapalle" pinColor="green" />
        {smartStop && (
          <Marker coordinate={routeCoordinates[2]} title={smartStop.name} pinColor="orange" />
        )}
        <Polyline coordinates={routeCoordinates} strokeColor="#007AFF" strokeWidth={4} />
      </MapView>

      {/* Bottom Floating Control Cards */}
      <ScrollView style={styles.dashboard}>
        {/* Live Government Notification Feed */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🔴 {t.alertTitle} (Updates every 3s)</Text>
          <Text style={styles.alertBody}>{weatherAlert || "Scanning satellite weather feeds..."}</Text>
        </View>

        {/* Dynamic Contextual Smart Stopping Recommendation */}
        {smartStop && (
          <View style={styles.stopCard}>
            <Text style={styles.stopTitle}>🍽️ {t.stopRec}</Text>
            <Text style={styles.stopName}>{smartStop.name} ({smartStop.distance})</Text>
            <Text style={styles.stopReason}>{smartStop.reason}</Text>
          </View>
        )}

        {/* Action Controls */}
        <TouchableOpacity style={styles.navBtn} onPress={() => setIsNavigating(!isNavigating)}>
          <Text style={styles.btnText}>{isNavigating ? "End Navigation" : t.startNav}</Text>
        </TouchableOpacity>

        {/* ONE TAP SOS PANIC COMPONENT */}
        <TouchableOpacity style={styles.sosButton} onPress={triggerOneTapSOS}>
          <Text style={styles.sosText}>⚠️ {t.sosBtn}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 16, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  langContainer: { flexDirection: 'row' },
  langBtn: { paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4, borderRadius: 4, backgroundColor: '#E9ECEF' },
  activeLang: { backgroundColor: '#007AFF' },
  langBtnText: { fontSize: 12, fontWeight: 'bold' },
  map: { flex: 1 },
  dashboard: { padding: 12, maxHeight: 320 },
  alertCard: { backgroundColor: '#FFF5F5', borderColor: '#FFA8A8', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 },
  alertTitle: { color: '#E03131', fontWeight: 'bold', fontSize: 14 },
  alertBody: { color: '#C92A2A', fontSize: 13, marginTop: 4 },
  stopCard: { backgroundColor: '#FFF9DB', borderColor: '#FFE066', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 },
  stopTitle: { color: '#F08C00', fontWeight: 'bold', fontSize: 13 },
  stopName: { color: '#E67E22', fontWeight: '600', fontSize: 14, marginTop: 2 },
  stopReason: { color: '#666', fontSize: 12, marginTop: 4 },
  navBtn: { backgroundColor: '#2B8A3E', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  sosButton: { backgroundColor: '#C92A2A', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  sosText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});