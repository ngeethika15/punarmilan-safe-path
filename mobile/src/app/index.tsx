import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useDisaster } from '../context/DisasterContext';

export default function SafePathScreen() {
  const { sosRequests } = useDisaster();
  const [destination, setDestination] = useState('bengaluru');
  const [activeDestination, setActiveDestination] = useState('Bengaluru');
  const [distanceInfo, setDistanceInfo] = useState({ km: 118, mins: 177 });
  const [isNavigating, setIsNavigating] = useState(false);

  const [userCoords] = useState<[number, number]>([13.5502, 78.5026]);
  const [destCoords, setDestCoords] = useState<[number, number]>([12.9716, 77.5946]);

  const handlePlanRoute = () => {
    if (destination.trim()) {
      const formatted = destination.trim();
      setActiveDestination(formatted);
      setIsNavigating(false);

      if (formatted.toLowerCase().includes('bengaluru') || formatted.toLowerCase().includes('bangalore')) {
        setDestCoords([12.9716, 77.5946]);
        setDistanceInfo({ km: 118, mins: 177 });
      } else {
        setDestCoords([13.6288, 79.4192]);
        setDistanceInfo({ km: 142, mins: 210 });
      }
    }
  };

  const startLat = userCoords[0];
  const startLng = userCoords[1];
  const destLat = destCoords[0];
  const destLng = destCoords[1];

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .leaflet-routing-container { display: none !important; }

          .nav-banner {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            background: #005A5B;
            color: #ffffff;
            border-radius: 14px;
            padding: 10px 14px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            display: ${isNavigating ? 'flex' : 'none'};
            align-items: center;
            gap: 12px;
          }
          .nav-icon { font-size: 28px; font-weight: bold; line-height: 1; }
          .nav-details { flex: 1; }
          .nav-dist { font-size: 18px; font-weight: bold; }
          .nav-text { font-size: 14px; opacity: 0.95; font-weight: 500; }
          .nav-next { font-size: 11px; opacity: 0.75; margin-top: 2px; }

          .turn-popup-marker {
            background: #2563EB;
            color: white;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="nav-banner" id="banner">
          <div class="nav-icon" id="turnIcon">↰</div>
          <div class="nav-details">
            <div class="nav-dist" id="turnDist">300m</div>
            <div class="nav-text" id="turnText">Turn left</div>
            <div class="nav-next" id="turnNext">Then ➔ Turn right</div>
          </div>
        </div>

        <div id="map"></div>

        <script>
          const map = L.map('map', { zoomControl: false });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const routingControl = L.Routing.control({
            waypoints: [
              L.latLng(${startLat}, ${startLng}),
              L.latLng(${destLat}, ${destLng})
            ],
            lineOptions: {
              styles: [{ color: '#2563EB', opacity: 0.9, weight: 6 }]
            },
            createMarker: function(i, wp) {
              if (i === 0) {
                return L.marker(wp.latLng).bindPopup("<b>Start:</b> Madanapalle");
              }
              const greenIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              return L.marker(wp.latLng, {icon: greenIcon}).bindPopup("Destination");
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true
          }).addTo(map);

          routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const instructions = routes[0].instructions;

            if (instructions && instructions.length > 0) {
              const first = instructions[1] || instructions[0];
              document.getElementById('turnText').innerText = first.text || "Turn left";
              document.getElementById('turnDist').innerText = Math.round(first.distance) + "m";
            }

            let turnCount = 0;
            instructions.forEach(function(inst) {
              if (inst.type && turnCount < 4 && inst.distance > 50) {
                const coord = routes[0].coordinates[inst.index];
                if (coord) {
                  const label = inst.text.length > 16 ? inst.text.substring(0, 16) + '...' : inst.text;
                  const icon = L.divIcon({
                    className: 'custom-turn-label',
                    html: '<div class="turn-popup-marker">' + label + '</div>',
                    iconSize: [80, 20],
                    iconAnchor: [40, 10]
                  });
                  L.marker([coord.lat, coord.lng], { icon: icon }).addTo(map);
                  turnCount++;
                }
              }
            });
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.topNavbar}>
        <Text style={styles.brandTitle}>Expo Starter</Text>
        <View style={styles.navLinks}>
          <TouchableOpacity style={styles.navLinkActive}>
            <Text style={styles.navLinkActiveText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Docs ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter destination..."
          placeholderTextColor="#64748B"
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity style={styles.planBtn} onPress={handlePlanRoute}>
          <Text style={styles.planBtnText}>Plan Route</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${destCoords[0]}-${destCoords[1]}-${isNavigating}`}
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Route Map"
          />
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>Map view rendering in browser</Text>
          </View>
        )}
      </View>

      {/* Bottom Route Panel */}
      <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.liveBadgeRow}>
              <Text style={styles.redDot}>🔴</Text>
              <Text style={styles.liveTitle}>LIVE GOVT FEED</Text>
              <Text style={styles.liveSub}>(Updated every 3s)</Text>
            </View>
            <Text style={styles.journeyTag}>Evening Journey</Text>
          </View>

          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>
              ⚠️ Flash Flood Watch: Nearby river overflowing near Highway 44
            </Text>
            <Text style={styles.alertSub}>Sector Condition: Road closure risk ahead</Text>
          </View>

          {!isNavigating ? (
            <>
              <View style={styles.routeSection}>
                <Text style={styles.routeHeader}>Ready to begin your journey?</Text>
                <Text style={styles.routeMetrics}>
                  Distance: {distanceInfo.km} km | Est. Time: {distanceInfo.mins} mins
                </Text>
              </View>

              <View style={styles.recommendationBox}>
                <Text style={styles.recTag}>💡 Smart Dinner Stop Recommendation:</Text>
                <Text style={styles.recTitle}>
                  Highway Delights & Highway Plaza (Sector 4 (3 km before Next Village))
                </Text>
                <Text style={styles.recDesc}>
                  Recommended for Dinner because the upcoming 35 km route has zero verified restaurants and heavy rain is projected in the next village.
                </Text>
              </View>

              <TouchableOpacity style={styles.startBtn} onPress={() => setIsNavigating(true)}>
                <Text style={styles.startBtnText}>► Start Journey Now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.activeNavBox}>
              <Text style={styles.activeNavTitle}>
                🧭 Navigation Active to {activeDestination}
              </Text>
              <Text style={styles.activeNavSub}>
                Continuous safety scanning & weather monitoring active along highway route...
              </Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsNavigating(false)}>
                <Text style={styles.cancelBtnText}>End Navigation</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B132B' },
  topNavbar: {
    backgroundColor: '#1C2541',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brandTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  navLinks: { flexDirection: 'row', gap: 8 },
  navLink: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  navLinkText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  navLinkActive: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  navLinkActiveText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: '#0F172A' },
  planBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  planBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  mapContainer: { height: '48%', width: '100%' },
  webFallback: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  webFallbackText: { color: '#94A3B8' },
  bottomSheet: { flex: 1, backgroundColor: '#0B132B' },
  bottomSheetContent: { padding: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  redDot: { fontSize: 10 },
  liveTitle: { color: '#DC2626', fontWeight: 'bold', fontSize: 11 },
  liveSub: { color: '#64748B', fontSize: 11 },
  journeyTag: { color: '#2563EB', fontSize: 11, fontWeight: 'bold' },
  alertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  alertTitle: { color: '#991B1B', fontWeight: 'bold', fontSize: 13 },
  alertSub: { color: '#B91C1C', fontSize: 11, marginTop: 4 },
  routeSection: { marginBottom: 14 },
  routeHeader: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  routeMetrics: { fontSize: 13, color: '#475569', marginTop: 2 },
  recommendationBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  recTag: { color: '#1D4ED8', fontSize: 12, fontWeight: 'bold' },
  recTitle: { color: '#1E3A8A', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  recDesc: { color: '#334155', fontSize: 11, marginTop: 4, lineHeight: 16 },
  startBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  activeNavBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 14,
  },
  activeNavTitle: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  activeNavSub: { color: '#15803D', fontSize: 12, marginTop: 4 },
  cancelBtn: { marginTop: 12, backgroundColor: '#DC2626', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  cancelBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});