import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useDisaster } from '../context/DisasterContext';

export default function SafePathScreen() {
  const { sosRequests, survivors } = useDisaster();
  const [searchQuery, setSearchQuery] = useState('');

  // Leaflet HTML map content with live SOS marker overlays from Context
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; background: #0f172a; }
          .sos-popup { font-family: sans-serif; font-size: 12px; color: #0f172a; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([12.9716, 77.5946], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Render pins from Context
          const sosPins = ${JSON.stringify(sosRequests)};
          sosPins.forEach(pin => {
            const coords = pin.coords || [12.9716, 77.5946];
            L.marker(coords).addTo(map)
              .bindPopup('<div class="sos-popup"><b>' + pin.id + '</b><br>' + pin.location + '<br>Urgency: ' + pin.urgency + '</div>');
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Offline Status Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>⚡ OFFLINE MODE: Running without internet connection</Text>
      </View>

      {/* Search Header */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Offline Search (e.g. Sultanpur, Bengaluru)..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.calcBtn}>
          <Text style={styles.calcBtnText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {/* Map View Frame */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
            title="SafePath Map"
          />
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>Open Map View in Browser Platform</Text>
          </View>
        )}
      </View>

      {/* Bottom Status Panel */}
      <View style={styles.bottomCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.statusBadge}>📱 LOCAL DATABASE ACTIVE</Text>
          <Text style={styles.timeText}>
            SOS Signals: {sosRequests.length} | Survivors: {survivors.length}
          </Text>
        </View>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ⚠️ <Text style={styles.bold}>Mysuru:</Text> Cloudy (24°C) — Offline Warning: Clear pathway verified.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  banner: { backgroundColor: '#D97706', paddingVertical: 6, alignItems: 'center' },
  bannerText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#1E293B', gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#0F172A' },
  calcBtn: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  calcBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  mapContainer: { flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
  webFallback: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  webFallbackText: { color: '#94A3B8', fontSize: 13 },
  bottomCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 14, borderRadius: 12 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { color: '#059669', fontSize: 10, fontWeight: 'bold' },
  timeText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  alertBox: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', padding: 8, borderRadius: 6 },
  alertText: { color: '#166534', fontSize: 11 },
  bold: { fontWeight: 'bold' },
});