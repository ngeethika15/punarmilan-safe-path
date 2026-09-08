import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { useDisaster } from "../context/DisasterContext";
import {
  useLanguage,
  Language,
} from "../context/LanguageContext";

type PunarmilanTranslations = {
  title: string;
  subtitle: string;

  searchTab: string;
  registerTab: string;

  searchTitle: string;
  searchSubtitle: string;

  namePlaceholder: string;
  clothingPlaceholder: string;
  marksPlaceholder: string;

  registeredSurvivors: string;

  ageGender: string;
  clothing: string;
  marksJewelry: string;
  camp: string;
  contact: string;

  safeInCamp: string;
  unidentified: string;

  intakeTitle: string;
  intakeSubtitle: string;

  fullName: string;
  approximateAge: string;
  clothingDescription: string;
  distinguishingMarks: string;
  reliefCamp: string;
  contactNumber: string;

  saveRoster: string;

  missingFields: string;
  missingFieldsMessage: string;

  success: string;
  successMessage: string;

  unknown: string;
  noneReported: string;
  notAvailable: string;
  unidentifiedPerson: string;

  searchPlaceholder: string;
};

const translations: Record<
  Language,
  PunarmilanTranslations
> = {
  en: {
    title: "🤝 PUNARMILAN",
    subtitle:
      "Family Reunification & Offline Camp Rosters",

    searchTab: "🔍 Missing Person Search",
    registerTab: "➕ Register Survivor",

    searchTitle:
      "🎯 Multi-Attribute Survivor Search",

    searchSubtitle:
      "Search by clothing, scars, tattoos, or name",

    namePlaceholder:
      "Name (e.g. Aarav, Unidentified)...",

    clothingPlaceholder:
      "Clothing Color...",

    marksPlaceholder:
      "Scars, Tattoos, Jewelry...",

    registeredSurvivors:
      "Registered Survivors in Relief Camps",

    ageGender: "Age/Gender",
    clothing: "Clothing",
    marksJewelry: "Marks/Jewelry",
    camp: "Camp",
    contact: "Contact",

    safeInCamp: "SAFE_IN_CAMP",
    unidentified: "UNIDENTIFIED",

    intakeTitle:
      "📝 Volunteer Camp Intake Form",

    intakeSubtitle:
      "Save details to update all connected modules instantly",

    fullName: "Full Name",

    approximateAge:
      "Approximate Age",

    clothingDescription:
      "Clothing Description *",

    distinguishingMarks:
      "Distinguishing Marks",

    reliefCamp:
      "Relief Camp Location *",

    contactNumber:
      "Contact Number",

    saveRoster:
      "💾 Save to Unified Roster",

    missingFields:
      "Missing Fields",

    missingFieldsMessage:
      "Please enter clothing details and camp location.",

    success: "Success",

    successMessage:
      "Survivor saved to unified global disaster store!",

    unknown: "Unknown",

    noneReported: "None reported",

    notAvailable: "N/A",

    unidentifiedPerson:
      "Unidentified Person",

    searchPlaceholder:
      "Search survivor records...",
  },

  hi: {
    title: "🤝 पुनर्मिलन",

    subtitle:
      "परिवार पुनर्मिलन और ऑफलाइन राहत शिविर सूची",

    searchTab: "🔍 लापता व्यक्ति खोजें",

    registerTab:
      "➕ जीवित व्यक्ति पंजीकृत करें",

    searchTitle:
      "🎯 बहु-विशेषता व्यक्ति खोज",

    searchSubtitle:
      "कपड़ों, निशान, टैटू या नाम से खोजें",

    namePlaceholder:
      "नाम (जैसे आरव, अज्ञात)...",

    clothingPlaceholder:
      "कपड़ों का रंग...",

    marksPlaceholder:
      "निशान, टैटू, आभूषण...",

    registeredSurvivors:
      "राहत शिविरों में पंजीकृत व्यक्ति",

    ageGender: "उम्र/लिंग",

    clothing: "कपड़े",

    marksJewelry:
      "निशान/आभूषण",

    camp: "शिविर",

    contact: "संपर्क",

    safeInCamp:
      "शिविर में सुरक्षित",

    unidentified:
      "अज्ञात",

    intakeTitle:
      "📝 स्वयंसेवक शिविर पंजीकरण फॉर्म",

    intakeSubtitle:
      "विवरण सहेजें और सभी जुड़े मॉड्यूल को तुरंत अपडेट करें",

    fullName: "पूरा नाम",

    approximateAge:
      "अनुमानित उम्र",

    clothingDescription:
      "कपड़ों का विवरण *",

    distinguishingMarks:
      "पहचान के विशेष निशान",

    reliefCamp:
      "राहत शिविर का स्थान *",

    contactNumber:
      "संपर्क नंबर",

    saveRoster:
      "💾 एकीकृत सूची में सहेजें",

    missingFields:
      "आवश्यक जानकारी गायब है",

    missingFieldsMessage:
      "कृपया कपड़ों का विवरण और शिविर का स्थान दर्ज करें।",

    success: "सफल",

    successMessage:
      "व्यक्ति की जानकारी एकीकृत आपदा स्टोर में सहेज दी गई है।",

    unknown: "अज्ञात",

    noneReported:
      "कोई जानकारी उपलब्ध नहीं",

    notAvailable:
      "उपलब्ध नहीं",

    unidentifiedPerson:
      "अज्ञात व्यक्ति",

    searchPlaceholder:
      "व्यक्ति के रिकॉर्ड खोजें...",
  },

  kn: {
    title: "🤝 ಪುನರ್ಮಿಲನ",

    subtitle:
      "ಕುಟುಂಬ ಪುನರ್ಮಿಲನ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಪರಿಹಾರ ಶಿಬಿರ ಪಟ್ಟಿ",

    searchTab:
      "🔍 ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ಹುಡುಕಿ",

    registerTab:
      "➕ ಬದುಕುಳಿದವರನ್ನು ನೋಂದಾಯಿಸಿ",

    searchTitle:
      "🎯 ಬಹು-ಗುಣಲಕ್ಷಣ ವ್ಯಕ್ತಿ ಹುಡುಕಾಟ",

    searchSubtitle:
      "ಬಟ್ಟೆ, ಗುರುತು, ಟ್ಯಾಟೂ ಅಥವಾ ಹೆಸರಿನ ಮೂಲಕ ಹುಡುಕಿ",

    namePlaceholder:
      "ಹೆಸರು (ಉದಾ. ಆರವ್, ಗುರುತಿಸಲಾಗದವರು)...",

    clothingPlaceholder:
      "ಬಟ್ಟೆಯ ಬಣ್ಣ...",

    marksPlaceholder:
      "ಗುರುತುಗಳು, ಟ್ಯಾಟೂ, ಆಭರಣ...",

    registeredSurvivors:
      "ಪರಿಹಾರ ಶಿಬಿರಗಳಲ್ಲಿ ನೋಂದಾಯಿತ ವ್ಯಕ್ತಿಗಳು",

    ageGender:
      "ವಯಸ್ಸು/ಲಿಂಗ",

    clothing:
      "ಬಟ್ಟೆ",

    marksJewelry:
      "ಗುರುತುಗಳು/ಆಭರಣ",

    camp:
      "ಶಿಬಿರ",

    contact:
      "ಸಂಪರ್ಕ",

    safeInCamp:
      "ಶಿಬಿರದಲ್ಲಿ ಸುರಕ್ಷಿತ",

    unidentified:
      "ಗುರುತಿಸಲಾಗಿಲ್ಲ",

    intakeTitle:
      "📝 ಸ್ವಯಂಸೇವಕ ಶಿಬಿರ ನೋಂದಣಿ ಫಾರ್ಮ್",

    intakeSubtitle:
      "ವಿವರಗಳನ್ನು ಉಳಿಸಿ ಮತ್ತು ಸಂಪರ್ಕಿತ ಎಲ್ಲಾ ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ತಕ್ಷಣ ನವೀಕರಿಸಿ",

    fullName:
      "ಪೂರ್ಣ ಹೆಸರು",

    approximateAge:
      "ಅಂದಾಜು ವಯಸ್ಸು",

    clothingDescription:
      "ಬಟ್ಟೆಯ ವಿವರಣೆ *",

    distinguishingMarks:
      "ವಿಶಿಷ್ಟ ಗುರುತುಗಳು",

    reliefCamp:
      "ಪರಿಹಾರ ಶಿಬಿರದ ಸ್ಥಳ *",

    contactNumber:
      "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",

    saveRoster:
      "💾 ಏಕೀಕೃತ ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಿ",

    missingFields:
      "ಅಗತ್ಯ ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ",

    missingFieldsMessage:
      "ದಯವಿಟ್ಟು ಬಟ್ಟೆಯ ವಿವರ ಮತ್ತು ಶಿಬಿರದ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ.",

    success:
      "ಯಶಸ್ವಿಯಾಗಿದೆ",

    successMessage:
      "ವ್ಯಕ್ತಿಯ ವಿವರಗಳನ್ನು ಏಕೀಕೃತ ವಿಪತ್ತು ಸಂಗ್ರಹದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.",

    unknown:
      "ತಿಳಿದಿಲ್ಲ",

    noneReported:
      "ಯಾವುದೇ ಮಾಹಿತಿ ಇಲ್ಲ",

    notAvailable:
      "ಲಭ್ಯವಿಲ್ಲ",

    unidentifiedPerson:
      "ಗುರುತಿಸಲಾಗದ ವ್ಯಕ್ತಿ",

    searchPlaceholder:
      "ವ್ಯಕ್ತಿ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ...",
  },
};

export default function PunarmilanScreen() {
  const { survivors, addSurvivor } =
    useDisaster();

  /*
   * IMPORTANT:
   * Use the SAME central language used by Safe-Path.
   */
  const {
    language,
    setLanguage,
  } = useLanguage();

  const text = translations[language];

  const [activeTab, setActiveTab] =
    useState<"SEARCH" | "REGISTER">(
      "SEARCH"
    );

  // Search Filters
  const [searchName, setSearchName] =
    useState("");

  const [searchClothing, setSearchClothing] =
    useState("");

  const [searchMarks, setSearchMarks] =
    useState("");

  // Form State
  const [name, setName] =
    useState("");

  const [age, setAge] =
    useState("");

  const [gender, setGender] =
    useState("Male");

  const [clothingColor, setClothingColor] =
    useState("");

  const [
    distinguishingMarks,
    setDistinguishingMarks,
  ] = useState("");

  const [campLocation, setCampLocation] =
    useState("");

  const [contactNumber, setContactNumber] =
    useState("");

  const handleRegister = () => {
    if (
      !clothingColor.trim() ||
      !campLocation.trim()
    ) {
      Alert.alert(
        text.missingFields,
        text.missingFieldsMessage
      );

      return;
    }

    addSurvivor({
      id: `SURV-00${
        survivors.length + 1
      }`,

      name:
        name.trim() ||
        text.unidentifiedPerson,

      age:
        age.trim() ||
        text.unknown,

      gender,

      clothingColor,

      distinguishingMarks:
        distinguishingMarks.trim() ||
        text.noneReported,

      campLocation,

      contactNumber:
        contactNumber.trim() ||
        text.notAvailable,

      status: name.trim()
        ? "SAFE_IN_CAMP"
        : "UNIDENTIFIED",
    });

    Alert.alert(
      text.success,
      text.successMessage
    );

    setName("");
    setAge("");
    setClothingColor("");
    setDistinguishingMarks("");
    setCampLocation("");
    setContactNumber("");

    setActiveTab("SEARCH");
  };

  const filteredSurvivors =
    survivors.filter((s) => {
      const matchesName =
        !searchName ||
        s.name
          .toLowerCase()
          .includes(
            searchName.toLowerCase()
          );

      const matchesClothing =
        !searchClothing ||
        s.clothingColor
          .toLowerCase()
          .includes(
            searchClothing.toLowerCase()
          );

      const matchesMarks =
        !searchMarks ||
        s.distinguishingMarks
          .toLowerCase()
          .includes(
            searchMarks.toLowerCase()
          );

      return (
        matchesName &&
        matchesClothing &&
        matchesMarks
      );
    });

  return (
    <View style={styles.container}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {text.title}
          </Text>

          <Text style={styles.headerSubtitle}>
            {text.subtitle}
          </Text>
        </View>

        {/* LANGUAGE SELECTOR */}

        <View style={styles.languageContainer}>
          {(["en", "hi", "kn"] as Language[]).map(
            (lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  language === lang &&
                    styles.activeLanguageButton,
                ]}
                onPress={() =>
                  setLanguage(lang)
                }
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang &&
                      styles.activeLanguageText,
                  ]}
                >
                  {lang === "en"
                    ? "EN"
                    : lang === "hi"
                    ? "HI"
                    : "KN"}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

      </View>

      {/* ==================================================
          TABS
      ================================================== */}

      <View style={styles.tabContainer}>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "SEARCH" &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab("SEARCH")
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "SEARCH" &&
                styles.activeTabText,
            ]}
          >
            {text.searchTab}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "REGISTER" &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab("REGISTER")
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "REGISTER" &&
                styles.activeTabText,
            ]}
          >
            {text.registerTab}
          </Text>
        </TouchableOpacity>

      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={
          styles.contentContainer
        }
      >

        {/* =================================================
            SEARCH
        ================================================= */}

        {activeTab === "SEARCH" ? (
          <View>

            <View style={styles.card}>

              <Text style={styles.cardTitle}>
                {text.searchTitle}
              </Text>

              <Text style={styles.cardSub}>
                {text.searchSubtitle}
              </Text>

              <TextInput
                style={styles.input}
                placeholder={
                  text.namePlaceholder
                }
                placeholderTextColor="#94A3B8"
                value={searchName}
                onChangeText={
                  setSearchName
                }
              />

              <TextInput
                style={styles.input}
                placeholder={
                  text.clothingPlaceholder
                }
                placeholderTextColor="#94A3B8"
                value={searchClothing}
                onChangeText={
                  setSearchClothing
                }
              />

              <TextInput
                style={styles.input}
                placeholder={
                  text.marksPlaceholder
                }
                placeholderTextColor="#94A3B8"
                value={searchMarks}
                onChangeText={
                  setSearchMarks
                }
              />

            </View>

            <Text style={styles.sectionHeader}>
              {text.registeredSurvivors} (
              {filteredSurvivors.length})
            </Text>

            {filteredSurvivors.map(
              (item) => (
                <View
                  key={item.id}
                  style={
                    styles.survivorCard
                  }
                >

                  <View
                    style={
                      styles.survivorHeader
                    }
                  >

                    <Text
                      style={
                        styles.survivorName
                      }
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={[
                        styles.statusBadge,
                        item.status ===
                          "UNIDENTIFIED"
                          ? styles.statusWarn
                          : styles.statusOk,
                      ]}
                    >
                      {item.status ===
                      "SAFE_IN_CAMP"
                        ? text.safeInCamp
                        : text.unidentified}
                    </Text>

                  </View>

                  <Text
                    style={
                      styles.survivorDetail
                    }
                  >
                    👤{" "}
                    <Text style={styles.bold}>
                      {text.ageGender}:
                    </Text>{" "}
                    {item.age} yrs |{" "}
                    {item.gender}
                  </Text>

                  <Text
                    style={
                      styles.survivorDetail
                    }
                  >
                    👕{" "}
                    <Text style={styles.bold}>
                      {text.clothing}:
                    </Text>{" "}
                    {item.clothingColor}
                  </Text>

                  <Text
                    style={
                      styles.survivorDetail
                    }
                  >
                    🏷️{" "}
                    <Text style={styles.bold}>
                      {text.marksJewelry}:
                    </Text>{" "}
                    {
                      item.distinguishingMarks
                    }
                  </Text>

                  <Text
                    style={
                      styles.survivorDetail
                    }
                  >
                    📍{" "}
                    <Text style={styles.bold}>
                      {text.camp}:
                    </Text>{" "}
                    {item.campLocation}
                  </Text>

                  <Text
                    style={
                      styles.survivorDetail
                    }
                  >
                    📞{" "}
                    <Text style={styles.bold}>
                      {text.contact}:
                    </Text>{" "}
                    {item.contactNumber}
                  </Text>

                </View>
              )
            )}

          </View>
        ) : (

          /* =================================================
             REGISTER
          ================================================= */

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              {text.intakeTitle}
            </Text>

            <Text style={styles.cardSub}>
              {text.intakeSubtitle}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={text.fullName}
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder={
                text.approximateAge
              }
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            <TextInput
              style={styles.input}
              placeholder={
                text.clothingDescription
              }
              placeholderTextColor="#94A3B8"
              value={clothingColor}
              onChangeText={
                setClothingColor
              }
            />

            <TextInput
              style={styles.input}
              placeholder={
                text.distinguishingMarks
              }
              placeholderTextColor="#94A3B8"
              value={
                distinguishingMarks
              }
              onChangeText={
                setDistinguishingMarks
              }
            />

            <TextInput
              style={styles.input}
              placeholder={
                text.reliefCamp
              }
              placeholderTextColor="#94A3B8"
              value={campLocation}
              onChangeText={
                setCampLocation
              }
            />

            <TextInput
              style={styles.input}
              placeholder={
                text.contactNumber
              }
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={
                setContactNumber
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
            >
              <Text
                style={
                  styles.submitBtnText
                }
              >
                {text.saveRoster}
              </Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

/* ==========================================================
   STYLES
========================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  languageContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },

  languageButton: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 4,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },

  activeLanguageButton: {
    backgroundColor: "#38BDF8",
  },

  languageText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  activeLanguageText: {
    color: "#FFFFFF",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#EF4444",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748B",
  },

  activeTabText: {
    color: "#EF4444",
  },

  content: {
    flex: 1,
    padding: 16,
  },

  contentContainer: {
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
  },

  cardSub: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 10,
    marginTop: 3,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
    color: "#0F172A",
  },

  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#94A3B8",
    marginBottom: 8,
  },

  survivorCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  survivorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  survivorName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
  },

  statusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  statusOk: {
    backgroundColor: "#D1FAE5",
    color: "#059669",
  },

  statusWarn: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
  },

  survivorDetail: {
    fontSize: 12,
    color: "#334155",
    marginTop: 2,
  },

  bold: {
    fontWeight: "bold",
  },

  submitBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
});