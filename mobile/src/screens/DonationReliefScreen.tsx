import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DonationType =
  | "Money"
  | "Food"
  | "Water"
  | "Medicines"
  | "Clothes"
  | "Medical Equipment"
  | "Baby Supplies"
  | "Blood"
  | "Transport";

type DonationOption = {
  id: DonationType;
  emoji: string;
  title: string;
  description: string;
};

const DONATION_OPTIONS: DonationOption[] = [
  {
    id: "Money",
    emoji: "💰",
    title: "Financial Donation",
    description: "Support verified disaster-relief efforts",
  },
  {
    id: "Food",
    emoji: "🍚",
    title: "Food",
    description: "Rice, meals, biscuits and packaged food",
  },
  {
    id: "Water",
    emoji: "💧",
    title: "Water",
    description: "Drinking water and purification supplies",
  },
  {
    id: "Medicines",
    emoji: "💊",
    title: "Medicines",
    description: "Verified medicines and medical supplies",
  },
  {
    id: "Clothes",
    emoji: "🧥",
    title: "Clothes & Blankets",
    description: "Clean clothes, blankets and hygiene kits",
  },
  {
    id: "Medical Equipment",
    emoji: "🩺",
    title: "Medical Equipment",
    description: "First-aid and approved medical equipment",
  },
  {
    id: "Baby Supplies",
    emoji: "🍼",
    title: "Baby Supplies",
    description: "Baby food, diapers and essentials",
  },
  {
    id: "Blood",
    emoji: "🩸",
    title: "Blood Donation",
    description: "Help verified hospitals and camps",
  },
  {
    id: "Transport",
    emoji: "🚚",
    title: "Transport / Logistics",
    description: "Offer vehicles or delivery support",
  },
];

const DONATION_AMOUNTS = [
  100,
  250,
  500,
  1000,
  2500,
  5000,
];

export default function DonationReliefScreen() {
  const [selectedType, setSelectedType] =
    useState<DonationType>("Money");

  const [selectedAmount, setSelectedAmount] =
    useState<number>(500);

  const [customAmount, setCustomAmount] =
    useState<string>("");

  const [moneyModalVisible, setMoneyModalVisible] =
    useState<boolean>(false);

  const [supplyModalVisible, setSupplyModalVisible] =
    useState<boolean>(false);

  const [donorName, setDonorName] =
    useState<string>("");

  const [donorPhone, setDonorPhone] =
    useState<string>("");

  const [quantity, setQuantity] =
    useState<string>("");

  const [location, setLocation] =
    useState<string>("");

  const [notes, setNotes] =
    useState<string>("");

  const finalAmount = useMemo(() => {
    if (customAmount.trim().length > 0) {
      const amount = Number(customAmount);

      if (!Number.isNaN(amount)) {
        return amount;
      }
    }

    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const openDonationOption = (
    option: DonationOption
  ) => {
    setSelectedType(option.id);

    if (option.id === "Money") {
      setMoneyModalVisible(true);
    } else {
      setSupplyModalVisible(true);
    }
  };

  const closeSupplyModal = () => {
    setSupplyModalVisible(false);
  };

  const closeMoneyModal = () => {
    setMoneyModalVisible(false);
  };

  const submitMoneyDonation = () => {
    if (finalAmount < 10) {
      Alert.alert(
        "Invalid amount",
        "Please select or enter a donation amount of at least ₹10."
      );

      return;
    }

    setMoneyModalVisible(false);

    Alert.alert(
      "Donation Ready ❤️",
      `Your ₹${finalAmount.toLocaleString(
        "en-IN"
      )} donation is ready.\n\nFor the production version, this will open a verified payment gateway.`,
      [
        {
          text: "OK",
          onPress: () => {
            setCustomAmount("");
          },
        },
      ]
    );
  };

  const submitSupplyDonation = () => {
    if (!donorName.trim()) {
      Alert.alert(
        "Name required",
        "Please enter your name."
      );
      return;
    }

    if (!donorPhone.trim()) {
      Alert.alert(
        "Contact required",
        "Please enter your contact number."
      );
      return;
    }

    if (!quantity.trim()) {
      Alert.alert(
        "Contribution required",
        "Please enter what you can provide."
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        "Location required",
        "Please enter your pickup or delivery location."
      );
      return;
    }

    setSupplyModalVisible(false);

    Alert.alert(
      "Thank you for helping ❤️",
      `Your ${selectedType.toLowerCase()} contribution has been registered.\n\nA verified relief coordinator can contact you regarding collection or delivery.`,
      [
        {
          text: "Done",
          onPress: () => {
            setQuantity("");
            setLocation("");
            setNotes("");
          },
        },
      ]
    );
  };

  const requestHelp = () => {
    Alert.alert(
      "Request Disaster Assistance",
      "Choose the type of help you need.",
      [
        {
          text: "Food",
          onPress: () =>
            Alert.alert(
              "Food request",
              "Food assistance request created."
            ),
        },
        {
          text: "Water",
          onPress: () =>
            Alert.alert(
              "Water request",
              "Water assistance request created."
            ),
        },
        {
          text: "Medicine",
          onPress: () =>
            Alert.alert(
              "Medical request",
              "Medical assistance request created."
            ),
        },
        {
          text: "Shelter",
          onPress: () =>
            Alert.alert(
              "Shelter request",
              "Shelter assistance request created."
            ),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerHeart}>
            <Text style={styles.headerHeartText}>
              ❤️
            </Text>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Donate & Help
            </Text>

            <Text style={styles.subtitle}>
              Support disaster-affected families with
              essential resources.
            </Text>
          </View>
        </View>

        {/* VERIFIED RELIEF CARD */}

        <View style={styles.verifiedCard}>
          <View style={styles.verifiedIcon}>
            <Text style={styles.verifiedEmoji}>
              🛡️
            </Text>
          </View>

          <View style={styles.flex}>
            <Text style={styles.verifiedTitle}>
              Verified relief network
            </Text>

            <Text style={styles.verifiedDescription}>
              Financial donations should be routed only
              through verified government, NGO or
              authorized relief partners.
            </Text>
          </View>
        </View>

        {/* EMERGENCY NEEDS */}

        <View style={styles.needsCard}>
          <View style={styles.needsHeader}>
            <Text style={styles.alertEmoji}>
              ⚠️
            </Text>

            <Text style={styles.needsTitle}>
              Current relief needs
            </Text>
          </View>

          <Text style={styles.needsDescription}>
            After a disaster, affected families may need
            food, clean water, medicines, blankets,
            medical supplies and transport.
          </Text>
        </View>

        {/* SECTION */}

        <Text style={styles.sectionTitle}>
          How would you like to help?
        </Text>

        {/* DONATION GRID */}

        <View style={styles.grid}>
          {DONATION_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() =>
                openDonationOption(option)
              }
              style={({ pressed }) => [
                styles.donationCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionEmojiContainer}>
                <Text style={styles.optionEmoji}>
                  {option.emoji}
                </Text>
              </View>

              <Text style={styles.optionTitle}>
                {option.title}
              </Text>

              <Text style={styles.optionDescription}>
                {option.description}
              </Text>

              <View style={styles.helpRow}>
                <Text style={styles.helpText}>
                  Help
                </Text>

                <Text style={styles.arrow}>
                  →
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* REQUEST HELP */}

        <View style={styles.requestCard}>
          <View style={styles.requestIcon}>
            <Text style={styles.requestEmoji}>
              🤝
            </Text>
          </View>

          <View style={styles.flex}>
            <Text style={styles.requestTitle}>
              Need essential supplies?
            </Text>

            <Text style={styles.requestDescription}>
              People affected by disasters can request
              food, water, medicine, shelter or other
              basic necessities.
            </Text>

            <Pressable
              onPress={requestHelp}
              style={({ pressed }) => [
                styles.requestButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.requestButtonText}>
                Request assistance
              </Text>

              <Text style={styles.requestArrow}>
                →
              </Text>
            </Pressable>
          </View>
        </View>

        {/* RELIEF FLOW */}

        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>
            How relief support works
          </Text>

          <View style={styles.flowStep}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>
                1
              </Text>
            </View>

            <View style={styles.flex}>
              <Text style={styles.stepTitle}>
                Register support
              </Text>

              <Text style={styles.stepDescription}>
                Donor provides the type and quantity of
                support available.
              </Text>
            </View>
          </View>

          <View style={styles.flowLine} />

          <View style={styles.flowStep}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>
                2
              </Text>
            </View>

            <View style={styles.flex}>
              <Text style={styles.stepTitle}>
                Relief team verifies
              </Text>

              <Text style={styles.stepDescription}>
                Verified volunteers or organizations
                coordinate the contribution.
              </Text>
            </View>
          </View>

          <View style={styles.flowLine} />

          <View style={styles.flowStep}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>
                3
              </Text>
            </View>

            <View style={styles.flex}>
              <Text style={styles.stepTitle}>
                Reach affected people
              </Text>

              <Text style={styles.stepDescription}>
                Supplies can be directed to camps,
                hospitals or affected communities.
              </Text>
            </View>
          </View>
        </View>

        {/* TRANSPARENCY */}

        <View style={styles.transparencyCard}>
          <Text style={styles.infoEmoji}>
            ℹ️
          </Text>

          <Text style={styles.transparencyText}>
            Punarmilan SafePath does not independently
            hold or process donations. For production,
            financial contributions should use verified
            government, NGO or authorized payment
            channels.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ================================================= */}
      {/* MONEY MODAL */}
      {/* ================================================= */}

      <Modal
        visible={moneyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeMoneyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>
                  Financial Donation
                </Text>

                <Text style={styles.modalSubtitle}>
                  Support verified disaster-relief efforts.
                </Text>
              </View>

              <Pressable
                onPress={closeMoneyModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              Select amount
            </Text>

            <View style={styles.amountGrid}>
              {DONATION_AMOUNTS.map((amount) => {
                const selected =
                  selectedAmount === amount &&
                  customAmount.length === 0;

                return (
                  <Pressable
                    key={amount}
                    onPress={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                    style={[
                      styles.amountButton,
                      selected &&
                        styles.amountButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.amountText,
                        selected &&
                          styles.amountTextSelected,
                      ]}
                    >
                      ₹
                      {amount.toLocaleString(
                        "en-IN"
                      )}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>
              Custom amount
            </Text>

            <View style={styles.customAmountBox}>
              <Text style={styles.rupeeSymbol}>
                ₹
              </Text>

              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                style={styles.customAmountInput}
              />
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>
                Donation amount
              </Text>

              <Text style={styles.totalAmount}>
                ₹
                {finalAmount.toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>

            <Pressable
              onPress={submitMoneyDonation}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonIcon}>
                🔒
              </Text>

              <Text style={styles.primaryButtonText}>
                Continue to verified payment
              </Text>
            </Pressable>

            <Text style={styles.paymentNote}>
              A secure verified payment gateway should
              be connected for real donations.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ================================================= */}
      {/* SUPPLY MODAL */}
      {/* ================================================= */}

      <Modal
        visible={supplyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeSupplyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>
                  Donate {selectedType}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Tell the relief team what you can provide.
                </Text>
              </View>

              <Pressable
                onPress={closeSupplyModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              Your name
            </Text>

            <TextInput
              value={donorName}
              onChangeText={setDonorName}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>
              Contact number
            </Text>

            <TextInput
              value={donorPhone}
              onChangeText={setDonorPhone}
              placeholder="Enter contact number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>
              What can you provide?
            </Text>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder={
                selectedType === "Food"
                  ? "Example: 50 food packets"
                  : selectedType === "Water"
                  ? "Example: 100 water bottles"
                  : selectedType === "Medicines"
                  ? "Example: First-aid kits"
                  : "Example: 20 units"
              }
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>
              Pickup / delivery location
            </Text>

            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>
              Additional notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any useful information"
              placeholderTextColor="#94A3B8"
              multiline
              style={[
                styles.textInput,
                styles.notesInput,
              ]}
            />

            <Pressable
              onPress={submitSupplyDonation}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonIcon}>
                ❤️
              </Text>

              <Text style={styles.primaryButtonText}>
                Offer this support
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    padding: 18,
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  headerHeart: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerHeartText: {
    fontSize: 26,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  verifiedCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 12,
  },

  verifiedIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  verifiedEmoji: {
    fontSize: 20,
  },

  verifiedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },

  verifiedDescription: {
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#166534",
  },

  needsCard: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 22,
  },

  needsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  alertEmoji: {
    fontSize: 20,
    marginRight: 7,
  },

  needsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A3412",
  },

  needsDescription: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    color: "#7C2D12",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  donationCard: {
    width: "48%",
    minHeight: 174,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  optionEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  optionEmoji: {
    fontSize: 25,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  optionDescription: {
    marginTop: 5,
    fontSize: 10.5,
    lineHeight: 15,
    color: "#64748B",
  },

  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  helpText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },

  arrow: {
    marginLeft: 5,
    fontSize: 16,
    color: "#166534",
    fontWeight: "800",
  },

  requestCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 3,
  },

  requestIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  requestEmoji: {
    fontSize: 22,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  requestDescription: {
    marginTop: 5,
    fontSize: 10.5,
    lineHeight: 17,
    color: "#1E40AF",
  },

  requestButton: {
    alignSelf: "flex-start",
    marginTop: 11,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
  },

  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  requestArrow: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontSize: 15,
  },

  flowCard: {
    marginTop: 15,
    padding: 16,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  flowTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 15,
  },

  flowStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  stepNumber: {
    fontSize: 12,
    fontWeight: "900",
    color: "#166534",
  },

  stepTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#334155",
  },

  stepDescription: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  flowLine: {
    width: 2,
    height: 16,
    backgroundColor: "#DCFCE7",
    marginLeft: 14,
    marginVertical: 4,
  },

  transparencyCard: {
    marginTop: 15,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
  },

  infoEmoji: {
    fontSize: 17,
    marginRight: 8,
  },

  transparencyText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 15,
    color: "#475569",
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
    maxHeight: "92%",
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 17,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  closeText: {
    fontSize: 25,
    lineHeight: 26,
    color: "#64748B",
    fontWeight: "300",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 7,
    marginTop: 8,
  },

  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  amountButton: {
    width: "31.5%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginBottom: 8,
  },

  amountButtonSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },

  amountText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#475569",
  },

  amountTextSelected: {
    color: "#166534",
    fontWeight: "900",
  },

  customAmountBox: {
    height: 48,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  rupeeSymbol: {
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
  },

  customAmountInput: {
    flex: 1,
    marginLeft: 7,
    fontSize: 14,
    color: "#0F172A",
  },

  totalBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },

  totalAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#166534",
  },

  primaryButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  primaryButtonIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  primaryButtonText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  paymentNote: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
  },

  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  notesInput: {
    height: 65,
    paddingTop: 12,
    textAlignVertical: "top",
  },
});