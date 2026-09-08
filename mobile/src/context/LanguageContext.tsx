// mobile/src/context/LanguageContext.tsx

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Language = "en" | "hi" | "kn";

type TranslationKey =
  | "appName"
  | "safePath"
  | "punarmilan"
  | "telemedicine"
  | "disasterNetwork"
  | "sos"
  | "sendSOS"
  | "sosSent"
  | "sosQueued"
  | "offline"
  | "online"
  | "currentLocation"
  | "destination"
  | "navigationActive"
  | "endNavigation"
  | "governmentAlerts"
  | "weatherWarning"
  | "roadClosure"
  | "heavyRain"
  | "floodWarning"
  | "takeBreak"
  | "breakRecommended"
  | "breakReason"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "foodStop"
  | "safeFoodStop"
  | "noFoodStop"
  | "nearestCamp"
  | "reliefCamp"
  | "missingPerson"
  | "searchMissingPerson"
  | "possibleMatch"
  | "strongMatch"
  | "identityNotConfirmed"
  | "foundSafe"
  | "broadcastFamily"
  | "safeBroadcastSent"
  | "volunteer"
  | "rescuePriority"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "mentalHealthFlag"
  | "noConnectivity"
  | "longWaiting"
  | "consultDoctor"
  | "requestConsultation"
  | "doctorAssigned"
  | "prescription"
  | "uploadReport"
  | "uploadPrescription"
  | "medicalDisclaimer"
  | "donations"
  | "supplies"
  | "food"
  | "water"
  | "medicine"
  | "medicalSupplies"
  | "clothing"
  | "babySupplies"
  | "blankets"
  | "powerBanks"
  | "torches"
  | "hygieneKits"
  | "chatbot"
  | "askForHelp"
  | "emergencyHelp"
  | "governmentData"
  | "refresh"
  | "language"
  | "english"
  | "hindi"
  | "kannada";

type TranslationDictionary = Record<
  TranslationKey,
  string
>;

const translations: Record<
  Language,
  TranslationDictionary
> = {
  // =====================================================
  // ENGLISH
  // =====================================================
  en: {
    appName: "Punarmilan Safe-Path",

    safePath: "SafePath",
    punarmilan: "Punarmilan",
    telemedicine: "Telemedicine",
    disasterNetwork: "Disaster Network",

    sos: "SOS",
    sendSOS: "Send Emergency SOS",
    sosSent: "SOS sent successfully",
    sosQueued:
      "SOS queued. It will be sent when connectivity returns.",

    offline: "Offline",
    online: "Online",

    currentLocation: "Current Location",
    destination: "Destination",
    navigationActive: "Navigation Active",
    endNavigation: "End Navigation",

    governmentAlerts: "Government Alerts",
    weatherWarning: "Weather Warning",
    roadClosure: "Road Closure",
    heavyRain: "Heavy Rain",
    floodWarning: "Flood Warning",

    takeBreak: "Take a Break",
    breakRecommended: "Break Recommended",
    breakReason:
      "You have been travelling for a long period. Consider taking a safe break.",

    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    foodStop: "Food Stop",
    safeFoodStop: "Verified Food Stop Nearby",
    noFoodStop:
      "No verified food stop is available nearby. Consider stopping at a relief camp or verified safe location.",

    nearestCamp: "Nearest Relief Camp",
    reliefCamp: "Relief Camp",

    missingPerson: "Missing Person",
    searchMissingPerson: "Search Missing Person",
    possibleMatch: "Possible Match",
    strongMatch: "Strong Candidate Match",
    identityNotConfirmed:
      "Similarity match only. Identity must be confirmed by authorised responders or family.",

    foundSafe: "Found Safe",
    broadcastFamily: "Notify Searching Family",
    safeBroadcastSent:
      "Searching family has been notified that the person was located safely.",

    volunteer: "Volunteer / Rescuer",
    rescuePriority: "Rescue Priority",

    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",

    mentalHealthFlag: "Mental Health Flag",
    noConnectivity: "No Connectivity",
    longWaiting: "Long Waiting",

    consultDoctor: "Consult Doctor",
    requestConsultation: "Request Doctor Consultation",
    doctorAssigned: "Verified Doctor Assigned",

    prescription: "Digital Prescription",
    uploadReport: "Upload Medical Report",
    uploadPrescription: "View Prescription",

    medicalDisclaimer:
      "Punarmilan does not diagnose or prescribe using AI. Medical advice and prescriptions are provided only by verified doctors.",

    donations: "Relief Donations",
    supplies: "Essential Supplies",

    food: "Food",
    water: "Water",
    medicine: "Medicine",
    medicalSupplies: "Medical Supplies",
    clothing: "Clothing",
    babySupplies: "Baby Supplies",
    blankets: "Blankets",
    powerBanks: "Power Banks",
    torches: "Torches",
    hygieneKits: "Hygiene Kits",

    chatbot: "Disaster Assistance",
    askForHelp: "Ask for Help",
    emergencyHelp: "Emergency Help",

    governmentData: "Official Government Data",
    refresh: "Refresh",

    language: "Language",
    english: "English",
    hindi: "Hindi",
    kannada: "Kannada",
  },

  // =====================================================
  // HINDI
  // =====================================================
  hi: {
    appName: "पुनर्मिलन सेफ-पाथ",

    safePath: "सेफपाथ",
    punarmilan: "पुनर्मिलन",
    telemedicine: "टेलीमेडिसिन",
    disasterNetwork: "आपदा नेटवर्क",

    sos: "एसओएस",
    sendSOS: "आपातकालीन एसओएस भेजें",
    sosSent: "एसओएस सफलतापूर्वक भेजा गया",
    sosQueued:
      "एसओएस कतार में है। कनेक्टिविटी वापस आने पर भेजा जाएगा।",

    offline: "ऑफलाइन",
    online: "ऑनलाइन",

    currentLocation: "वर्तमान स्थान",
    destination: "गंतव्य",
    navigationActive: "नेविगेशन सक्रिय",
    endNavigation: "नेविगेशन समाप्त करें",

    governmentAlerts: "सरकारी अलर्ट",
    weatherWarning: "मौसम चेतावनी",
    roadClosure: "सड़क बंद",
    heavyRain: "भारी बारिश",
    floodWarning: "बाढ़ चेतावनी",

    takeBreak: "आराम करें",
    breakRecommended: "आराम की सलाह",
    breakReason:
      "आप काफी समय से यात्रा कर रहे हैं। सुरक्षित स्थान पर आराम करने की सलाह दी जाती है।",

    breakfast: "नाश्ता",
    lunch: "दोपहर का भोजन",
    dinner: "रात का भोजन",
    foodStop: "भोजन केंद्र",
    safeFoodStop: "सत्यापित भोजन केंद्र पास में है",
    noFoodStop:
      "पास में कोई सत्यापित भोजन केंद्र उपलब्ध नहीं है। राहत शिविर या सुरक्षित स्थान पर रुकने पर विचार करें।",

    nearestCamp: "निकटतम राहत शिविर",
    reliefCamp: "राहत शिविर",

    missingPerson: "लापता व्यक्ति",
    searchMissingPerson: "लापता व्यक्ति खोजें",
    possibleMatch: "संभावित मिलान",
    strongMatch: "मजबूत संभावित मिलान",
    identityNotConfirmed:
      "यह केवल समानता का मिलान है। पहचान की पुष्टि अधिकृत बचावकर्मियों या परिवार द्वारा की जानी चाहिए।",

    foundSafe: "सुरक्षित पाया गया",
    broadcastFamily: "परिवार को सूचित करें",
    safeBroadcastSent:
      "परिवार को सूचित कर दिया गया है कि व्यक्ति सुरक्षित मिल गया है।",

    volunteer: "स्वयंसेवक / बचावकर्मी",
    rescuePriority: "बचाव प्राथमिकता",

    critical: "गंभीर",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",

    mentalHealthFlag: "मानसिक स्वास्थ्य संकेत",
    noConnectivity: "कनेक्टिविटी नहीं",
    longWaiting: "लंबे समय से प्रतीक्षा",

    consultDoctor: "डॉक्टर से परामर्श",
    requestConsultation: "डॉक्टर से परामर्श का अनुरोध करें",
    doctorAssigned: "सत्यापित डॉक्टर नियुक्त",

    prescription: "डिजिटल प्रिस्क्रिप्शन",
    uploadReport: "मेडिकल रिपोर्ट अपलोड करें",
    uploadPrescription: "प्रिस्क्रिप्शन देखें",

    medicalDisclaimer:
      "पुनर्मिलन एआई का उपयोग करके बीमारी का निदान या दवा निर्धारित नहीं करता। चिकित्सा सलाह और प्रिस्क्रिप्शन केवल सत्यापित डॉक्टरों द्वारा दिए जाते हैं।",

    donations: "राहत दान",
    supplies: "आवश्यक सामग्री",

    food: "भोजन",
    water: "पानी",
    medicine: "दवाइयां",
    medicalSupplies: "चिकित्सा सामग्री",
    clothing: "कपड़े",
    babySupplies: "बच्चों की सामग्री",
    blankets: "कंबल",
    powerBanks: "पावर बैंक",
    torches: "टॉर्च",
    hygieneKits: "स्वच्छता किट",

    chatbot: "आपदा सहायता",
    askForHelp: "सहायता मांगें",
    emergencyHelp: "आपातकालीन सहायता",

    governmentData: "आधिकारिक सरकारी डेटा",
    refresh: "रिफ्रेश",

    language: "भाषा",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    kannada: "कन्नड़",
  },

  // =====================================================
  // KANNADA
  // =====================================================
  kn: {
    appName: "ಪುನರ್ಮಿಲನ ಸೇಫ್-ಪಾತ್",

    safePath: "ಸೇಫ್‌ಪಾತ್",
    punarmilan: "ಪುನರ್ಮಿಲನ",
    telemedicine: "ಟೆಲಿಮೆಡಿಸಿನ್",
    disasterNetwork: "ವಿಪತ್ತು ನೆಟ್‌ವರ್ಕ್",

    sos: "SOS",
    sendSOS: "ತುರ್ತು SOS ಕಳುಹಿಸಿ",
    sosSent: "SOS ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ",
    sosQueued:
      "SOS ಸರದಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಸಂಪರ್ಕ ಮರಳಿದಾಗ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.",

    offline: "ಆಫ್‌ಲೈನ್",
    online: "ಆನ್‌ಲೈನ್",

    currentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    destination: "ಗಮ್ಯಸ್ಥಾನ",
    navigationActive: "ನ್ಯಾವಿಗೇಶನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    endNavigation: "ನ್ಯಾವಿಗೇಶನ್ ಮುಗಿಸಿ",

    governmentAlerts: "ಸರ್ಕಾರಿ ಎಚ್ಚರಿಕೆಗಳು",
    weatherWarning: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ",
    roadClosure: "ರಸ್ತೆ ಮುಚ್ಚಲಾಗಿದೆ",
    heavyRain: "ಭಾರಿ ಮಳೆ",
    floodWarning: "ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ",

    takeBreak: "ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ",
    breakRecommended: "ವಿರಾಮದ ಸಲಹೆ",
    breakReason:
      "ನೀವು ದೀರ್ಘ ಸಮಯದಿಂದ ಪ್ರಯಾಣಿಸುತ್ತಿದ್ದೀರಿ. ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ.",

    breakfast: "ಉಪಹಾರ",
    lunch: "ಮಧ್ಯಾಹ್ನದ ಊಟ",
    dinner: "ರಾತ್ರಿ ಊಟ",
    foodStop: "ಆಹಾರ ಕೇಂದ್ರ",
    safeFoodStop: "ಪರಿಶೀಲಿಸಿದ ಆಹಾರ ಕೇಂದ್ರ ಹತ್ತಿರದಲ್ಲಿದೆ",
    noFoodStop:
      "ಹತ್ತಿರದಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ ಆಹಾರ ಕೇಂದ್ರ ಲಭ್ಯವಿಲ್ಲ. ಪರಿಹಾರ ಶಿಬಿರ ಅಥವಾ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ನಿಲ್ಲುವುದನ್ನು ಪರಿಗಣಿಸಿ.",

    nearestCamp: "ಹತ್ತಿರದ ಪರಿಹಾರ ಶಿಬಿರ",
    reliefCamp: "ಪರಿಹಾರ ಶಿಬಿರ",

    missingPerson: "ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿ",
    searchMissingPerson: "ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ಹುಡುಕಿ",
    possibleMatch: "ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ",
    strongMatch: "ಬಲವಾದ ಹೊಂದಾಣಿಕೆ",
    identityNotConfirmed:
      "ಇದು ಕೇವಲ ಸಾಮ್ಯತೆಯ ಹೊಂದಾಣಿಕೆ. ಗುರುತನ್ನು ಅಧಿಕೃತ ರಕ್ಷಕರು ಅಥವಾ ಕುಟುಂಬ ದೃಢೀಕರಿಸಬೇಕು.",

    foundSafe: "ಸುರಕ್ಷಿತವಾಗಿ ಪತ್ತೆಯಾಗಿದೆ",
    broadcastFamily: "ಕುಟುಂಬಕ್ಕೆ ಮಾಹಿತಿ ನೀಡಿ",
    safeBroadcastSent:
      "ವ್ಯಕ್ತಿ ಸುರಕ್ಷಿತವಾಗಿ ಪತ್ತೆಯಾದ ಮಾಹಿತಿ ಕುಟುಂಬಕ್ಕೆ ಕಳುಹಿಸಲಾಗಿದೆ.",

    volunteer: "ಸ್ವಯಂಸೇವಕ / ರಕ್ಷಕ",
    rescuePriority: "ರಕ್ಷಣಾ ಆದ್ಯತೆ",

    critical: "ಅತ್ಯಂತ ಗಂಭೀರ",
    high: "ಹೆಚ್ಚು",
    medium: "ಮಧ್ಯಮ",
    low: "ಕಡಿಮೆ",

    mentalHealthFlag: "ಮಾನಸಿಕ ಆರೋಗ್ಯ ಸೂಚನೆ",
    noConnectivity: "ಸಂಪರ್ಕವಿಲ್ಲ",
    longWaiting: "ದೀರ್ಘ ಕಾಯುವಿಕೆ",

    consultDoctor: "ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    requestConsultation: "ವೈದ್ಯರ ಸಲಹೆಗಾಗಿ ವಿನಂತಿಸಿ",
    doctorAssigned: "ಪರಿಶೀಲಿಸಿದ ವೈದ್ಯರನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ",

    prescription: "ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್",
    uploadReport: "ವೈದ್ಯಕೀಯ ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadPrescription: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ನೋಡಿ",

    medicalDisclaimer:
      "ಪುನರ್ಮಿಲನ AI ಬಳಸಿ ರೋಗನಿರ್ಣಯ ಅಥವಾ ಔಷಧಿ ಸೂಚಿಸುವುದಿಲ್ಲ. ವೈದ್ಯಕೀಯ ಸಲಹೆ ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ ವೈದ್ಯರು ಮಾತ್ರ ನೀಡುತ್ತಾರೆ.",

    donations: "ಪರಿಹಾರ ದೇಣಿಗೆಗಳು",
    supplies: "ಅಗತ್ಯ ಸಾಮಗ್ರಿಗಳು",

    food: "ಆಹಾರ",
    water: "ನೀರು",
    medicine: "ಔಷಧಿ",
    medicalSupplies: "ವೈದ್ಯಕೀಯ ಸಾಮಗ್ರಿಗಳು",
    clothing: "ಬಟ್ಟೆ",
    babySupplies: "ಮಕ್ಕಳ ಸಾಮಗ್ರಿಗಳು",
    blankets: "ಕಂಬಳಿಗಳು",
    powerBanks: "ಪವರ್ ಬ್ಯಾಂಕ್‌ಗಳು",
    torches: "ಟಾರ್ಚ್‌ಗಳು",
    hygieneKits: "ಸ್ವಚ್ಛತಾ ಕಿಟ್‌ಗಳು",

    chatbot: "ವಿಪತ್ತು ಸಹಾಯ",
    askForHelp: "ಸಹಾಯ ಕೇಳಿ",
    emergencyHelp: "ತುರ್ತು ಸಹಾಯ",

    governmentData: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮಾಹಿತಿ",
    refresh: "ರಿಫ್ರೆಶ್",

    language: "ಭಾಷೆ",
    english: "ಇಂಗ್ಲಿಷ್",
    hindi: "ಹಿಂದಿ",
    kannada: "ಕನ್ನಡ",
  },
};

// =====================================================
// CONTEXT TYPE
// =====================================================

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

// =====================================================
// CONTEXT
// =====================================================

const LanguageContext =
  createContext<LanguageContextValue | undefined>(
    undefined
  );

// =====================================================
// PROVIDER
// =====================================================

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguage] =
    useState<Language>("en");

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,

      t: (key: TranslationKey) => {
        return (
          translations[language][key] ??
          translations.en[key]
        );
      },
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}