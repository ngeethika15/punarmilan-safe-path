// mobile/src/constants/safety.ts

/**
 * Punarmilan Safe-Path
 * Central safety, triage and journey-intelligence rules.
 *
 * These rules are operational prioritization rules.
 * They are NOT medical diagnosis rules.
 */

// --------------------------------------------------
// TRIAGE SCORING
// --------------------------------------------------

export const TRIAGE_SCORE = {
  CRITICAL_INJURY: 5,
  SERIOUS_INJURY: 4,
  MODERATE_INJURY: 3,
  MENTAL_HEALTH_FLAG: 2,
  SOS_ACTIVE: 3,
  NO_CONNECTIVITY: 2,
  LONG_WAITING: 1,
} as const;

export const TRIAGE_LEVEL = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export type TriageLevel =
  (typeof TRIAGE_LEVEL)[keyof typeof TRIAGE_LEVEL];

export function getTriageLevel(score: number): TriageLevel {
  if (score >= 8) {
    return TRIAGE_LEVEL.CRITICAL;
  }

  if (score >= 6) {
    return TRIAGE_LEVEL.HIGH;
  }

  if (score >= 4) {
    return TRIAGE_LEVEL.MEDIUM;
  }

  return TRIAGE_LEVEL.LOW;
}

// --------------------------------------------------
// INJURY SEVERITY
// --------------------------------------------------

export const INJURY_SEVERITY = {
  NONE: "none",
  MODERATE: "moderate",
  SERIOUS: "serious",
  CRITICAL: "critical",
} as const;

export type InjurySeverity =
  (typeof INJURY_SEVERITY)[keyof typeof INJURY_SEVERITY];

// --------------------------------------------------
// SOS STATUS
// --------------------------------------------------

export const SOS_STATUS = {
  QUEUED: "QUEUED",
  SENT: "SENT",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  RESPONDING: "RESPONDING",
  RESOLVED: "RESOLVED",
  CANCELLED: "CANCELLED",
} as const;

export type SOSStatus =
  (typeof SOS_STATUS)[keyof typeof SOS_STATUS];

// --------------------------------------------------
// CONNECTIVITY
// --------------------------------------------------

export const CONNECTIVITY_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  LIMITED: "LIMITED",
} as const;

export type ConnectivityStatus =
  (typeof CONNECTIVITY_STATUS)[keyof typeof CONNECTIVITY_STATUS];

// --------------------------------------------------
// JOURNEY BREAK RULES
// --------------------------------------------------

export const JOURNEY_RULES = {
  MIN_BREAK_MINUTES: 15,

  /**
   * Suggest a break approximately every 90 minutes.
   */
  BREAK_AFTER_MINUTES: 90,

  /**
   * Distance fallback when time information is unavailable.
   */
  BREAK_AFTER_KM: 100,

  /**
   * Don't recommend a meal stop if the destination
   * is already very close.
   */
  DESTINATION_NEAR_KM: 15,

  /**
   * If no verified food/rest stop is available within
   * this distance, warn the traveller.
   */
  MAX_SAFE_STOP_DISTANCE_KM: 30,
} as const;

// --------------------------------------------------
// MEAL WINDOWS
// --------------------------------------------------

export const MEAL_WINDOWS = {
  BREAKFAST: {
    startHour: 7,
    endHour: 10,
  },

  LUNCH: {
    startHour: 12,
    endHour: 15,
  },

  DINNER: {
    startHour: 19,
    endHour: 22,
  },
} as const;

export type MealType =
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER";

export function getCurrentMealWindow(
  hour: number
): MealType | null {
  if (
    hour >= MEAL_WINDOWS.BREAKFAST.startHour &&
    hour < MEAL_WINDOWS.BREAKFAST.endHour
  ) {
    return "BREAKFAST";
  }

  if (
    hour >= MEAL_WINDOWS.LUNCH.startHour &&
    hour < MEAL_WINDOWS.LUNCH.endHour
  ) {
    return "LUNCH";
  }

  if (
    hour >= MEAL_WINDOWS.DINNER.startHour &&
    hour < MEAL_WINDOWS.DINNER.endHour
  ) {
    return "DINNER";
  }

  return null;
}

// --------------------------------------------------
// WEATHER / DISASTER ALERT LEVELS
// --------------------------------------------------

export const ALERT_LEVEL = {
  INFORMATION: "INFORMATION",
  WATCH: "WATCH",
  WARNING: "WARNING",
  SEVERE: "SEVERE",
} as const;

export type AlertLevel =
  (typeof ALERT_LEVEL)[keyof typeof ALERT_LEVEL];

// --------------------------------------------------
// ROUTE RISK
// --------------------------------------------------

export const ROUTE_RISK = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  BLOCKED: "BLOCKED",
} as const;

export type RouteRisk =
  (typeof ROUTE_RISK)[keyof typeof ROUTE_RISK];

// --------------------------------------------------
// SAFE STOP TYPES
// --------------------------------------------------

export const SAFE_STOP_TYPE = {
  RELIEF_CAMP: "RELIEF_CAMP",
  HOSPITAL: "HOSPITAL",
  MEDICAL_CAMP: "MEDICAL_CAMP",
  FOOD_POINT: "FOOD_POINT",
  WATER_POINT: "WATER_POINT",
  FUEL: "FUEL",
  REST_AREA: "REST_AREA",
  PHARMACY: "PHARMACY",
} as const;

export type SafeStopType =
  (typeof SAFE_STOP_TYPE)[keyof typeof SAFE_STOP_TYPE];

// --------------------------------------------------
// PUNARMILAN MATCHING
// --------------------------------------------------

export const MATCH_WEIGHTS = {
  NAME: 30,
  AGE: 15,
  CLOTHING: 15,
  DISTINCTIVE_MARKS: 20,
  LOCATION: 10,
  GENDER: 5,
  OTHER: 5,
} as const;

export const MATCH_THRESHOLDS = {
  STRONG: 80,
  POSSIBLE: 60,
} as const;

export type MatchStrength =
  | "STRONG"
  | "POSSIBLE"
  | "LOW";

export function getMatchStrength(
  score: number
): MatchStrength {
  if (score >= MATCH_THRESHOLDS.STRONG) {
    return "STRONG";
  }

  if (score >= MATCH_THRESHOLDS.POSSIBLE) {
    return "POSSIBLE";
  }

  return "LOW";
}

// --------------------------------------------------
// OFFICIAL DATA SOURCES
// --------------------------------------------------

export const DATA_SOURCE = {
  SACHET: "NDMA SACHET",
  IMD: "India Meteorological Department",
  OPEN_STREET_MAP: "OpenStreetMap",
  BACKEND_CACHE: "Punarmilan Backend Cache",
  DEMO: "Demo Data",
} as const;

// --------------------------------------------------
// REFRESH INTERVALS
// --------------------------------------------------

/**
 * Important:
 *
 * The mobile app can refresh OUR backend every 3 seconds.
 * We should NOT hammer official government servers every
 * 3 seconds.
 *
 * The backend will cache official government data and use
 * appropriate refresh / ETag mechanisms.
 */
export const REFRESH_INTERVALS = {
  APP_ALERT_REFRESH_MS: 3000,

  LOCATION_REFRESH_MS: 3000,

  ROUTE_REFRESH_MS: 10000,

  BACKEND_ALERT_CACHE_MS: 60000,

  WEATHER_CACHE_MS: 300000,

  SOS_RETRY_MS: 5000,
} as const;

// --------------------------------------------------
// GPS QUALITY
// --------------------------------------------------

export const GPS_RULES = {
  /**
   * Excellent GPS accuracy.
   */
  EXCELLENT_ACCURACY_METERS: 10,

  /**
   * Acceptable accuracy for navigation.
   */
  ACCEPTABLE_ACCURACY_METERS: 50,

  /**
   * Above this, we should avoid treating the
   * coordinate as a precise location.
   */
  POOR_ACCURACY_METERS: 100,

  /**
   * Ignore obviously impossible jumps.
   */
  MAX_LOCATION_JUMP_KM: 5,
} as const;

// --------------------------------------------------
// OFFLINE QUEUE
// --------------------------------------------------

export const OFFLINE_QUEUE = {
  SOS_KEY: "@punarmilan/sos_queue",

  MEDICAL_CASE_KEY: "@punarmilan/medical_queue",

  BROADCAST_KEY: "@punarmilan/broadcast_queue",

  MAX_RETRY_COUNT: 10,
} as const;

// --------------------------------------------------
// TELEMEDICINE
// --------------------------------------------------

export const CONSULTATION_MODE = {
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  CHAT: "CHAT",
} as const;

export type ConsultationMode =
  (typeof CONSULTATION_MODE)[keyof typeof CONSULTATION_MODE];

export const MEDICAL_CASE_STATUS = {
  REQUESTED: "REQUESTED",
  WAITING_FOR_DOCTOR: "WAITING_FOR_DOCTOR",
  DOCTOR_ASSIGNED: "DOCTOR_ASSIGNED",
  IN_CONSULTATION: "IN_CONSULTATION",
  PRESCRIPTION_ISSUED: "PRESCRIPTION_ISSUED",
  REFERRED: "REFERRED",
  COMPLETED: "COMPLETED",
} as const;

// --------------------------------------------------
// SAFETY DISCLAIMERS
// --------------------------------------------------

export const SAFETY_MESSAGES = {
  TRIAGE:
    "This priority score supports rescue operations and is not a medical diagnosis.",

  TELEMEDICINE:
    "Punarmilan does not diagnose or prescribe using AI. Medical advice and prescriptions are provided only by verified doctors.",

  MATCHING:
    "Match scores indicate similarity only. Identity must be confirmed by authorised responders or family.",

  GOVERNMENT_DATA:
    "Government alerts are displayed from official sources when available. Cached data may be shown during connectivity interruptions.",

  ROUTE:
    "Route recommendations are advisory. Follow official evacuation instructions and local authorities.",
} as const;