import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSOS } from "../context/SOSContext";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteInfo = {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
};

type WeatherPoint = {
  name: string;
  coordinates: Coordinates;
  temperature: number;
  precipitation: number;
  rain: number;
  precipitationProbability: number;
  weatherCode: number;
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  safetyScore: number;
};

type RouteWeather = {
  points: WeatherPoint[];
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  safetyScore: number;
};

type Language = "en" | "hi" | "kn";

/*
 * ============================================================
 * TRANSLATIONS
 * ============================================================
 */

const TEXT = {
  en: {
    title: "Safe-Path Navigation",
    subtitle: "Intelligent disaster-aware route planning",

    currentLocation: "Current Location",
    destination: "Where do you want to go?",
    destinationPlaceholder: "Enter city, village, landmark or address",

    useLocation: "Use My Current Location",
    getRoute: "Find Safe Route",

    locating: "Getting your location...",
    locationFound: "Current location detected",
    locationDenied: "Location permission was denied.",
    locationError: "Unable to get your current location.",

    enterDestination: "Please enter a destination.",

    searching: "Finding destination...",
    calculating: "Calculating route...",
    analyzingWeather: "Analyzing route weather...",

    route: "Safe Route",
    distance: "Distance",
    duration: "Estimated Time",

    online: "Online",
    offline: "Offline",
    gps: "GPS",
    ready: "Ready",

    map: "Safe-Path Map",
    liveMap: "Live route map",

    noRoute: "Enter a destination to calculate your route.",

    startNavigation: "Start Navigation",

    weatherTitle: "Route Weather & Safety",
    weatherSubtitle:
      "Weather conditions checked at key points along your route",

    weatherStart: "Starting Area",
    weatherMid: "Route Midpoint",
    weatherDestination: "Destination",

    temperature: "Temperature",
    rainProbability: "Rain Probability",
    rainfall: "Rainfall",
    weatherRisk: "Weather Risk",

    safetyScore: "Route Weather Safety Score",

    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",

    lowWarningTitle: "✓ Low weather risk",
    lowWarningText:
      "No significant weather risk was detected at the checked route points.",

    mediumWarningTitle: "⚠️ Moderate weather risk",
    mediumWarningText:
      "Rain may affect visibility and road conditions. Drive carefully and monitor local alerts.",

    highWarningTitle: "⚠️ High weather risk",
    highWarningText:
      "Heavy rain or severe weather may affect travel conditions. Consider checking safer alternatives before continuing.",

    weatherUnavailable:
      "Weather information is currently unavailable.",

    governmentAlert: "Government Safety Alerts",

    governmentAlertText:
      "Verified disaster alerts will appear here when connected to authorized government disaster-information feeds.",

    verifiedOnly:
      "Only verified government or authorized disaster information should be shown as an official alert.",

    food: "Smart Food & Rest Stop",

    foodText:
      "Food, water and rest recommendations can be placed along the calculated route.",

    foodRouteText:
      "The route has been calculated. Nearby food, water, shelter and rest facilities can now be analyzed.",

    safety: "Safety Information",

    safetyText:
      "Safe Path combines your location, route information and available environmental risk data.",

    sos: "SOS",

    sosSubtitle:
      "Send emergency assistance request",

    dataNotice: "Data Status",

    dataNoticeText:
      "GPS comes from your device. Routing uses OpenStreetMap-compatible public routing. Weather uses Open-Meteo. Government disaster feeds require a separate verified integration.",

    destinationNotFound: "Destination not found",

    destinationNotFoundText:
      "We could not find that destination. Try a city, village, landmark or full address.",

    routeError: "Route Error",

    routeErrorText:
      "Unable to calculate the route right now. Please check your internet connection and try again.",

    gpsRequired:
      "Your current location has not been detected yet.",

    internetRequired:
      "Internet connection is required to calculate a new route.",

    permissionTitle: "Location Permission",

    permissionText:
      "Please allow location access in your browser so Safe Path can use your current position.",

    navigationUnavailable:
      "Navigation can only be opened from the web version of this app.",

    emergencyTitle: "SOS",

    emergencyText:
      "Emergency SOS process has been triggered.",
  },

  hi: {
    title: "सुरक्षित मार्ग नेविगेशन",
    subtitle: "आपदा-जागरूक स्मार्ट मार्ग योजना",

    currentLocation: "वर्तमान स्थान",
    destination: "आप कहाँ जाना चाहते हैं?",
    destinationPlaceholder: "शहर, गाँव, स्थान या पता दर्ज करें",

    useLocation: "मेरे वर्तमान स्थान का उपयोग करें",
    getRoute: "सुरक्षित मार्ग खोजें",

    locating: "आपका स्थान प्राप्त किया जा रहा है...",
    locationFound: "वर्तमान स्थान मिल गया",
    locationDenied: "स्थान की अनुमति अस्वीकार कर दी गई।",
    locationError: "वर्तमान स्थान प्राप्त नहीं किया जा सका।",

    enterDestination: "कृपया गंतव्य दर्ज करें।",

    searching: "गंतव्य खोजा जा रहा है...",
    calculating: "मार्ग की गणना की जा रही है...",
    analyzingWeather: "मार्ग के मौसम का विश्लेषण किया जा रहा है...",

    route: "सुरक्षित मार्ग",
    distance: "दूरी",
    duration: "अनुमानित समय",

    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    gps: "GPS",
    ready: "तैयार",

    map: "सुरक्षित मार्ग मानचित्र",
    liveMap: "लाइव मार्ग मानचित्र",

    noRoute: "मार्ग देखने के लिए गंतव्य दर्ज करें।",

    startNavigation: "नेविगेशन शुरू करें",

    weatherTitle: "मार्ग मौसम और सुरक्षा",
    weatherSubtitle:
      "मार्ग के महत्वपूर्ण स्थानों पर मौसम की जाँच की गई",

    weatherStart: "प्रारंभिक क्षेत्र",
    weatherMid: "मार्ग का मध्य",
    weatherDestination: "गंतव्य",

    temperature: "तापमान",
    rainProbability: "बारिश की संभावना",
    rainfall: "वर्षा",
    weatherRisk: "मौसम जोखिम",

    safetyScore: "मार्ग मौसम सुरक्षा स्कोर",

    low: "कम",
    medium: "मध्यम",
    high: "उच्च",

    lowWarningTitle: "✓ कम मौसम जोखिम",
    lowWarningText:
      "जाँचे गए मार्ग बिंदुओं पर कोई महत्वपूर्ण मौसम जोखिम नहीं मिला।",

    mediumWarningTitle: "⚠️ मध्यम मौसम जोखिम",
    mediumWarningText:
      "बारिश दृश्यता और सड़क की स्थिति को प्रभावित कर सकती है। सावधानी से चलें।",

    highWarningTitle: "⚠️ उच्च मौसम जोखिम",
    highWarningText:
      "भारी बारिश या खराब मौसम यात्रा की स्थिति को प्रभावित कर सकता है। सुरक्षित विकल्प जाँचें।",

    weatherUnavailable:
      "मौसम की जानकारी अभी उपलब्ध नहीं है।",

    governmentAlert: "सरकारी सुरक्षा चेतावनियाँ",

    governmentAlertText:
      "सत्यापित सरकारी आपदा चेतावनियाँ अधिकृत सरकारी सूचना फीड से जुड़ने के बाद यहाँ दिखाई जाएंगी।",

    verifiedOnly:
      "आधिकारिक चेतावनी के रूप में केवल सत्यापित सरकारी या अधिकृत आपदा जानकारी दिखाई जानी चाहिए।",

    food: "स्मार्ट भोजन और विश्राम स्थान",

    foodText:
      "गणना किए गए मार्ग पर भोजन, पानी और विश्राम स्थान सुझाए जा सकते हैं।",

    foodRouteText:
      "मार्ग की गणना हो गई है। अब आसपास के भोजन, पानी, आश्रय और विश्राम स्थानों का विश्लेषण किया जा सकता है।",

    safety: "सुरक्षा जानकारी",

    safetyText:
      "Safe Path आपके स्थान, मार्ग और उपलब्ध पर्यावरणीय जोखिम डेटा को जोड़ता है।",

    sos: "SOS",

    sosSubtitle:
      "आपातकालीन सहायता अनुरोध भेजें",

    dataNotice: "डेटा स्थिति",

    dataNoticeText:
      "GPS आपके डिवाइस से आता है। रूटिंग OpenStreetMap-संगत सार्वजनिक सेवा का उपयोग करती है। मौसम Open-Meteo से आता है। सरकारी आपदा फीड के लिए अलग सत्यापित इंटीग्रेशन आवश्यक है।",

    destinationNotFound: "गंतव्य नहीं मिला",

    destinationNotFoundText:
      "यह गंतव्य नहीं मिला। शहर, गाँव, स्थान या पूरा पता आज़माएँ।",

    routeError: "मार्ग त्रुटि",

    routeErrorText:
      "अभी मार्ग की गणना नहीं हो सकी। इंटरनेट कनेक्शन जाँचें और फिर प्रयास करें।",

    gpsRequired:
      "आपका वर्तमान स्थान अभी तक नहीं मिला है।",

    internetRequired:
      "नया मार्ग बनाने के लिए इंटरनेट कनेक्शन आवश्यक है।",

    permissionTitle: "स्थान अनुमति",

    permissionText:
      "Safe Path को आपके वर्तमान स्थान का उपयोग करने के लिए ब्राउज़र में स्थान अनुमति दें।",

    navigationUnavailable:
      "नेविगेशन केवल ऐप के वेब संस्करण से खोला जा सकता है।",

    emergencyTitle: "SOS",

    emergencyText:
      "आपातकालीन SOS प्रक्रिया शुरू कर दी गई है।",
  },

  kn: {
    title: "ಸೇಫ್-ಪಾತ್ ನ್ಯಾವಿಗೇಶನ್",
    subtitle: "ವಿಪತ್ತು-ಅರಿವು ಹೊಂದಿದ ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಯೋಜನೆ",

    currentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    destination: "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?",
    destinationPlaceholder:
      "ನಗರ, ಗ್ರಾಮ, ಸ್ಥಳ ಅಥವಾ ವಿಳಾಸ ನಮೂದಿಸಿ",

    useLocation: "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ",
    getRoute: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ ಹುಡುಕಿ",

    locating: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    locationFound: "ಪ್ರಸ್ತುತ ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ",
    locationDenied: "ಸ್ಥಳ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ.",
    locationError:
      "ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

    enterDestination:
      "ದಯವಿಟ್ಟು ಗಮ್ಯಸ್ಥಾನ ನಮೂದಿಸಿ.",

    searching: "ಗಮ್ಯಸ್ಥಾನ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    calculating: "ಮಾರ್ಗ ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತಿದೆ...",
    analyzingWeather:
      "ಮಾರ್ಗದ ಹವಾಮಾನವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",

    route: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ",
    distance: "ದೂರ",
    duration: "ಅಂದಾಜು ಸಮಯ",

    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್",
    gps: "GPS",
    ready: "ಸಿದ್ಧ",

    map: "ಸೇಫ್-ಪಾತ್ ನಕ್ಷೆ",
    liveMap: "ಲೈವ್ ಮಾರ್ಗ ನಕ್ಷೆ",

    noRoute:
      "ಮಾರ್ಗ ನೋಡಲು ಗಮ್ಯಸ್ಥಾನ ನಮೂದಿಸಿ.",

    startNavigation: "ನ್ಯಾವಿಗೇಶನ್ ಪ್ರಾರಂಭಿಸಿ",

    weatherTitle: "ಮಾರ್ಗ ಹವಾಮಾನ ಮತ್ತು ಸುರಕ್ಷತೆ",

    weatherSubtitle:
      "ಮಾರ್ಗದ ಪ್ರಮುಖ ಸ್ಥಳಗಳಲ್ಲಿ ಹವಾಮಾನ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",

    weatherStart: "ಆರಂಭಿಕ ಪ್ರದೇಶ",
    weatherMid: "ಮಾರ್ಗದ ಮಧ್ಯಭಾಗ",
    weatherDestination: "ಗಮ್ಯಸ್ಥಾನ",

    temperature: "ತಾಪಮಾನ",
    rainProbability: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    rainfall: "ಮಳೆ",
    weatherRisk: "ಹವಾಮಾನ ಅಪಾಯ",

    safetyScore:
      "ಮಾರ್ಗ ಹವಾಮಾನ ಸುರಕ್ಷತಾ ಸ್ಕೋರ್",

    low: "ಕಡಿಮೆ",
    medium: "ಮಧ್ಯಮ",
    high: "ಹೆಚ್ಚು",

    lowWarningTitle: "✓ ಕಡಿಮೆ ಹವಾಮಾನ ಅಪಾಯ",

    lowWarningText:
      "ಪರಿಶೀಲಿಸಿದ ಮಾರ್ಗ ಸ್ಥಳಗಳಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಹವಾಮಾನ ಅಪಾಯ ಕಂಡುಬಂದಿಲ್ಲ.",

    mediumWarningTitle:
      "⚠️ ಮಧ್ಯಮ ಹವಾಮಾನ ಅಪಾಯ",

    mediumWarningText:
      "ಮಳೆಯು ದೃಶ್ಯತೆ ಮತ್ತು ರಸ್ತೆ ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರಿಣಾಮಗೊಳಿಸಬಹುದು. ಎಚ್ಚರಿಕೆಯಿಂದ ಚಾಲನೆ ಮಾಡಿ.",

    highWarningTitle:
      "⚠️ ಹೆಚ್ಚಿನ ಹವಾಮಾನ ಅಪಾಯ",

    highWarningText:
      "ಭಾರಿ ಮಳೆ ಅಥವಾ ತೀವ್ರ ಹವಾಮಾನ ಪ್ರಯಾಣದ ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರಿಣಾಮಗೊಳಿಸಬಹುದು. ಸುರಕ್ಷಿತ ಪರ್ಯಾಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",

    weatherUnavailable:
      "ಹವಾಮಾನ ಮಾಹಿತಿ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ.",

    governmentAlert:
      "ಸರ್ಕಾರಿ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆಗಳು",

    governmentAlertText:
      "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವಿಪತ್ತು ಮಾಹಿತಿ ಫೀಡ್ ಸಂಪರ್ಕಿಸಿದ ನಂತರ ಪರಿಶೀಲಿಸಲಾದ ಎಚ್ಚರಿಕೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",

    verifiedOnly:
      "ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆಯಾಗಿ ಪರಿಶೀಲಿಸಲಾದ ಸರ್ಕಾರಿ ಅಥವಾ ಅಧಿಕೃತ ವಿಪತ್ತು ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ತೋರಿಸಬೇಕು.",

    food: "ಸ್ಮಾರ್ಟ್ ಆಹಾರ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಸ್ಥಳ",

    foodText:
      "ಲೆಕ್ಕ ಹಾಕಿದ ಮಾರ್ಗದಲ್ಲಿ ಆಹಾರ, ನೀರು ಮತ್ತು ವಿಶ್ರಾಂತಿ ಸ್ಥಳಗಳನ್ನು ಸೂಚಿಸಬಹುದು.",

    foodRouteText:
      "ಮಾರ್ಗ ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ. ಈಗ ಹತ್ತಿರದ ಆಹಾರ, ನೀರು, ಆಶ್ರಯ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಸ್ಥಳಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಬಹುದು.",

    safety: "ಸುರಕ್ಷತಾ ಮಾಹಿತಿ",

    safetyText:
      "Safe Path ನಿಮ್ಮ ಸ್ಥಳ, ಮಾರ್ಗ ಮತ್ತು ಲಭ್ಯವಿರುವ ಪರಿಸರ ಅಪಾಯದ ಮಾಹಿತಿಯನ್ನು ಸಂಯೋಜಿಸುತ್ತದೆ.",

    sos: "SOS",

    sosSubtitle:
      "ತುರ್ತು ಸಹಾಯ ವಿನಂತಿ ಕಳುಹಿಸಿ",

    dataNotice: "ಡೇಟಾ ಸ್ಥಿತಿ",

    dataNoticeText:
      "GPS ನಿಮ್ಮ ಸಾಧನದಿಂದ ಬರುತ್ತದೆ. Routing OpenStreetMap ಹೊಂದಾಣಿಕೆಯ ಸಾರ್ವಜನಿಕ ಸೇವೆಯನ್ನು ಬಳಸುತ್ತದೆ. ಹವಾಮಾನ Open-Meteo ನಿಂದ ಬರುತ್ತದೆ. ಸರ್ಕಾರಿ ವಿಪತ್ತು ಫೀಡ್‌ಗೆ ಪ್ರತ್ಯೇಕ ಪರಿಶೀಲಿತ ಇಂಟಿಗ್ರೇಶನ್ ಅಗತ್ಯವಿದೆ.",

    destinationNotFound:
      "ಗಮ್ಯಸ್ಥಾನ ಕಂಡುಬಂದಿಲ್ಲ",

    destinationNotFoundText:
      "ಆ ಗಮ್ಯಸ್ಥಾನವನ್ನು ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ. ನಗರ, ಗ್ರಾಮ, ಸ್ಥಳ ಅಥವಾ ಸಂಪೂರ್ಣ ವಿಳಾಸವನ್ನು ಪ್ರಯತ್ನಿಸಿ.",

    routeError: "ಮಾರ್ಗ ದೋಷ",

    routeErrorText:
      "ಈಗ ಮಾರ್ಗ ಲೆಕ್ಕ ಹಾಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",

    gpsRequired:
      "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಇನ್ನೂ ಪತ್ತೆಯಾಗಿಲ್ಲ.",

    internetRequired:
      "ಹೊಸ ಮಾರ್ಗ ಲೆಕ್ಕ ಹಾಕಲು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಗತ್ಯವಿದೆ.",

    permissionTitle: "ಸ್ಥಳ ಅನುಮತಿ",

    permissionText:
      "Safe Path ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಲು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ.",

    navigationUnavailable:
      "ನ್ಯಾವಿಗೇಶನ್ ಅನ್ನು ಈ ಅಪ್ಲಿಕೇಶನ್‌ನ ವೆಬ್ ಆವೃತ್ತಿಯಿಂದ ಮಾತ್ರ ತೆರೆಯಬಹುದು.",

    emergencyTitle: "SOS",

    emergencyText:
      "ತುರ್ತು SOS ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.",
  },
};

/*
 * ============================================================
 * WEATHER HELPERS
 * ============================================================
 */

const getWeatherDescription = (
  weatherCode: number
): string => {
  if (weatherCode === 0) {
    return "Clear sky";
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return "Cloudy";
  }

  if ([45, 48].includes(weatherCode)) {
    return "Fog";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(weatherCode)) {
    return "Rain";
  }

  if ([71, 73, 75, 77].includes(weatherCode)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(weatherCode)) {
    return "Rain showers";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "Thunderstorm";
  }

  return "Unknown";
};

const getWeatherRisk = (
  precipitationProbability: number,
  rain: number,
  weatherCode: number
): "LOW" | "MEDIUM" | "HIGH" => {
  if ([95, 96, 99].includes(weatherCode)) {
    return "HIGH";
  }

  if (
    rain >= 5 ||
    precipitationProbability >= 80
  ) {
    return "HIGH";
  }

  if (
    rain >= 1 ||
    precipitationProbability >= 50
  ) {
    return "MEDIUM";
  }

  return "LOW";
};

const calculateWeatherSafetyScore = (
  precipitationProbability: number,
  rain: number,
  weatherCode: number
): number => {
  let score = 100;

  if (precipitationProbability >= 80) {
    score -= 35;
  } else if (precipitationProbability >= 60) {
    score -= 25;
  } else if (precipitationProbability >= 40) {
    score -= 15;
  } else if (precipitationProbability >= 20) {
    score -= 5;
  }

  if (rain >= 10) {
    score -= 30;
  } else if (rain >= 5) {
    score -= 20;
  } else if (rain >= 1) {
    score -= 10;
  }

  if ([95, 96, 99].includes(weatherCode)) {
    score -= 30;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function SafePathScreen() {
  const {
    triggerSOS,
    setLastSafeRoute,
  } = useSOS();

  const [language, setLanguage] =
    useState<Language>("en");

  const [currentLocation, setCurrentLocation] =
    useState<Coordinates | null>(null);

  const [destination, setDestination] =
    useState("");

  const [destinationCoordinates, setDestinationCoordinates] =
    useState<Coordinates | null>(null);

  const [route, setRoute] =
    useState<RouteInfo | null>(null);

  const [routeWeather, setRouteWeather] =
    useState<RouteWeather | null>(null);

  const [locationStatus, setLocationStatus] =
    useState<
      "loading" | "found" | "denied" | "error"
    >("loading");

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [loadingWeather, setLoadingWeather] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [isOnline, setIsOnline] =
    useState(true);

  const watchId =
    useRef<number | null>(null);

  const t = TEXT[language];

  /*
   * ==========================================================
   * INTERNET STATUS
   * ==========================================================
   */

  useEffect(() => {
    if (Platform.OS !== "web") {
      setIsOnline(true);
      return;
    }

    const updateOnline = () => {
      setIsOnline(
        window.navigator.onLine
      );
    };

    updateOnline();

    window.addEventListener(
      "online",
      updateOnline
    );

    window.addEventListener(
      "offline",
      updateOnline
    );

    return () => {
      window.removeEventListener(
        "online",
        updateOnline
      );

      window.removeEventListener(
        "offline",
        updateOnline
      );
    };
  }, []);

  /*
   * ==========================================================
   * GET CURRENT LOCATION
   * ==========================================================
   */

  const getCurrentLocation = () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "GPS",
        "Native GPS integration will be connected with Expo Location."
      );

      return;
    }

    if (
      !window.navigator.geolocation
    ) {
      setLocationStatus("error");

      setStatusMessage(
        t.locationError
      );

      return;
    }

    setLocationStatus("loading");

    setStatusMessage(
      t.locating
    );

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setCurrentLocation(coords);

        setLocationStatus("found");

        setStatusMessage(
          t.locationFound
        );
      },

      (error) => {
        console.log(
          "GPS error:",
          error
        );

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setLocationStatus(
            "denied"
          );

          setStatusMessage(
            t.locationDenied
          );

          Alert.alert(
            t.permissionTitle,
            t.permissionText
          );
        } else {
          setLocationStatus(
            "error"
          );

          setStatusMessage(
            t.locationError
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  };

  /*
   * ==========================================================
   * LIVE GPS WATCH
   * ==========================================================
   */

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    if (
      !window.navigator.geolocation
    ) {
      return;
    }

    watchId.current =
      window.navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          });

          setLocationStatus(
            "found"
          );
        },

        (error) => {
          console.log(
            "GPS watch error:",
            error
          );
        },

        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

    return () => {
      if (
        watchId.current !== null
      ) {
        window.navigator.geolocation.clearWatch(
          watchId.current
        );
      }
    };
  }, []);

  /*
   * ==========================================================
   * GET GPS WHEN SCREEN OPENS
   * ==========================================================
   */

  useEffect(() => {
    getCurrentLocation();
  }, []);

  /*
   * ==========================================================
   * GEOCODE DESTINATION
   * ==========================================================
   */

  const geocodeDestination = async (
    place: string
  ): Promise<Coordinates | null> => {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        q: place,
        format: "json",
        limit: "1",
      }).toString();

    const response =
      await fetch(url, {
        headers: {
          Accept:
            "application/json",

          "Accept-Language":
            language,
        },
      });

    if (!response.ok) {
      throw new Error(
        "Destination search failed"
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      data.length === 0
    ) {
      return null;
    }

    return {
      latitude:
        Number(data[0].lat),

      longitude:
        Number(data[0].lon),
    };
  };

  /*
   * ==========================================================
   * CALCULATE ROUTE
   * ==========================================================
   */

  const calculateRoute = async (
    start: Coordinates,
    end: Coordinates
  ): Promise<RouteInfo> => {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start.longitude},${start.latitude};` +
      `${end.longitude},${end.latitude}` +
      `?overview=full&geometries=geojson`;

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Routing service failed"
      );
    }

    const data =
      await response.json();

    if (
      !data.routes ||
      data.routes.length === 0
    ) {
      throw new Error(
        "No route found"
      );
    }

    const selectedRoute =
      data.routes[0];

    return {
      distanceKm:
        selectedRoute.distance /
        1000,

      durationMin:
        selectedRoute.duration /
        60,

      geometry:
        selectedRoute.geometry
          .coordinates,
    };
  };

  /*
   * ==========================================================
   * FETCH WEATHER AT ONE LOCATION
   * ==========================================================
   */

  const fetchWeatherAtLocation =
    async (
      name: string,
      coordinates: Coordinates
    ): Promise<WeatherPoint> => {
      const params =
        new URLSearchParams({
          latitude:
            coordinates.latitude.toString(),

          longitude:
            coordinates.longitude.toString(),

          current:
            "temperature_2m,precipitation,rain,weather_code",

          hourly:
            "precipitation_probability",

          forecast_days: "1",

          timezone: "auto",
        });

      const response =
        await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`
        );

      if (!response.ok) {
        throw new Error(
          "Weather service failed"
        );
      }

      const data =
        await response.json();

      const current =
        data.current || {};

      const temperature =
        Number(
          current.temperature_2m ?? 0
        );

      const precipitation =
        Number(
          current.precipitation ?? 0
        );

      const rain =
        Number(
          current.rain ?? 0
        );

      const weatherCode =
        Number(
          current.weather_code ?? 0
        );

      const precipitationProbability =
        Number(
          data.hourly
            ?.precipitation_probability
            ?.[0] ?? 0
        );

      const risk =
        getWeatherRisk(
          precipitationProbability,
          rain,
          weatherCode
        );

      const safetyScore =
        calculateWeatherSafetyScore(
          precipitationProbability,
          rain,
          weatherCode
        );

      return {
        name,

        coordinates,

        temperature,

        precipitation,

        rain,

        precipitationProbability,

        weatherCode,

        description:
          getWeatherDescription(
            weatherCode
          ),

        risk,

        safetyScore,
      };
    };

  /*
   * ==========================================================
   * ANALYZE WEATHER ALONG ROUTE
   * ==========================================================
   */

  const analyzeRouteWeather =
    async (
      start: Coordinates,
      end: Coordinates,
      calculatedRoute: RouteInfo
    ) => {
      try {
        setLoadingWeather(true);

        /*
         * Use the actual route geometry to select
         * a midpoint.
         */

        let midpoint: Coordinates;

        if (
          calculatedRoute.geometry.length >
          0
        ) {
          const middleIndex =
            Math.floor(
              calculatedRoute.geometry
                .length / 2
            );

          const middle =
            calculatedRoute.geometry[
              middleIndex
            ];

          midpoint = {
            longitude:
              middle[0],

            latitude:
              middle[1],
          };
        } else {
          midpoint = {
            latitude:
              (start.latitude +
                end.latitude) /
              2,

            longitude:
              (start.longitude +
                end.longitude) /
              2,
          };
        }

        const weatherPoints =
          await Promise.all([
            fetchWeatherAtLocation(
              t.weatherStart,
              start
            ),

            fetchWeatherAtLocation(
              t.weatherMid,
              midpoint
            ),

            fetchWeatherAtLocation(
              t.weatherDestination,
              end
            ),
          ]);

        /*
         * Highest risk wins.
         */

        const hasHighRisk =
          weatherPoints.some(
            (point) =>
              point.risk === "HIGH"
          );

        const hasMediumRisk =
          weatherPoints.some(
            (point) =>
              point.risk === "MEDIUM"
          );

        let overallRisk:
          | "LOW"
          | "MEDIUM"
          | "HIGH" = "LOW";

        if (hasHighRisk) {
          overallRisk = "HIGH";
        } else if (hasMediumRisk) {
          overallRisk = "MEDIUM";
        }

        /*
         * Conservative score:
         * use the lowest score along the route.
         */

        const safetyScore =
          Math.min(
            ...weatherPoints.map(
              (point) =>
                point.safetyScore
            )
          );

        setRouteWeather({
          points: weatherPoints,

          overallRisk,

          safetyScore,
        });
      } catch (error) {
        console.error(
          "Weather analysis error:",
          error
        );

        setRouteWeather(null);
      } finally {
        setLoadingWeather(false);
      }
    };

  /*
   * ==========================================================
   * FIND SAFE ROUTE
   * ==========================================================
   */

  const findSafeRoute = async () => {
    if (
      !destination.trim()
    ) {
      Alert.alert(
        "Destination",
        t.enterDestination
      );

      return;
    }

    if (!currentLocation) {
      Alert.alert(
        "GPS",
        t.gpsRequired
      );

      getCurrentLocation();

      return;
    }

    if (!isOnline) {
      Alert.alert(
        "Offline",
        t.internetRequired
      );

      return;
    }

    try {
      setLoadingRoute(true);

      setRoute(null);

      setRouteWeather(null);

      setDestinationCoordinates(
        null
      );

      setStatusMessage(
        t.searching
      );

      /*
       * 1. Find destination
       */

      const destinationLocation =
        await geocodeDestination(
          destination.trim()
        );

      if (
        !destinationLocation
      ) {
        Alert.alert(
          t.destinationNotFound,
          t.destinationNotFoundText
        );

        return;
      }

      setDestinationCoordinates(
        destinationLocation
      );

      /*
       * 2. Calculate actual route
       */

      setStatusMessage(
        t.calculating
      );

      const calculatedRoute =
        await calculateRoute(
          currentLocation,
          destinationLocation
        );

      // Save the calculated route so SOS can include the last safe route.
      setLastSafeRoute({
        points: calculatedRoute.geometry.map(
          ([longitude, latitude]) => ({
            latitude,
            longitude,
          })
        ),
        distanceMeters: calculatedRoute.distanceKm * 1000,
        durationSeconds: calculatedRoute.durationMin * 60,
        startedAt: new Date().toISOString(),
        destination: destination.trim(),
      });

      setStatusMessage(
        t.analyzingWeather
      );

      await analyzeRouteWeather(
        currentLocation,
        destinationLocation,
        calculatedRoute
      );

      setStatusMessage(
        t.ready
      );
    } catch (error) {
      console.error(
        "Safe Path error:",
        error
      );

      Alert.alert(
        t.routeError,
        t.routeErrorText
      );
    } finally {
      setLoadingRoute(false);
    }
  };

  /*
   * ==========================================================
   * MAP HTML
   * ==========================================================
   */

  const mapHtml = useMemo(() => {
    if (!currentLocation) {
      return null;
    }

    const routeCoordinates =
      route?.geometry || [];

    const routeJson =
      JSON.stringify(
        routeCoordinates
      );

    const startLat =
      currentLocation.latitude;

    const startLng =
      currentLocation.longitude;

    const endLat =
      destinationCoordinates
        ?.latitude ??
      startLat;

    const endLng =
      destinationCoordinates
        ?.longitude ??
      startLng;

    return `
<!DOCTYPE html>
<html>
<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<style>

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}

.leaflet-control-attribution {
  font-size: 9px;
}

.current-label {
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 5px 8px;
  font-weight: bold;
}

.destination-label {
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 5px 8px;
  font-weight: bold;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const start = [
  ${startLat},
  ${startLng}
];

const destination = [
  ${endLat},
  ${endLng}
];

const routeCoordinates =
  ${routeJson};

const map =
  L.map("map");

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,

    attribution:
      "&copy; OpenStreetMap contributors"
  }
).addTo(map);

/*
 * Current location marker
 */

const currentMarker =
  L.marker(start)
    .addTo(map)
    .bindTooltip(
      "📍 Your Current Location",
      {
        permanent: true,
        direction: "top",
        className: "current-label"
      }
    );

/*
 * Accuracy circle
 */

L.circle(
  start,
  {
    radius: 50,
    color: "#1976D2",
    fillColor: "#1976D2",
    fillOpacity: 0.12
  }
).addTo(map);

/*
 * Destination marker
 */

${
  destinationCoordinates
    ? `
L.marker(destination)
  .addTo(map)
  .bindTooltip(
    "🎯 Destination",
    {
      permanent: true,
      direction: "top",
      className: "destination-label"
    }
  );
`
    : ""
}

/*
 * Draw route
 */

if (
  routeCoordinates.length > 0
) {

  const leafletRoute =
    routeCoordinates.map(
      function(point) {
        return [
          point[1],
          point[0]
        ];
      }
    );

  const line =
    L.polyline(
      leafletRoute,
      {
        color: "#1976D2",
        weight: 6,
        opacity: 0.9
      }
    ).addTo(map);

  map.fitBounds(
    line.getBounds(),
    {
      padding: [40, 40]
    }
  );

} else {

  map.setView(
    start,
    13
  );

}

</script>

</body>
</html>
`;
  }, [
    currentLocation,
    destinationCoordinates,
    route,
  ]);

  /*
   * ==========================================================
   * START NAVIGATION
   * ==========================================================
   */

  const openNavigation = () => {
    if (
      !destinationCoordinates
    ) {
      Alert.alert(
        "Destination",
        t.enterDestination
      );

      return;
    }

    if (Platform.OS !== "web") {
      Alert.alert(
        "Navigation",
        t.navigationUnavailable
      );

      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${destinationCoordinates.latitude},${destinationCoordinates.longitude}` +
      `&travelmode=driving`;

    window.open(
      url,
      "_blank"
    );
  };

  /*
   * ==========================================================
   * SOS
   * ==========================================================
   */

  const sendSOS = async () => {
    try {
      const result = await triggerSOS({
        mentalHealthFlag: false,
      });

      if (String(result.status).toUpperCase() === "SENT") {
        Alert.alert(
          "🚨 SOS SENT",
          `Emergency request sent successfully.

SOS ID: ${result.id}

Your current/last-known location and last safe route were included.`
        );
      } else {
        Alert.alert(
          "🚨 SOS QUEUED",
          `No reliable internet connection.

Your SOS has been saved on this device and will automatically retry when connectivity returns.

SOS ID: ${result.id}`
        );
      }
    } catch (error) {
      console.error("SOS error:", error);
      Alert.alert(
        t.emergencyTitle,
        "Unable to create SOS right now. Please try again."
      );
    }
  };

  /*
   * ==========================================================
   * FORMAT DURATION
   * ==========================================================
   */

  const formatDuration = (
    minutes: number
  ) => {
    const total =
      Math.round(minutes);

    if (total < 60) {
      return `${total} min`;
    }

    const hours =
      Math.floor(total / 60);

    const mins =
      total % 60;

    if (mins === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
  };

  /*
   * ==========================================================
   * WEATHER ICON
   * ==========================================================
   */

  const getWeatherIcon = (
    point: WeatherPoint
  ) => {
    if (
      [95, 96, 99].includes(
        point.weatherCode
      )
    ) {
      return "⛈️";
    }

    if (
      point.rain > 0 ||
      point.precipitationProbability >=
        50
    ) {
      return "🌧️";
    }

    if (
      point.weatherCode === 0
    ) {
      return "☀️";
    }

    return "⛅";
  };

  /*
   * ==========================================================
   * WEATHER RISK TEXT
   * ==========================================================
   */

  const getRiskText = (
    risk:
      | "LOW"
      | "MEDIUM"
      | "HIGH"
  ) => {
    if (risk === "HIGH") {
      return t.high;
    }

    if (risk === "MEDIUM") {
      return t.medium;
    }

    return t.low;
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
            ================================================== */}

        <View style={styles.header}>
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.title}>
              {t.title}
            </Text>

            <Text style={styles.subtitle}>
              {t.subtitle}
            </Text>
          </View>

          <View
            style={
              styles.languageRow
            }
          >
            {(
              ["en", "hi", "kn"] as Language[]
            ).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  language === lang &&
                    styles.languageButtonActive,
                ]}
                onPress={() =>
                  setLanguage(lang)
                }
              >
                <Text
                  style={[
                    styles.languageText,
                    language === lang &&
                      styles.languageTextActive,
                  ]}
                >
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ==================================================
            CONNECTION BAR
            ================================================== */}

        <View
          style={
            styles.connectionBar
          }
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  isOnline
                    ? "#219653"
                    : "#D32F2F",
              },
            ]}
          />

          <Text
            style={
              styles.connectionText
            }
          >
            {isOnline
              ? t.online
              : t.offline}
          </Text>

          <Text
            style={
              styles.connectionSeparator
            }
          >
            •
          </Text>

          <Text
            style={
              styles.connectionText
            }
          >
            {t.gps}:{" "}
            {locationStatus ===
            "found"
              ? "✓"
              : locationStatus ===
                "loading"
              ? "..."
              : "!"}
          </Text>
        </View>

        {/* ==================================================
            LOCATION + DESTINATION
            ================================================== */}

        <View
          style={styles.searchCard}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.currentLocation}
          </Text>

          <View
            style={
              styles.locationBox
            }
          >
            <Text
              style={
                styles.locationIcon
              }
            >
              📍
            </Text>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.locationTitle
                }
              >
                {locationStatus ===
                "found"
                  ? t.locationFound
                  : locationStatus ===
                    "loading"
                  ? t.locating
                  : t.locationError}
              </Text>

              {currentLocation && (
                <Text
                  style={
                    styles.coordinates
                  }
                >
                  {currentLocation.latitude.toFixed(
                    6
                  )}
                  ,{" "}
                  {currentLocation.longitude.toFixed(
                    6
                  )}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={
                styles.locationButton
              }
              onPress={
                getCurrentLocation
              }
            >
              <Text
                style={
                  styles.locationButtonText
                }
              >
                GPS
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.destination}
          </Text>

          <TextInput
            value={destination}
            onChangeText={
              setDestination
            }
            placeholder={
              t.destinationPlaceholder
            }
            placeholderTextColor="#8A94A6"
            style={
              styles.destinationInput
            }
            returnKeyType="search"
            onSubmitEditing={
              findSafeRoute
            }
          />

          <TouchableOpacity
            style={[
              styles.routeButton,
              loadingRoute &&
                styles.routeButtonDisabled,
            ]}
            onPress={
              findSafeRoute
            }
            disabled={
              loadingRoute
            }
          >
            <Text
              style={
                styles.routeButtonText
              }
            >
              {loadingRoute
                ? "..."
                : `🧭 ${t.getRoute}`}
            </Text>
          </TouchableOpacity>

          {statusMessage ? (
            <Text
              style={
                styles.statusMessage
              }
            >
              {statusMessage}
            </Text>
          ) : null}
        </View>

        {/* ==================================================
            MAP
            ================================================== */}

        <View
          style={styles.mapCard}
        >
          <View
            style={
              styles.mapHeader
            }
          >
            <View>
              <Text
                style={
                  styles.mapTitle
                }
              >
                {t.map}
              </Text>

              <Text
                style={
                  styles.mapSubtitle
                }
              >
                {currentLocation
                  ? t.liveMap
                  : t.noRoute}
              </Text>
            </View>
          </View>

          {Platform.OS ===
            "web" &&
          mapHtml ? (
            <iframe
              title="Safe Path Map"
              srcDoc={mapHtml}
              style={{
                width: "100%",
                height: 460,
                border: "none",
                display: "block",
              }}
              allow="geolocation"
            />
          ) : (
            <View
              style={
                styles.mapFallback
              }
            >
              <Text
                style={
                  styles.mapFallbackIcon
                }
              >
                🗺️
              </Text>

              <Text
                style={
                  styles.mapFallbackTitle
                }
              >
                {currentLocation
                  ? "Map ready"
                  : "Waiting for GPS"}
              </Text>

              <Text
                style={
                  styles.mapFallbackText
                }
              >
                {currentLocation
                  ? `${currentLocation.latitude.toFixed(
                      5
                    )}, ${currentLocation.longitude.toFixed(
                      5
                    )}`
                  : "Enable location access to continue."}
              </Text>
            </View>
          )}
        </View>

        {/* ==================================================
            ROUTE RESULT
            ================================================== */}

        {route && (
          <View
            style={
              styles.routeResult
            }
          >
            <View
              style={
                styles.routeResultHeader
              }
            >
              <Text
                style={
                  styles.routeResultTitle
                }
              >
                🧭 {t.route}
              </Text>

              <View
                style={
                  styles.safeBadge
                }
              >
                <Text
                  style={
                    styles.safeBadgeText
                  }
                >
                  SAFE PATH
                </Text>
              </View>
            </View>

            <View
              style={
                styles.routeStats
              }
            >
              <View
                style={
                  styles.statBox
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {route.distanceKm.toFixed(
                    1
                  )}{" "}
                  km
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  {t.distance}
                </Text>
              </View>

              <View
                style={
                  styles.statBox
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {formatDuration(
                    route.durationMin
                  )}
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  {t.duration}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={
                styles.navigationButton
              }
              onPress={
                openNavigation
              }
            >
              <Text
                style={
                  styles.navigationButtonText
                }
              >
                🚗{" "}
                {t.startNavigation}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================
            ROUTE WEATHER
            ================================================== */}

        {route && (
          <View
            style={
              styles.weatherCard
            }
          >
            <View
              style={
                styles.weatherHeader
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.weatherTitle
                  }
                >
                  🌦️{" "}
                  {t.weatherTitle}
                </Text>

                <Text
                  style={
                    styles.weatherSubtitle
                  }
                >
                  {t.weatherSubtitle}
                </Text>
              </View>

              {loadingWeather && (
                <Text
                  style={
                    styles.weatherLoading
                  }
                >
                  Updating...
                </Text>
              )}
            </View>

            {routeWeather ? (
              <>
                {/* OVERALL SCORE */}

                <View
                  style={
                    styles.overallWeather
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.overallRiskLabel
                      }
                    >
                      Overall Route Risk
                    </Text>

                    <Text
                      style={[
                        styles.overallRisk,
                        routeWeather.overallRisk ===
                          "HIGH" &&
                          styles.highRisk,
                        routeWeather.overallRisk ===
                          "MEDIUM" &&
                          styles.mediumRisk,
                        routeWeather.overallRisk ===
                          "LOW" &&
                          styles.lowRisk,
                      ]}
                    >
                      {getRiskText(
                        routeWeather.overallRisk
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.scoreCircle
                    }
                  >
                    <Text
                      style={
                        styles.scoreCircleValue
                      }
                    >
                      {
                        routeWeather.safetyScore
                      }
                    </Text>

                    <Text
                      style={
                        styles.scoreCircleLabel
                      }
                    >
                      /100
                    </Text>
                  </View>
                </View>

                {/* WEATHER POINTS */}

                {routeWeather.points.map(
                  (
                    point,
                    index
                  ) => (
                    <View
                      key={`${point.name}-${index}`}
                      style={
                        styles.weatherPoint
                      }
                    >
                      <View
                        style={
                          styles.weatherPointIcon
                        }
                      >
                        <Text
                          style={
                            styles.bigWeatherIcon
                          }
                        >
                          {getWeatherIcon(
                            point
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.weatherPointContent
                        }
                      >
                        <Text
                          style={
                            styles.weatherPointName
                          }
                        >
                          {point.name}
                        </Text>

                        <Text
                          style={
                            styles.weatherDescription
                          }
                        >
                          {
                            point.description
                          }
                        </Text>

                        <View
                          style={
                            styles.weatherMiniStats
                          }
                        >
                          <Text
                            style={
                              styles.weatherMiniText
                            }
                          >
                            🌡️{" "}
                            {point.temperature.toFixed(
                              1
                            )}
                            °C
                          </Text>

                          <Text
                            style={
                              styles.weatherMiniText
                            }
                          >
                            🌧️{" "}
                            {
                              point.precipitationProbability
                            }
                            %
                          </Text>

                          <Text
                            style={
                              styles.weatherMiniText
                            }
                          >
                            💧{" "}
                            {point.rain.toFixed(
                              1
                            )}{" "}
                            mm
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.riskBadge,
                          point.risk ===
                            "HIGH" &&
                            styles.riskBadgeHigh,
                          point.risk ===
                            "MEDIUM" &&
                            styles.riskBadgeMedium,
                          point.risk ===
                            "LOW" &&
                            styles.riskBadgeLow,
                        ]}
                      >
                        <Text
                          style={[
                            styles.riskBadgeText,
                            point.risk ===
                              "HIGH" &&
                              styles.riskTextHigh,
                            point.risk ===
                              "MEDIUM" &&
                              styles.riskTextMedium,
                            point.risk ===
                              "LOW" &&
                              styles.riskTextLow,
                          ]}
                        >
                          {getRiskText(
                            point.risk
                          )}
                        </Text>
                      </View>
                    </View>
                  )
                )}

                {/* SCORE BAR */}

                <View
                  style={
                    styles.safetyScoreContainer
                  }
                >
                  <View
                    style={
                      styles.safetyScoreHeader
                    }
                  >
                    <Text
                      style={
                        styles.safetyScoreTitle
                      }
                    >
                      🛡️{" "}
                      {t.safetyScore}
                    </Text>

                    <Text
                      style={
                        styles.safetyScoreValue
                      }
                    >
                      {
                        routeWeather.safetyScore
                      }
                      /100
                    </Text>
                  </View>

                  <View
                    style={
                      styles.scoreBackground
                    }
                  >
                    <View
                      style={[
                        styles.scoreFill,
                        {
                          width: `${routeWeather.safetyScore}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* WARNING */}

                {routeWeather.overallRisk ===
                  "HIGH" && (
                  <View
                    style={
                      styles.highWarning
                    }
                  >
                    <Text
                      style={
                        styles.warningTitle
                      }
                    >
                      {
                        t.highWarningTitle
                      }
                    </Text>

                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      {
                        t.highWarningText
                      }
                    </Text>
                  </View>
                )}

                {routeWeather.overallRisk ===
                  "MEDIUM" && (
                  <View
                    style={
                      styles.mediumWarning
                    }
                  >
                    <Text
                      style={
                        styles.warningTitle
                      }
                    >
                      {
                        t.mediumWarningTitle
                      }
                    </Text>

                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      {
                        t.mediumWarningText
                      }
                    </Text>
                  </View>
                )}

                {routeWeather.overallRisk ===
                  "LOW" && (
                  <View
                    style={
                      styles.lowWarning
                    }
                  >
                    <Text
                      style={
                        styles.warningTitle
                      }
                    >
                      {
                        t.lowWarningTitle
                      }
                    </Text>

                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      {
                        t.lowWarningText
                      }
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text
                style={
                  styles.noWeather
                }
              >
                {t.weatherUnavailable}
              </Text>
            )}
          </View>
        )}

        {/* ==================================================
            GOVERNMENT ALERT
            ================================================== */}

        <View
          style={
            styles.alertCard
          }
        >
          <Text
            style={
              styles.alertTitle
            }
          >
            🏛️{" "}
            {t.governmentAlert}
          </Text>

          <Text
            style={
              styles.alertSubtitle
            }
          >
            Verified information only
          </Text>

          <Text
            style={
              styles.alertText
            }
          >
            {
              t.governmentAlertText
            }
          </Text>

          <View
            style={
              styles.alertWarning
            }
          >
            <Text
              style={
                styles.alertWarningText
              }
            >
              ℹ️{" "}
              {t.verifiedOnly}
            </Text>
          </View>
        </View>

        {/* ==================================================
            FOOD / REST
            ================================================== */}

        <View
          style={
            styles.foodCard
          }
        >
          <Text
            style={
              styles.foodTitle
            }
          >
            🍽️ {t.food}
          </Text>

          <Text
            style={
              styles.foodText
            }
          >
            {route
              ? t.foodRouteText
              : t.foodText}
          </Text>

          {route && (
            <View
              style={
                styles.foodInfo
              }
            >
              <Text
                style={
                  styles.foodInfoText
                }
              >
                🛣️ Route:{" "}
                {route.distanceKm.toFixed(
                  1
                )}{" "}
                km
              </Text>

              <Text
                style={
                  styles.foodInfoText
                }
              >
                🍴 Nearby food/rest
                analysis ready
              </Text>

              <Text
                style={
                  styles.foodInfoText
                }
              >
                💧 Water availability
                analysis ready
              </Text>
            </View>
          )}
        </View>

        {/* ==================================================
            SAFETY
            ================================================== */}

        <View
          style={
            styles.safetyCard
          }
        >
          <Text
            style={
              styles.safetyTitle
            }
          >
            🛡️ {t.safety}
          </Text>

          <Text
            style={
              styles.safetyText
            }
          >
            {t.safetyText}
          </Text>

          <View
            style={
              styles.safetyItems
            }
          >
            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Current GPS
            </Text>

            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Dynamic destination
            </Text>

            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Real route calculation
            </Text>

            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Route weather analysis
            </Text>

            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Weather safety score
            </Text>

            <Text
              style={
                styles.safetyItem
              }
            >
              ✓ Emergency SOS
            </Text>
          </View>
        </View>

        {/* ==================================================
            SOS
            ================================================== */}

        <TouchableOpacity
          style={
            styles.sosButton
          }
          onPress={
            sendSOS
          }
        >
          <Text
            style={
              styles.sosButtonText
            }
          >
            🚨 {t.sos}
          </Text>

          <Text
            style={
              styles.sosButtonSubtext
            }
          >
            {t.sosSubtitle}
          </Text>
        </TouchableOpacity>

        {/* ==================================================
            DATA NOTICE
            ================================================== */}

        <View
          style={
            styles.dataCard
          }
        >
          <Text
            style={
              styles.dataTitle
            }
          >
            ℹ️ {t.dataNotice}
          </Text>

          <Text
            style={
              styles.dataText
            }
          >
            {t.dataNoticeText}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 50,
  },

  /*
   * HEADER
   */

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5EA",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#172033",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7483",
    marginTop: 5,
  },

  languageRow: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 12,
  },

  languageButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#E9EDF2",
  },

  languageButtonActive: {
    backgroundColor: "#087FF5",
  },

  languageText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#303844",
  },

  languageTextActive: {
    color: "#FFFFFF",
  },

  /*
   * CONNECTION
   */

  connectionBar: {
    height: 52,
    backgroundColor: "#F0F2F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 9,
  },

  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },

  connectionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A515C",
  },

  connectionSeparator: {
    color: "#8A919C",
    fontSize: 16,
  },

  /*
   * SEARCH
   */

  searchCard: {
    backgroundColor: "#FFFFFF",
    margin: 14,
    padding: 18,
    borderRadius: 14,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 9,
  },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },

  locationIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#263142",
  },

  coordinates: {
    fontSize: 12,
    color: "#727C89",
    marginTop: 3,
  },

  locationButton: {
    backgroundColor: "#E2EDFF",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  locationButtonText: {
    color: "#1466C5",
    fontWeight: "800",
  },

  destinationInput: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D6DCE3",
    borderRadius: 11,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#172033",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  routeButton: {
    height: 53,
    borderRadius: 11,
    backgroundColor: "#087FF5",
    alignItems: "center",
    justifyContent: "center",
  },

  routeButtonDisabled: {
    opacity: 0.55,
  },

  routeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  statusMessage: {
    marginTop: 10,
    textAlign: "center",
    color: "#687384",
    fontSize: 13,
  },

  /*
   * MAP
   */

  mapCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 14,
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  mapHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  mapTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  mapSubtitle: {
    marginTop: 3,
    color: "#737D8B",
    fontSize: 13,
  },

  mapFallback: {
    height: 460,
    backgroundColor: "#E9EEF3",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  mapFallbackIcon: {
    fontSize: 55,
    marginBottom: 12,
  },

  mapFallbackTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#273244",
  },

  mapFallbackText: {
    marginTop: 8,
    color: "#6E7886",
    textAlign: "center",
  },

  /*
   * ROUTE
   */

  routeResult: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFE2FF",
  },

  routeResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  routeResultTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172033",
  },

  safeBadge: {
    backgroundColor: "#E4F7EC",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  safeBadgeText: {
    color: "#21834A",
    fontWeight: "800",
    fontSize: 11,
  },

  routeStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#F4F7FA",
    padding: 14,
    borderRadius: 10,
  },

  statValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#172033",
  },

  statLabel: {
    color: "#747E8B",
    marginTop: 4,
    fontSize: 13,
  },

  navigationButton: {
    marginTop: 13,
    backgroundColor: "#172033",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  /*
   * WEATHER
   */

  weatherCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E3F0",
  },

  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weatherTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
  },

  weatherSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#737D8B",
    lineHeight: 19,
  },

  weatherLoading: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "700",
  },

  overallWeather: {
    marginTop: 17,
    padding: 15,
    backgroundColor: "#F5F8FC",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  overallRiskLabel: {
    color: "#6B7583",
    fontSize: 13,
    fontWeight: "600",
  },

  overallRisk: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
  },

  scoreCircle: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreCircleValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1976D2",
  },

  scoreCircleLabel: {
    fontSize: 10,
    color: "#657386",
    marginTop: -3,
  },

  weatherPoint: {
    marginTop: 12,
    padding: 13,
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  weatherPointIcon: {
    width: 46,
    alignItems: "center",
  },

  bigWeatherIcon: {
    fontSize: 29,
  },

  weatherPointContent: {
    flex: 1,
    paddingHorizontal: 8,
  },

  weatherPointName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#283446",
  },

  weatherDescription: {
    marginTop: 2,
    color: "#6C7684",
    fontSize: 12,
  },

  weatherMiniStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    flexWrap: "wrap",
  },

  weatherMiniText: {
    fontSize: 11,
    color: "#566273",
    fontWeight: "600",
  },

  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
  },

  riskBadgeHigh: {
    backgroundColor: "#FFE4E4",
  },

  riskBadgeMedium: {
    backgroundColor: "#FFF1D1",
  },

  riskBadgeLow: {
    backgroundColor: "#E3F5E9",
  },

  riskBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  riskTextHigh: {
    color: "#C62828",
  },

  riskTextMedium: {
    color: "#B66A00",
  },

  riskTextLow: {
    color: "#238B45",
  },

  highRisk: {
    color: "#D62828",
  },

  mediumRisk: {
    color: "#D97706",
  },

  lowRisk: {
    color: "#238B45",
  },

  safetyScoreContainer: {
    marginTop: 18,
  },

  safetyScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  safetyScoreTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#364152",
    flex: 1,
  },

  safetyScoreValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1976D2",
  },

  scoreBackground: {
    height: 10,
    marginTop: 9,
    backgroundColor: "#E5EAF0",
    borderRadius: 10,
    overflow: "hidden",
  },

  scoreFill: {
    height: "100%",
    backgroundColor: "#1976D2",
    borderRadius: 10,
  },

  highWarning: {
    marginTop: 15,
    padding: 13,
    backgroundColor: "#FFE7E7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFB5B5",
  },

  mediumWarning: {
    marginTop: 15,
    padding: 13,
    backgroundColor: "#FFF3D6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1D28A",
  },

  lowWarning: {
    marginTop: 15,
    padding: 13,
    backgroundColor: "#E8F7ED",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B7DFC2",
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333B48",
  },

  warningText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#596473",
  },

  noWeather: {
    marginTop: 15,
    color: "#737D8B",
    fontSize: 14,
  },

  /*
   * GOVERNMENT ALERT
   */

  alertCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 18,
    backgroundColor: "#FFF8F8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5BABA",
  },

  alertTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#A92828",
  },

  alertSubtitle: {
    color: "#818A96",
    marginTop: 5,
    fontSize: 13,
  },

  alertText: {
    color: "#6F3636",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 21,
  },

  alertWarning: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#FBEAEA",
    borderRadius: 9,
  },

  alertWarningText: {
    color: "#7B4141",
    fontWeight: "600",
    lineHeight: 19,
  },

  /*
   * FOOD
   */

  foodCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#FFF9E5",
    borderWidth: 1,
    borderColor: "#F4D66D",
  },

  foodTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#C56A00",
  },

  foodText: {
    marginTop: 9,
    color: "#6F541D",
    fontSize: 14,
    lineHeight: 22,
  },

  foodInfo: {
    marginTop: 13,
    padding: 12,
    backgroundColor: "#FFF1B9",
    borderRadius: 9,
  },

  foodInfoText: {
    color: "#624A17",
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 13,
  },

  /*
   * SAFETY
   */

  safetyCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },

  safetyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
  },

  safetyText: {
    marginTop: 9,
    color: "#626D7C",
    lineHeight: 21,
    fontSize: 14,
  },

  safetyItems: {
    marginTop: 12,
    gap: 7,
  },

  safetyItem: {
    color: "#287447",
    fontWeight: "600",
    fontSize: 14,
  },

  /*
   * SOS
   */

  sosButton: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#D62828",
    minHeight: 68,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  sosButtonSubtext: {
    color: "#FFECEC",
    fontSize: 12,
    marginTop: 3,
  },

  /*
   * DATA
   */

  dataCard: {
    marginHorizontal: 14,
    padding: 16,
    borderRadius: 13,
    backgroundColor: "#EEF4FA",
  },

  dataTitle: {
    fontWeight: "800",
    color: "#33445A",
    fontSize: 15,
  },

  dataText: {
    marginTop: 7,
    color: "#657386",
    fontSize: 13,
    lineHeight: 20,
  },
});