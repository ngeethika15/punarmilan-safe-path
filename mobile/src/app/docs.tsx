import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useDisaster } from '../context/DisasterContext';

export default function DisasterNetworkScreen() {
  const { sosRequests, addSOSRequest } = useDisaster();
  const [activeTab, setActiveTab] = useState<'HEATMAP' | 'CHATBOT' | 'MESH'>('HEATMAP');
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hello. I am the offline Disaster Mental Health & Safety Assistant. How are you feeling?',
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = 'Thank you for sharing. Please remain near registered relief volunteers.';
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('panic') || lower.includes('scared') || lower.includes('trauma')) {
        botResponse = '⚠️ High Trauma Level Detected. A relief counselor has been notified via local mesh.';
      } else if (lower.includes('food') || lower.includes('water') || lower.includes('rescue')) {
        addSOSRequest({
          id: `SOS-90${sosRequests.length + 1}`,
          location: 'User Current GPS Bounds',
          needs: ['Food/Water Supply', 'General Assistance'],
          urgency: 'HIGH',
          timestamp: 'Just now via Chat Bot',
        });
        botResponse = 'ℹ️ Urgent SOS alert created and broadcast to the shared heatmap!';
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📡 DISASTER NETWORK & ACTION CENTER</Text>
        <Text style={styles.headerSubtitle}>P2P Mesh Data Sync & SOS Relief Command</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'HEATMAP' && styles.activeTab]} onPress={() => setActiveTab('HEATMAP')}>
          <Text style={[styles.tabText, activeTab === 'HEATMAP' && styles.activeTabText]}>🔥 SOS Heatmap ({sosRequests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'CHATBOT' && styles.activeTab]} onPress={() => setActiveTab('CHATBOT')}>
          <Text style={[styles.tabText, activeTab === 'CHATBOT' && styles.activeTabText]}>🧠 Mental Health Triage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'MESH' && styles.activeTab]} onPress={() => setActiveTab('MESH')}>
          <Text style={[styles.tabText, activeTab === 'MESH' && styles.activeTabText]}>⚡ Mesh Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'HEATMAP' && (
          <ScrollView>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Active SOS Needs & Supply Heatmap</Text>
              <Text style={styles.cardSub}>Shared across modules in real time</Text>

              {sosRequests.map((sos) => (
                <View key={sos.id} style={styles.sosCard}>
                  <View style={styles.sosHeader}>
                    <Text style={styles.sosId}>{sos.id}</Text>
                    <Text style={[styles.badge, sos.urgency === 'CRITICAL' ? styles.badgeDanger : styles.badgeWarn]}>
                      {sos.urgency}
                    </Text>
                  </View>
                  <Text style={styles.sosDetail}>📍 <Text style={styles.bold}>Target Location:</Text> {sos.location}</Text>
                  <Text style={styles.sosDetail}>📦 <Text style={styles.bold}>Urgent Needs:</Text> {sos.needs.join(', ')}</Text>
                  <Text style={styles.sosTime}>🕒 {sos.timestamp}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {activeTab === 'CHATBOT' && (
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatScroll}>
              {chatMessages.map((msg, index) => (
                <View key={index} style={[styles.chatBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput style={styles.chatInput} placeholder="Type status or SOS request..." placeholderTextColor="#94A3B8" value={chatInput} onChangeText={setChatInput} />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'MESH' && (
          <ScrollView>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔄 Peer-to-Peer Bluetooth Mesh Sync</Text>
              <Text style={styles.cardSub}>Relays shared state without cellular connection</Text>
              <TouchableOpacity style={styles.syncBtn} onPress={() => Alert.alert('Mesh Broadcast', 'State synced across all active nodes.')}>
                <Text style={styles.syncBtnText}>📡 Force Sync</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#38BDF8' },
  headerSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  activeTabText: { color: '#38BDF8' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardSub: { fontSize: 11, color: '#64748B', marginBottom: 12 },
  sosCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 8, marginBottom: 10 },
  sosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sosId: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  badge: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeDanger: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  badgeWarn: { backgroundColor: '#FEF3C7', color: '#D97706' },
  sosDetail: { fontSize: 12, color: '#334155', marginTop: 2 },
  sosTime: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  bold: { fontWeight: 'bold' },
  chatContainer: { flex: 1, justifyContent: 'space-between' },
  chatScroll: { flex: 1, marginBottom: 12 },
  chatBubble: { padding: 10, borderRadius: 10, marginBottom: 8, maxWidth: '85%' },
  userBubble: { backgroundColor: '#38BDF8', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#1E293B', alignSelf: 'flex-start' },
  userText: { color: '#FFFFFF', fontSize: 13 },
  botText: { color: '#F8FAFC', fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 8, padding: 10, color: '#FFFFFF', fontSize: 13, marginRight: 8 },
  sendBtn: { backgroundColor: '#38BDF8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  sendBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 },
  syncBtn: { backgroundColor: '#0284C7', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  syncBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});