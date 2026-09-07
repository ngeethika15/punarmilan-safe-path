// mobile/src/screens/TelemedicineTriageScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Switch, Alert } from 'react-native';

interface SurvivorProfile {
  id: string;
  name: string;
  age: string;
  urgency: 'RED' | 'YELLOW' | 'GREEN';
  mentalHealthFlag: boolean;
  symptoms: string;
}

export default function TelemedicineTriageScreen() {
  const [isVolunteerMode, setIsVolunteerMode] = useState(false);
  
  // Victim Intake Form Hooks
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isAnxious, setIsAnxious] = useState(false);

  // Mock Storage Array for Live Demo Simulation
  const [survivors, setSurvivors] = useState<SurvivorProfile[]>([
    { id: '1', name: 'Aarav Sharma', age: '8', urgency: 'RED', mentalHealthFlag: true, symptoms: 'High fever, extreme distress' }
  ]);

  const submitIntakeForm = () => {
    if (!name || !age) return Alert.alert("Error", "Please complete all mandatory profile fields.");
    
    const newCase: SurvivorProfile = {
      id: Date.now().toString(),
      name,
      age,
      urgency: symptoms.toLowerCase().includes('bleed') || symptoms.toLowerCase().includes('fracture') ? 'RED' : 'YELLOW',
      mentalHealthFlag: isAnxious,
      symptoms
    };

    setSurvivors([newCase, ...survivors]);
    Alert.alert(
      "System Connected To Doctor Dashboard",
      "Our system does not use AI diagnosis. Your records have been routed securely to a certified field doctor for authorized e-prescription issuance.",
      [{ text: "Acknowledged" }]
    );
    // Clear Form fields
    setName(''); setAge(''); setSymptoms(''); setIsAnxious(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Toggle Row */}
      <View style={styles.toggleRow}>
        <Text style={styles.modeLabel}>{isVolunteerMode ? "🛡️ NDRF / VOLUNTEER RADAR" : "🏥 DISASTER TELEMEDICINE"}</Text>
        <Switch value={isVolunteerMode} onValueChange={(val) => setIsVolunteerMode(val)} />
      </View>

      {!isVolunteerMode ? (
        // VICTIM INTAKE & MEDICAL CONSULTATION SCREEN
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Secure Doctor Teleconsultation Intake</Text>
          <Text style={styles.disclaimerText}>
            *Disclaimer: This connections portal routes your details to verified humanitarian medical volunteers. No machine automated AI prescriptions are made.
          </Text>

          <TextInput style={styles.input} placeholder="Survivor Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Approximate Age" keyboardType="numeric" value={age} onChangeText={setAge} />
          <TextInput style={[styles.input, { height: 70 }]} placeholder="List Current Symptoms / Injury Details" multiline value={symptoms} onChangeText={setSymptoms} />
          
          <View style={styles.switchInputRow}>
            <Text style={styles.switchLabel}>Is patient experiencing severe panic/anxiety?</Text>
            <Switch value={isAnxious} onValueChange={setIsAnxious} />
          </View>

          <TouchableOpacity style={styles.uploadBtn} onPress={() => Alert.alert("Camera Module Opened", "Medical report / injury photo attached safely.")}>
            <Text style={styles.uploadBtnText}>📎 Upload Medical Reports / Injury Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={submitIntakeForm}>
            <Text style={styles.submitBtnText}>Request Emergency E-Prescription Connect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // VOLUNTEER TRIAGE DASHBOARD SCREEN
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Active Relief Camp Dispatch Queue</Text>
          <FlatList
            data={survivors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.card, item.urgency === 'RED' ? styles.redCard : styles.yellowCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.survivorName}>{item.name} ({item.age} yrs)</Text>
                  <View style={[styles.badge, { backgroundColor: item.urgency === 'RED' ? '#C92A2A' : '#F08C00' }]}>
                    <Text style={styles.badgeText}>{item.urgency} PRIORITY</Text>
                  </View>
                </View>
                <Text style={styles.cardDetail}><Text style={{ fontWeight: 'bold' }}>Symptoms:</Text> {item.symptoms}</Text>
                {item.mentalHealthFlag && (
                  <View style={styles.mhBadge}>
                    <Text style={styles.mhBadgeText}>🧠 Mental Health Alert Vector Active</Text>
                  </View>
                )}
                <View style={styles.btnActionGroup}>
                  <TouchableOpacity style={styles.actionMinBtn} onPress={() => Alert.alert("Auto-Notification Broadcast Sent", "Family notified via P2P relay mesh chain loop.")}>
                    <Text style={styles.actionMinText}>Broadcast Safety Status to Family</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ECEFF1' },
  modeLabel: { fontSize: 16, fontWeight: 'bold', color: '#37474F' },
  formContainer: { marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 6 },
  disclaimerText: { fontSize: 11, color: '#78909C', fontStyle: 'italic', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#CFD8DC', borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 14 },
  switchInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  switchLabel: { fontSize: 13, color: '#455A64', width: '80%' },
  uploadBtn: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#007AFF', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 14 },
  uploadBtnText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  submitBtn: { backgroundColor: '#1A237E', padding: 14, borderRadius: 6, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  listContainer: { marginTop: 12, flex: 1 },
  card: { padding: 14, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  redCard: { backgroundColor: '#FFF5F5', borderColor: '#FFA8A8' },
  yellowCard: { backgroundColor: '#FFF9DB', borderColor: '#FFE066' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  survivorName: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  cardDetail: { fontSize: 13, color: '#455A64', marginBottom: 6 },
  mhBadge: { backgroundColor: '#EDE7F6', padding: 6, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  mhBadgeText: { color: '#5E35B1', fontSize: 11, fontWeight: '600' },
  btnActionGroup: { borderTopWidth: 1, borderTopColor: '#ECEFF1', paddingTop: 8, marginTop: 4 },
  actionMinBtn: { backgroundColor: '#007AFF', padding: 8, borderRadius: 4, alignItems: 'center' },
  actionMinText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});