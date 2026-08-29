import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

interface Survivor {
  id: string;
  name: string;
  age: string;
  gender: string;
  clothingColor: string;
  distinguishingMarks: string;
  campLocation: string;
  contactNumber: string;
  status: 'SAFE_IN_CAMP' | 'MEDICAL_ATTENTION' | 'UNIDENTIFIED';
}

const INITIAL_CAMP_SURVIVORS: Survivor[] = [
  {
    id: 'SURV-001',
    name: 'Aarav Sharma',
    age: '8',
    gender: 'Male',
    clothingColor: 'Red T-Shirt, Blue Shorts',
    distinguishingMarks: 'Small scar on left cheek',
    campLocation: 'Kathmandu Central Shelter Camp A',
    contactNumber: '+977-9801234567',
    status: 'SAFE_IN_CAMP',
  },
  {
    id: 'SURV-002',
    name: 'Unidentified Girl',
    age: '5-6',
    gender: 'Female',
    clothingColor: 'Yellow Floral Frock',
    distinguishingMarks: 'Silver bangles on right wrist',
    campLocation: 'Sultanpur High School Relief Hub',
    contactNumber: 'N/A (Registered by Volunteer)',
    status: 'UNIDENTIFIED',
  },
  {
    id: 'SURV-003',
    name: 'Ramesh Kumar',
    age: '45',
    gender: 'Male',
    clothingColor: 'Black Jacket, Grey Pants',
    distinguishingMarks: 'Tattoo on right arm',
    campLocation: 'Kathmandu Central Shelter Camp B',
    contactNumber: '+977-9841122334',
    status: 'MEDICAL_ATTENTION',
  },
];

export default function PunarmilanScreen() {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'REGISTER'>('SEARCH');
  const [survivors, setSurvivors] = useState<Survivor[]>(INITIAL_CAMP_SURVIVORS);

  // Search Filters (Multi-Attribute Survivor Matrix)
  const [searchName, setSearchName] = useState('');
  const [searchClothing, setSearchClothing] = useState('');
  const [searchMarks, setSearchMarks] = useState('');

  // Registration Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [clothingColor, setClothingColor] = useState('');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleRegister = () => {
    if (!clothingColor.trim() || !campLocation.trim()) {
      Alert.alert('Missing Fields', 'Please enter clothing details and camp location.');
      return;
    }

    const newSurvivor: Survivor = {
      id: `SURV-00${survivors.length + 1}`,
      name: name.trim() || 'Unidentified Person',
      age: age.trim() || 'Unknown',
      gender,
      clothingColor,
      distinguishingMarks: distinguishingMarks.trim() || 'None reported',
      campLocation,
      contactNumber: contactNumber.trim() || 'N/A',
      status: name.trim() ? 'SAFE_IN_CAMP' : 'UNIDENTIFIED',
    };

    setSurvivors([newSurvivor, ...survivors]);
    Alert.alert('Success', 'Survivor successfully registered to local camp database!');
    
    // Reset Form
    setName('');
    setAge('');
    setClothingColor('');
    setDistinguishingMarks('');
    setCampLocation('');
    setContactNumber('');
    setActiveTab('SEARCH');
  };

  const filteredSurvivors = survivors.filter((s) => {
    const matchesName = !searchName || s.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesClothing = !searchClothing || s.clothingColor.toLowerCase().includes(searchClothing.toLowerCase());
    const matchesMarks = !searchMarks || s.distinguishingMarks.toLowerCase().includes(searchMarks.toLowerCase());
    return matchesName && matchesClothing && matchesMarks;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤝 PUNARMILAN</Text>
        <Text style={styles.headerSubtitle}>Family Reunification & Offline Camp Rosters</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'SEARCH' && styles.activeTab]}
          onPress={() => setActiveTab('SEARCH')}
        >
          <Text style={[styles.tabText, activeTab === 'SEARCH' && styles.activeTabText]}>
            🔍 Missing Person Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'REGISTER' && styles.activeTab]}
          onPress={() => setActiveTab('REGISTER')}
        >
          <Text style={[styles.tabText, activeTab === 'REGISTER' && styles.activeTabText]}>
            ➕ Register Survivor
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'SEARCH' ? (
          <View>
            {/* Multi-Attribute Matrix Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Multi-Attribute Survivor Search</Text>
              <Text style={styles.cardSub}>Search by clothing, scars, tattoos, or name</Text>

              <TextInput
                style={styles.input}
                placeholder="Name (e.g. Aarav, Unidentified)..."
                value={searchName}
                onChangeText={setSearchName}
              />
              <TextInput
                style={styles.input}
                placeholder="Clothing Color (e.g. Red T-Shirt, Frock)..."
                value={searchClothing}
                onChangeText={setSearchClothing}
              />
              <TextInput
                style={styles.input}
                placeholder="Scars, Tattoos, Jewelry..."
                value={searchMarks}
                onChangeText={setSearchMarks}
              />
            </View>

            {/* Results List */}
            <Text style={styles.sectionHeader}>
              Registered Survivors in Relief Camps ({filteredSurvivors.length})
            </Text>

            {filteredSurvivors.map((item) => (
              <View key={item.id} style={styles.survivorCard}>
                <View style={styles.survivorHeader}>
                  <Text style={styles.survivorName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.status === 'UNIDENTIFIED' ? styles.statusWarn : styles.statusOk,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.survivorDetail}>
                  👤 <Text style={styles.bold}>Age/Gender:</Text> {item.age} yrs | {item.gender}
                </Text>
                <Text style={styles.survivorDetail}>
                  👕 <Text style={styles.bold}>Clothing:</Text> {item.clothingColor}
                </Text>
                <Text style={styles.survivorDetail}>
                  🏷️ <Text style={styles.bold}>Marks/Jewelry:</Text> {item.distinguishingMarks}
                </Text>
                <Text style={styles.survivorDetail}>
                  📍 <Text style={styles.bold}>Camp:</Text> {item.campLocation}
                </Text>
                <Text style={styles.survivorDetail}>
                  📞 <Text style={styles.bold}>Contact:</Text> {item.contactNumber}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          /* Registration Form */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Volunteer Camp Intake Form</Text>
            <Text style={styles.cardSub}>Save details locally to enable offline reunification matching</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name (Leave blank if unidentified)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Approximate Age"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <TextInput
              style={styles.input}
              placeholder="Clothing Color & Description *"
              value={clothingColor}
              onChangeText={setClothingColor}
            />
            <TextInput
              style={styles.input}
              placeholder="Distinguishing Marks (Scar, Tattoo, Jewelry)"
              value={distinguishingMarks}
              onChangeText={setDistinguishingMarks}
            />
            <TextInput
              style={styles.input}
              placeholder="Relief Camp Location Name *"
              value={campLocation}
              onChangeText={setCampLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Guardian / Volunteer Contact Number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
              <Text style={styles.submitBtnText}>💾 Save to Offline Camp Roster</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#1E293B' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#EF4444' },
  headerSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#EF4444' },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  activeTabText: { color: '#EF4444' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  cardSub: { fontSize: 11, color: '#64748B', marginBottom: 10 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8, color: '#0F172A' },
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8 },
  survivorCard: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 8 },
  survivorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  survivorName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  statusBadge: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusOk: { backgroundColor: '#D1FAE5', color: '#059669' },
  statusWarn: { backgroundColor: '#FEF3C7', color: '#D97706' },
  survivorDetail: { fontSize: 12, color: '#334155', marginTop: 2 },
  bold: { fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});