import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const STORAGE_KEY = "punarmilan_cases_v1";

type CaseType = "MISSING" | "FOUND" | "SAFE";
type CaseStatus = "PENDING" | "VERIFIED" | "MATCHED" | "CLOSED";

type PunarmilanCase = {
  id: string;
  type: CaseType;
  status: CaseStatus;
  name: string;
  age: string;
  phone: string;
  language: string;
  lastLocation: string;
  identifyingDetails: string;
  emergencyContact: string;
  photoNote: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
};

const emptyForm = {
  name: "",
  age: "",
  phone: "",
  language: "English",
  lastLocation: "",
  identifyingDetails: "",
  emergencyContact: "",
  photoNote: "",
};

function makeId() {
  return `PUN-${Date.now().toString().slice(-8)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export default function PunarmilanScreen() {
  const [cases, setCases] = useState<PunarmilanCase[]>([]);
  const [selectedType, setSelectedType] = useState<CaseType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCases(parsed);
      }
    } catch (error) {
      console.error("Unable to load Punarmilan cases", error);
    }
  };

  const saveCases = async (next: PunarmilanCase[]) => {
    setCases(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const captureLocation = async () => {
    try {
      setLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission",
          "Location permission is needed to attach the last known location to this report."
        );
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setLocationText(value);
      setForm((previous) => ({
        ...previous,
        lastLocation: value,
      }));
      return { latitude, longitude };
    } catch (error) {
      console.error("Location error", error);
      Alert.alert("Location unavailable", "Please enter the last known location manually.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openReport = (type: CaseType) => {
    setSelectedType(type);
    setForm(emptyForm);
    setLocationText("");
    setShowForm(true);
  };

  const submitReport = async () => {
    if (!selectedType) return;

    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter the person's name.");
      return;
    }

    if (!form.phone.trim() && !form.emergencyContact.trim()) {
      Alert.alert(
        "Contact required",
        "Please provide either a phone number or an emergency contact."
      );
      return;
    }

    setLoading(true);
    try {
      const id = makeId();
      const item: PunarmilanCase = {
        id,
        type: selectedType,
        status: "PENDING",
        name: form.name.trim(),
        age: form.age.trim(),
        phone: form.phone.trim(),
        language: form.language.trim() || "English",
        lastLocation: form.lastLocation.trim(),
        identifyingDetails: form.identifyingDetails.trim(),
        emergencyContact: form.emergencyContact.trim(),
        photoNote: form.photoNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const next = [item, ...cases];
      await saveCases(next);
      setShowForm(false);
      setSelectedType(null);
      setForm(emptyForm);

      Alert.alert(
        "Report registered",
        `${labelForType(item.type)} report created successfully.\n\nRegistration ID: ${item.id}\n\nKeep this ID for tracking and verification.`
      );
    } catch (error) {
      console.error("Unable to save report", error);
      Alert.alert("Error", "Unable to save the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCase = async (id: string) => {
    const target = cases.find((item) => item.id === id);
    if (!target) return;

    Alert.alert(
      "Volunteer verification",
      `Verify ${target.name}'s ${target.type.toLowerCase()} report?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: async () => {
            const next = cases.map((item) =>
              item.id === id ? { ...item, status: "VERIFIED" as CaseStatus } : item
            );
            await saveCases(next);
          },
        },
      ]
    );
  };

  const closeCase = async (id: string) => {
    const next = cases.map((item) =>
      item.id === id ? { ...item, status: "CLOSED" as CaseStatus } : item
    );
    await saveCases(next);
  };

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return cases;
    return cases.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.lastLocation.toLowerCase().includes(query)
    );
  }, [cases, search]);

  const counts = useMemo(
    () => ({
      total: cases.length,
      missing: cases.filter((item) => item.type === "MISSING" && item.status !== "CLOSED").length,
      found: cases.filter((item) => item.type === "FOUND" && item.status !== "CLOSED").length,
      safe: cases.filter((item) => item.type === "SAFE").length,
    }),
    [cases]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.heroIcon}>🤝</Text>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Punarmilan</Text>
              <Text style={styles.heroSubtitle}>Disaster reunification & safe-person registry</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Find people. Confirm safety. Reunite families.</Text>
            <Text style={styles.infoText}>
              Register missing or found persons, or mark someone safe. Volunteers can verify cases before a family notification is treated as confirmed.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value={counts.missing} label="Missing" />
            <Stat value={counts.found} label="Found" />
            <Stat value={counts.safe} label="Safe" />
          </View>

          <Text style={styles.sectionTitle}>Report a person</Text>
          <View style={styles.actionGrid}>
            <ActionButton emoji="🔴" title="Report Missing" subtitle="Person separated" onPress={() => openReport("MISSING")} />
            <ActionButton emoji="🟢" title="Report Found" subtitle="Person located" onPress={() => openReport("FOUND")} />
            <ActionButton emoji="🔵" title="I'm Safe" subtitle="Notify family" onPress={() => openReport("SAFE")} />
          </View>

          <Text style={styles.sectionTitle}>Search registry</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Registration ID, name, phone or location"
            placeholderTextColor="#8A93A3"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {filteredCases.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptyText}>
                New reports will appear here on this device. In production, this registry should be backed by a secure government/authorized disaster-response server.
              </Text>
            </View>
          ) : (
            filteredCases.map((item) => (
              <CaseCard
                key={item.id}
                item={item}
                onVerify={() => verifyCase(item.id)}
                onClose={() => closeCase(item.id)}
              />
            ))
          )}

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>⚠️ Demo / SIH prototype</Text>
            <Text style={styles.demoText}>
              Records are currently stored locally on this device. Do not treat this prototype registry as an official identity database. Production should use authenticated government/authorized responder access, audit logs, encryption and verified family-contact workflows.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedType ? labelForType(selectedType) : "Report"}</Text>
                  <Text style={styles.modalSubtitle}>Provide only information needed for reunification.</Text>
                </View>
                <Pressable onPress={() => setShowForm(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <Field label="Full name *" value={form.name} onChangeText={(value) => setForm((p) => ({ ...p, name: value }))} placeholder="Person's name" />
              <Field label="Age" value={form.age} onChangeText={(value) => setForm((p) => ({ ...p, age: value }))} placeholder="Age" keyboardType="number-pad" />
              <Field label="Phone" value={form.phone} onChangeText={(value) => setForm((p) => ({ ...p, phone: value }))} placeholder="Phone number" keyboardType="phone-pad" />
              <Field label="Language" value={form.language} onChangeText={(value) => setForm((p) => ({ ...p, language: value }))} placeholder="English / Hindi / Kannada" />
              <Field label="Emergency contact" value={form.emergencyContact} onChangeText={(value) => setForm((p) => ({ ...p, emergencyContact: value }))} placeholder="Name + phone" keyboardType="phone-pad" />

              <Text style={styles.fieldLabel}>Last known / current location</Text>
              <View style={styles.locationRow}>
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  value={form.lastLocation}
                  onChangeText={(value) => setForm((p) => ({ ...p, lastLocation: value }))}
                  placeholder="Area, camp, landmark or coordinates"
                  placeholderTextColor="#8A93A3"
                />
                <Pressable style={styles.gpsButton} onPress={captureLocation} disabled={loading}>
                  <Text style={styles.gpsButtonText}>{loading ? "..." : "GPS"}</Text>
                </Pressable>
              </View>
              {!!locationText && <Text style={styles.gpsHint}>Current device location captured: {locationText}</Text>}

              <Field
                label="Clothing / identifying details"
                value={form.identifyingDetails}
                onChangeText={(value) => setForm((p) => ({ ...p, identifyingDetails: value }))}
                placeholder="Clothes, bag, marks, belongings, etc."
                multiline
              />
              <Field
                label="Photo reference (optional)"
                value={form.photoNote}
                onChangeText={(value) => setForm((p) => ({ ...p, photoNote: value }))}
                placeholder="Describe where the authorized photo is stored; photo upload can be connected later."
                multiline
              />

              <View style={styles.privacyNote}>
                <Text style={styles.privacyTitle}>🔐 Privacy & verification</Text>
                <Text style={styles.privacyText}>
                  Only authorized responders should access sensitive records. A report is PENDING until a volunteer/responder verifies it.
                </Text>
              </View>

              <Pressable style={styles.submitButton} onPress={submitReport} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? "Saving..." : "Register report"}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function labelForType(type: CaseType) {
  if (type === "MISSING") return "Report Missing Person";
  if (type === "FOUND") return "Report Found Person";
  return "I'm Safe";
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  emoji,
  title,
  subtitle,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "number-pad" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A93A3"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function CaseCard({
  item,
  onVerify,
  onClose,
}: {
  item: PunarmilanCase;
  onVerify: () => void;
  onClose: () => void;
}) {
  const typeLabel = item.type === "MISSING" ? "MISSING" : item.type === "FOUND" ? "FOUND" : "SAFE";
  const typeStyle = item.type === "MISSING" ? styles.redPill : item.type === "FOUND" ? styles.greenPill : styles.bluePill;

  return (
    <View style={styles.caseCard}>
      <View style={styles.caseTopRow}>
        <View style={[styles.typePill, typeStyle]}>
          <Text style={styles.typePillText}>{typeLabel}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.caseName}>{item.name}</Text>
      {!!item.age && <Text style={styles.caseMeta}>Age: {item.age}</Text>}
      <Text style={styles.caseMeta}>ID: {item.id}</Text>
      {!!item.lastLocation && <Text style={styles.caseMeta}>📍 {item.lastLocation}</Text>}
      {!!item.identifyingDetails && <Text style={styles.caseDetails}>{item.identifyingDetails}</Text>}
      <View style={styles.caseActions}>
        {item.status === "PENDING" && (
          <Pressable style={styles.verifyButton} onPress={onVerify}>
            <Text style={styles.verifyButtonText}>✓ Volunteer verify</Text>
          </Pressable>
        )}
        {item.status !== "CLOSED" && (
          <Pressable style={styles.closeCaseButton} onPress={onClose}>
            <Text style={styles.closeCaseText}>Close case</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  flex: { flex: 1 },
  container: { padding: 18, paddingBottom: 40 },
  hero: {
    backgroundColor: "#123B68",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  heroIcon: { fontSize: 38, marginRight: 14 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  heroSubtitle: { color: "#DDEAF7", marginTop: 5, fontSize: 13, lineHeight: 19 },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },
  infoTitle: { fontSize: 16, fontWeight: "800", color: "#18324D" },
  infoText: { marginTop: 7, color: "#607087", fontSize: 13, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#173E68" },
  statLabel: { marginTop: 2, color: "#718096", fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#1A2F46", marginTop: 22, marginBottom: 10 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: {
    width: "31.9%",
    minHeight: 122,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  actionEmoji: { fontSize: 28 },
  actionTitle: { fontSize: 13, fontWeight: "800", color: "#233B55", textAlign: "center", marginTop: 7 },
  actionSubtitle: { fontSize: 10, color: "#7A8798", textAlign: "center", marginTop: 3 },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E1EA",
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 15,
    color: "#233B55",
    fontSize: 14,
  },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20, marginTop: 12, alignItems: "center" },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { marginTop: 8, fontSize: 16, fontWeight: "800", color: "#233B55" },
  emptyText: { textAlign: "center", marginTop: 6, color: "#748197", fontSize: 12, lineHeight: 18 },
  caseCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#E1E8F0" },
  caseTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typePill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  redPill: { backgroundColor: "#FFE8E8" },
  greenPill: { backgroundColor: "#E4F7EC" },
  bluePill: { backgroundColor: "#E5F0FF" },
  typePillText: { fontSize: 10, fontWeight: "800", color: "#26384B" },
  statusPill: { backgroundColor: "#F0F3F7", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: "800", color: "#607087" },
  caseName: { fontSize: 18, fontWeight: "800", color: "#1D334C", marginTop: 10 },
  caseMeta: { fontSize: 12, color: "#68778A", marginTop: 4 },
  caseDetails: { fontSize: 12, color: "#4F6176", marginTop: 8, lineHeight: 18 },
  caseActions: { flexDirection: "row", gap: 8, marginTop: 13 },
  verifyButton: { backgroundColor: "#123B68", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  verifyButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  closeCaseButton: { backgroundColor: "#F1F4F7", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  closeCaseText: { color: "#53657A", fontSize: 11, fontWeight: "800" },
  demoCard: { backgroundColor: "#FFF9E8", borderRadius: 16, padding: 15, marginTop: 20, borderWidth: 1, borderColor: "#F1E2AE" },
  demoTitle: { fontSize: 13, fontWeight: "800", color: "#715B18" },
  demoText: { marginTop: 5, color: "#786A3E", fontSize: 11, lineHeight: 17 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(9,25,42,0.55)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#F7F9FC", borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: "92%", padding: 18 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#173654" },
  modalSubtitle: { color: "#728096", fontSize: 11, marginTop: 4, maxWidth: 280 },
  closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E9EEF4", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#526479", fontSize: 17 },
  fieldLabel: { color: "#344B63", fontSize: 12, fontWeight: "800", marginTop: 11, marginBottom: 6 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8E1EB", borderRadius: 12, minHeight: 47, paddingHorizontal: 13, color: "#263E57", fontSize: 13 },
  multilineInput: { minHeight: 90, paddingTop: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  locationInput: { flex: 1 },
  gpsButton: { backgroundColor: "#123B68", borderRadius: 12, minHeight: 47, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  gpsButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  gpsHint: { fontSize: 10, color: "#687A8E", marginTop: 5 },
  privacyNote: { backgroundColor: "#EEF5FC", borderRadius: 13, padding: 12, marginTop: 14 },
  privacyTitle: { color: "#214A72", fontSize: 12, fontWeight: "800" },
  privacyText: { color: "#5B6D81", fontSize: 10, lineHeight: 15, marginTop: 4 },
  submitButton: { backgroundColor: "#0F6B4D", borderRadius: 14, minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 15, marginBottom: 20 },
  submitButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
