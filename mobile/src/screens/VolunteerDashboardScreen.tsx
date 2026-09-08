import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CaseStatus =
  | "NEW"
  | "CLAIMED"
  | "VERIFIED"
  | "NEEDS_REVIEW";

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface RescueCase {
  id: string;
  registrationId: string;
  personName: string;
  age: number;
  type: "MISSING" | "FOUND";
  location: string;
  reportedAt: string;
  priority: Priority;
  status: CaseStatus;
  description: string;
  claimedBy?: string;
  verifiedAt?: string;
}

const STORAGE_KEY = "PUNARMILAN_VOLUNTEER_CASES";

const DEMO_CASES: RescueCase[] = [
  {
    id: "CASE-001",
    registrationId: "PM-2026-00124",
    personName: "Ravi Kumar",
    age: 42,
    type: "MISSING",
    location: "Near Relief Camp A, Bengaluru",
    reportedAt: "10 minutes ago",
    priority: "CRITICAL",
    status: "NEW",
    description:
      "Last seen wearing a blue shirt and black trousers. Family reports that the person may require regular medication.",
  },
  {
    id: "CASE-002",
    registrationId: "PM-2026-00125",
    personName: "Ananya",
    age: 16,
    type: "MISSING",
    location: "Government School Relief Centre",
    reportedAt: "25 minutes ago",
    priority: "HIGH",
    status: "NEW",
    description:
      "Last seen with a yellow backpack. Family is currently at Relief Camp B.",
  },
  {
    id: "CASE-003",
    registrationId: "PM-2026-00119",
    personName: "Unknown Male",
    age: 35,
    type: "FOUND",
    location: "Highway 44 Medical Camp",
    reportedAt: "35 minutes ago",
    priority: "HIGH",
    status: "CLAIMED",
    claimedBy: "Volunteer Team A",
    description:
      "Found at medical camp. Person is conscious but unable to provide complete identification details.",
  },
];

export default function VolunteerDashboardScreen() {
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [selectedCase, setSelectedCase] =
    useState<RescueCase | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setCases(JSON.parse(stored));
      } else {
        setCases(DEMO_CASES);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEMO_CASES)
        );
      }
    } catch (error) {
      console.error("Failed to load volunteer cases:", error);
      setCases(DEMO_CASES);
    }
  };

  const saveCases = async (updatedCases: RescueCase[]) => {
    setCases(updatedCases);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCases)
      );
    } catch (error) {
      console.error("Failed to save volunteer cases:", error);
    }
  };

  const claimCase = (caseId: string) => {
    const updated = cases.map((item) =>
      item.id === caseId
        ? {
            ...item,
            status: "CLAIMED" as CaseStatus,
            claimedBy: "Current Volunteer",
          }
        : item
    );

    saveCases(updated);

    Alert.alert(
      "Case claimed",
      "This case has been assigned to you for verification."
    );
  };

  const verifyCase = (caseId: string) => {
    const updated = cases.map((item) =>
      item.id === caseId
        ? {
            ...item,
            status: "VERIFIED" as CaseStatus,
            verifiedAt: new Date().toISOString(),
          }
        : item
    );

    saveCases(updated);

    setSelectedCase(null);

    Alert.alert(
      "✓ Case verified",
      "The case is now verified. In production, the verified workflow would notify the registered family contact."
    );
  };

  const markNeedsReview = (caseId: string) => {
    const updated = cases.map((item) =>
      item.id === caseId
        ? {
            ...item,
            status: "NEEDS_REVIEW" as CaseStatus,
          }
        : item
    );

    saveCases(updated);

    setSelectedCase(null);

    Alert.alert(
      "Case flagged",
      "The case has been marked for additional review."
    );
  };

  const criticalCount = cases.filter(
    (item) => item.priority === "CRITICAL"
  ).length;

  const pendingCount = cases.filter(
    (item) =>
      item.status === "NEW" ||
      item.status === "CLAIMED"
  ).length;

  const verifiedCount = cases.filter(
    (item) => item.status === "VERIFIED"
  ).length;

  const renderPriority = (priority: Priority) => {
    const labels: Record<Priority, string> = {
      CRITICAL: "🔴 CRITICAL",
      HIGH: "🟠 HIGH",
      MEDIUM: "🟡 MEDIUM",
      LOW: "🟢 LOW",
    };

    return labels[priority];
  };

  const renderStatus = (status: CaseStatus) => {
    const labels: Record<CaseStatus, string> = {
      NEW: "NEW",
      CLAIMED: "CLAIMED",
      VERIFIED: "VERIFIED",
      NEEDS_REVIEW: "NEEDS REVIEW",
    };

    return labels[status];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛟</Text>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Volunteer Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Disaster response & reunification verification
            </Text>
          </View>
        </View>

        {/* INTRO */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            Verify before you reunite
          </Text>

          <Text style={styles.introText}>
            Review missing and found-person reports,
            verify available evidence, and update case
            status. Family notification should happen
            only after authorized verification.
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {criticalCount}
            </Text>

            <Text style={styles.statLabel}>
              Critical
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {verifiedCount}
            </Text>

            <Text style={styles.statLabel}>
              Verified
            </Text>
          </View>
        </View>

        {/* CASE LIST */}
        <Text style={styles.sectionTitle}>
          Active Response Cases
        </Text>

        {cases.map((item) => (
          <View
            key={item.id}
            style={styles.caseCard}
          >
            <View style={styles.caseTopRow}>
              <View
                style={[
                  styles.typeBadge,
                  item.type === "MISSING"
                    ? styles.missingBadge
                    : styles.foundBadge,
                ]}
              >
                <Text style={styles.typeText}>
                  {item.type === "MISSING"
                    ? "MISSING"
                    : "FOUND"}
                </Text>
              </View>

              <Text style={styles.priority}>
                {renderPriority(item.priority)}
              </Text>
            </View>

            <Text style={styles.personName}>
              {item.personName}
            </Text>

            <Text style={styles.registration}>
              Registration: {item.registrationId}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>

              <Text style={styles.infoText}>
                {item.location}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕒</Text>

              <Text style={styles.infoText}>
                Reported {item.reportedAt}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                Status:
              </Text>

              <Text
                style={[
                  styles.statusValue,
                  item.status === "VERIFIED" &&
                    styles.verifiedText,
                  item.status === "NEEDS_REVIEW" &&
                    styles.reviewText,
                ]}
              >
                {renderStatus(item.status)}
              </Text>
            </View>

            {item.claimedBy && (
              <Text style={styles.claimedText}>
                Assigned to: {item.claimedBy}
              </Text>
            )}

            {/* ACTIONS */}
            <View style={styles.actions}>
              <Pressable
                style={styles.viewButton}
                onPress={() =>
                  setSelectedCase(item)
                }
              >
                <Text style={styles.viewButtonText}>
                  View case
                </Text>
              </Pressable>

              {item.status === "NEW" && (
                <Pressable
                  style={styles.claimButton}
                  onPress={() =>
                    claimCase(item.id)
                  }
                >
                  <Text style={styles.actionButtonText}>
                    Claim
                  </Text>
                </Pressable>
              )}

              {item.status === "CLAIMED" && (
                <Pressable
                  style={styles.verifyButton}
                  onPress={() =>
                    setSelectedCase(item)
                  }
                >
                  <Text style={styles.actionButtonText}>
                    Verify
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {/* SAFETY NOTICE */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>
            ⚠️ Verification safeguard
          </Text>

          <Text style={styles.noticeText}>
            A photo or name alone must not be treated as
            proof of identity. Production deployment
            should use authorized responder verification,
            audit logs, secure records, and approved
            family-contact workflows.
          </Text>
        </View>
      </ScrollView>

      {/* CASE MODAL */}
      {selectedCase && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                Case Verification
              </Text>

              <Text style={styles.modalCaseId}>
                {selectedCase.id}
              </Text>

              <View style={styles.modalDivider} />

              <Text style={styles.modalLabel}>
                Person
              </Text>

              <Text style={styles.modalValue}>
                {selectedCase.personName}
              </Text>

              <Text style={styles.modalLabel}>
                Age
              </Text>

              <Text style={styles.modalValue}>
                {selectedCase.age}
              </Text>

              <Text style={styles.modalLabel}>
                Registration ID
              </Text>

              <Text style={styles.modalValue}>
                {selectedCase.registrationId}
              </Text>

              <Text style={styles.modalLabel}>
                Location
              </Text>

              <Text style={styles.modalValue}>
                {selectedCase.location}
              </Text>

              <Text style={styles.modalLabel}>
                Identifying information
              </Text>

              <Text style={styles.modalValue}>
                {selectedCase.description}
              </Text>

              <Text style={styles.modalLabel}>
                Priority
              </Text>

              <Text style={styles.modalValue}>
                {renderPriority(selectedCase.priority)}
              </Text>

              <Text style={styles.modalLabel}>
                Current status
              </Text>

              <Text style={styles.modalValue}>
                {renderStatus(selectedCase.status)}
              </Text>

              {selectedCase.status !==
                "VERIFIED" && (
                <>
                  <Pressable
                    style={styles.verifyLargeButton}
                    onPress={() =>
                      verifyCase(selectedCase.id)
                    }
                  >
                    <Text
                      style={
                        styles.actionButtonText
                      }
                    >
                      ✓ Verify Case
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.reviewLargeButton}
                    onPress={() =>
                      markNeedsReview(
                        selectedCase.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.reviewButtonText
                      }
                    >
                      Flag for Additional Review
                    </Text>
                  </Pressable>
                </>
              )}

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setSelectedCase(null)
                }
              >
                <Text style={styles.closeButtonText}>
                  Close
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  container: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#0F3B6D",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    fontSize: 36,
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "#DCEAFE",
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
  },

  introCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE5EF",
    marginBottom: 14,
  },

  introTitle: {
    color: "#1E3A5F",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  introText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE5EF",
  },

  statNumber: {
    color: "#0F3B6D",
    fontSize: 25,
    fontWeight: "900",
  },

  statLabel: {
    color: "#718096",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#1E334D",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 12,
  },

  caseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#DCE5EF",
  },

  caseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  missingBadge: {
    backgroundColor: "#FEE2E2",
  },

  foundBadge: {
    backgroundColor: "#DCFCE7",
  },

  typeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#334155",
  },

  priority: {
    fontSize: 12,
    fontWeight: "800",
  },

  personName: {
    color: "#1E334D",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },

  registration: {
    color: "#718096",
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 5,
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 25,
    fontSize: 14,
  },

  infoText: {
    flex: 1,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  statusLabel: {
    color: "#64748B",
    fontSize: 12,
    marginRight: 6,
  },

  statusValue: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "900",
  },

  verifiedText: {
    color: "#15803D",
  },

  reviewText: {
    color: "#B91C1C",
  },

  claimedText: {
    color: "#475569",
    fontSize: 12,
    marginTop: 7,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#334155",
    fontWeight: "800",
    fontSize: 13,
  },

  claimButton: {
    flex: 1,
    backgroundColor: "#0F3B6D",
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },

  verifyButton: {
    flex: 1,
    backgroundColor: "#15803D",
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  notice: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F4D58D",
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
  },

  noticeTitle: {
    color: "#7C5A0A",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 5,
  },

  noticeText: {
    color: "#806B38",
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    color: "#1E334D",
    fontSize: 22,
    fontWeight: "900",
  },

  modalCaseId: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  modalLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },

  modalValue: {
    color: "#1E334D",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  verifyLargeButton: {
    backgroundColor: "#15803D",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  reviewLargeButton: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 9,
  },

  reviewButtonText: {
    color: "#92400E",
    fontWeight: "800",
    fontSize: 13,
  },

  closeButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 9,
  },

  closeButtonText: {
    color: "#334155",
    fontWeight: "800",
  },
});