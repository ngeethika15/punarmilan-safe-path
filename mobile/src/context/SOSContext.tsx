// mobile/src/context/SOSContext.tsx

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";

import {
  CONNECTIVITY_STATUS,
  INJURY_SEVERITY,
  OFFLINE_QUEUE,
  SOS_STATUS,
  type ConnectivityStatus,
  type InjurySeverity,
  type SOSStatus,
} from "../constants/safety";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:5000";

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface SafeRoutePoint {
  latitude: number;
  longitude: number;
}

export interface SafeRoute {
  points: SafeRoutePoint[];
  distanceMeters?: number;
  durationSeconds?: number;
  startedAt?: string;
  destination?: string;
}

export interface SOSPayload {
  id: string;

  timestamp: string;

  currentLocation: Coordinates | null;

  lastKnownSafeLocation: Coordinates | null;

  lastSafeRoute: SafeRoute | null;

  connectivity: ConnectivityStatus;

  injurySeverity: InjurySeverity;

  mentalHealthFlag: boolean;

  status: SOSStatus;

  nearestCampId?: string;

  emergencyContacts?: string[];

  retryCount: number;
}

interface TriggerSOSOptions {
  injurySeverity?: InjurySeverity;
  mentalHealthFlag?: boolean;
  nearestCampId?: string;
  emergencyContacts?: string[];
  lastSafeRoute?: SafeRoute | null;
}

interface SOSContextValue {
  currentLocation: Coordinates | null;

  lastKnownSafeLocation: Coordinates | null;

  lastSafeRoute: SafeRoute | null;

  connectivity: ConnectivityStatus;

  activeSOS: SOSPayload | null;

  queuedSOS: SOSPayload[];

  isSending: boolean;

  locationPermissionGranted: boolean;

  refreshLocation: () => Promise<Coordinates | null>;

  setLastSafeRoute: (route: SafeRoute | null) => void;

  triggerSOS: (
    options?: TriggerSOSOptions
  ) => Promise<SOSPayload>;

  retryQueuedSOS: () => Promise<void>;

  cancelSOS: () => Promise<void>;

  clearResolvedSOS: () => Promise<void>;
}

const SOSContext =
  createContext<SOSContextValue | undefined>(
    undefined
  );

const STORAGE_KEY = OFFLINE_QUEUE.SOS_KEY;

function generateSOSId(): string {
  return `SOS-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

function mapConnectivity(
  isConnected: boolean | null,
  isInternetReachable: boolean | null
): ConnectivityStatus {
  if (isConnected === false) {
    return CONNECTIVITY_STATUS.OFFLINE;
  }

  if (isInternetReachable === false) {
    return CONNECTIVITY_STATUS.LIMITED;
  }

  return CONNECTIVITY_STATUS.ONLINE;
}

export function SOSProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentLocation, setCurrentLocation] =
    useState<Coordinates | null>(null);

  const [lastKnownSafeLocation, setLastKnownSafeLocation] =
    useState<Coordinates | null>(null);

  const [lastSafeRoute, setLastSafeRouteState] =
    useState<SafeRoute | null>(null);

  const [connectivity, setConnectivity] =
    useState<ConnectivityStatus>(
      CONNECTIVITY_STATUS.OFFLINE
    );

  const [activeSOS, setActiveSOS] =
    useState<SOSPayload | null>(null);

  const [queuedSOS, setQueuedSOS] =
    useState<SOSPayload[]>([]);

  const [isSending, setIsSending] =
    useState(false);

  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  // --------------------------------------------------
  // LOAD OFFLINE SOS QUEUE
  // --------------------------------------------------

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setQueuedSOS(parsed);
        }
      } catch (error) {
        console.error(
          "Unable to load SOS queue:",
          error
        );
      }
    };

    loadQueue();
  }, []);

  // --------------------------------------------------
  // SAVE OFFLINE SOS QUEUE
  // --------------------------------------------------

  useEffect(() => {
    const saveQueue = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(queuedSOS)
        );
      } catch (error) {
        console.error(
          "Unable to save SOS queue:",
          error
        );
      }
    };

    saveQueue();
  }, [queuedSOS]);

  // --------------------------------------------------
  // CONNECTIVITY MONITOR
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe =
      NetInfo.addEventListener((state) => {
        const status = mapConnectivity(
          state.isConnected,
          state.isInternetReachable
        );

        setConnectivity(status);
      });

    return unsubscribe;
  }, []);

  // --------------------------------------------------
  // GET GPS PERMISSION
  // --------------------------------------------------

  const requestLocationPermission =
    useCallback(async (): Promise<boolean> => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        const granted = status === "granted";

        setLocationPermissionGranted(granted);

        return granted;
      } catch (error) {
        console.error(
          "Location permission error:",
          error
        );

        return false;
      }
    }, []);

  // --------------------------------------------------
  // GET CURRENT LOCATION
  // --------------------------------------------------

  const refreshLocation =
    useCallback(async (): Promise<Coordinates | null> => {
      try {
        let granted =
          locationPermissionGranted;

        if (!granted) {
          granted =
            await requestLocationPermission();
        }

        if (!granted) {
          return null;
        }

        const location =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Highest,
          });

        const coordinates: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy:
            location.coords.accuracy,
        };

        setCurrentLocation(coordinates);

        /*
         * We only update the "last known safe location"
         * when GPS is reasonably accurate.
         */
        if (
          location.coords.accuracy == null ||
          location.coords.accuracy <= 100
        ) {
          setLastKnownSafeLocation(
            coordinates
          );
        }

        return coordinates;
      } catch (error) {
        console.error(
          "Unable to get current location:",
          error
        );

        return currentLocation;
      }
    }, [
      currentLocation,
      locationPermissionGranted,
      requestLocationPermission,
    ]);

  // --------------------------------------------------
  // SET LAST SAFE ROUTE
  // --------------------------------------------------

  const setLastSafeRoute = useCallback(
    (route: SafeRoute | null) => {
      setLastSafeRouteState(route);
    },
    []
  );

  // --------------------------------------------------
  // SEND SOS TO BACKEND
  // --------------------------------------------------

  const sendSOSToBackend =
    useCallback(
      async (
        payload: SOSPayload
      ): Promise<boolean> => {
        try {
          const response =
            await fetch(
              `${BACKEND_URL}/api/sos`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify(
                  payload
                ),
              }
            );

          if (!response.ok) {
            throw new Error(
              `SOS request failed: ${response.status}`
            );
          }

          return true;
        } catch (error) {
          console.error(
            "SOS backend request failed:",
            error
          );

          return false;
        }
      },
      []
    );

  // --------------------------------------------------
  // QUEUE SOS LOCALLY
  // --------------------------------------------------

  const queueSOS =
    useCallback(
      (payload: SOSPayload) => {
        setQueuedSOS((previous) => {
          const alreadyExists =
            previous.some(
              (item) =>
                item.id === payload.id
            );

          if (alreadyExists) {
            return previous;
          }

          return [
            ...previous,
            payload,
          ];
        });
      },
      []
    );

  // --------------------------------------------------
  // TRIGGER SOS
  // --------------------------------------------------

  const triggerSOS = useCallback(
    async (
      options: TriggerSOSOptions = {}
    ): Promise<SOSPayload> => {
      setIsSending(true);

      try {
        /*
         * Always attempt a fresh GPS fix
         * before creating the emergency event.
         */
        const freshLocation =
          await refreshLocation();

        const location =
          freshLocation ||
          currentLocation ||
          lastKnownSafeLocation;

        const payload: SOSPayload = {
          id: generateSOSId(),

          timestamp:
            new Date().toISOString(),

          currentLocation:
            location,

          lastKnownSafeLocation:
            lastKnownSafeLocation ||
            location,

          lastSafeRoute:
            options.lastSafeRoute ??
            lastSafeRoute,

          connectivity,

          injurySeverity:
            options.injurySeverity ??
            INJURY_SEVERITY.NONE,

          mentalHealthFlag:
            options.mentalHealthFlag ??
            false,

          status:
            SOS_STATUS.QUEUED,

          nearestCampId:
            options.nearestCampId,

          emergencyContacts:
            options.emergencyContacts,

          retryCount: 0,
        };

        /*
         * Store locally BEFORE trying the network.
         *
         * This is important during disasters because
         * the internet may disappear immediately after
         * the user presses SOS.
         */
        queueSOS(payload);

        setActiveSOS(payload);

        /*
         * Try sending immediately if online.
         */
        if (
          connectivity ===
          CONNECTIVITY_STATUS.ONLINE
        ) {
          const sent =
            await sendSOSToBackend(
              payload
            );

          if (sent) {
            const sentPayload: SOSPayload =
              {
                ...payload,
                status:
                  SOS_STATUS.SENT,
              };

            setActiveSOS(
              sentPayload
            );

            setQueuedSOS(
              (previous) =>
                previous.filter(
                  (item) =>
                    item.id !==
                    payload.id
                )
            );

            return sentPayload;
          }
        }

        /*
         * If offline or network request fails,
         * the payload remains safely queued.
         */
        return payload;
      } finally {
        setIsSending(false);
      }
    },
    [
      connectivity,
      currentLocation,
      lastKnownSafeLocation,
      lastSafeRoute,
      queueSOS,
      refreshLocation,
      sendSOSToBackend,
    ]
  );

  // --------------------------------------------------
  // RETRY QUEUED SOS
  // --------------------------------------------------

  const retryQueuedSOS =
    useCallback(async () => {
      if (
        connectivity !==
        CONNECTIVITY_STATUS.ONLINE
      ) {
        return;
      }

      if (queuedSOS.length === 0) {
        return;
      }

      setIsSending(true);

      try {
        const remaining: SOSPayload[] =
          [];

        for (const item of queuedSOS) {
          if (
            item.retryCount >=
            OFFLINE_QUEUE.MAX_RETRY_COUNT
          ) {
            remaining.push(item);
            continue;
          }

          const sent =
            await sendSOSToBackend(
              item
            );

          if (sent) {
            const sentItem: SOSPayload =
              {
                ...item,
                status:
                  SOS_STATUS.SENT,
              };

            if (
              activeSOS?.id === item.id
            ) {
              setActiveSOS(
                sentItem
              );
            }
          } else {
            remaining.push({
              ...item,
              retryCount:
                item.retryCount + 1,
            });
          }
        }

        setQueuedSOS(remaining);
      } finally {
        setIsSending(false);
      }
    }, [
      activeSOS?.id,
      connectivity,
      queuedSOS,
      sendSOSToBackend,
    ]);

  // --------------------------------------------------
  // AUTOMATIC RETRY WHEN INTERNET RETURNS
  // --------------------------------------------------

  useEffect(() => {
    if (
      connectivity ===
      CONNECTIVITY_STATUS.ONLINE
    ) {
      retryQueuedSOS();
    }
  }, [
    connectivity,
    retryQueuedSOS,
  ]);

  // --------------------------------------------------
  // CANCEL SOS
  // --------------------------------------------------

  const cancelSOS =
    useCallback(async () => {
      if (!activeSOS) {
        return;
      }

      const cancelled: SOSPayload =
        {
          ...activeSOS,
          status:
            SOS_STATUS.CANCELLED,
        };

      setActiveSOS(cancelled);

      setQueuedSOS(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              activeSOS.id
          )
      );

      /*
       * If the SOS has already reached the backend,
       * send the cancellation status.
       */
      if (
        connectivity ===
        CONNECTIVITY_STATUS.ONLINE
      ) {
        try {
          await fetch(
            `${BACKEND_URL}/api/sos/${activeSOS.id}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status:
                  SOS_STATUS.CANCELLED,
              }),
            }
          );
        } catch (error) {
          console.error(
            "Unable to cancel SOS on backend:",
            error
          );
        }
      }
    }, [
      activeSOS,
      connectivity,
    ]);

  // --------------------------------------------------
  // CLEAR RESOLVED SOS
  // --------------------------------------------------

  const clearResolvedSOS =
    useCallback(async () => {
      setActiveSOS(null);
    }, []);

  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------

  const value = useMemo<SOSContextValue>(
    () => ({
      currentLocation,

      lastKnownSafeLocation,

      lastSafeRoute,

      connectivity,

      activeSOS,

      queuedSOS,

      isSending,

      locationPermissionGranted,

      refreshLocation,

      setLastSafeRoute,

      triggerSOS,

      retryQueuedSOS,

      cancelSOS,

      clearResolvedSOS,
    }),
    [
      currentLocation,
      lastKnownSafeLocation,
      lastSafeRoute,
      connectivity,
      activeSOS,
      queuedSOS,
      isSending,
      locationPermissionGranted,
      refreshLocation,
      setLastSafeRoute,
      triggerSOS,
      retryQueuedSOS,
      cancelSOS,
      clearResolvedSOS,
    ]
  );

  return (
    <SOSContext.Provider value={value}>
      {children}
    </SOSContext.Provider>
  );
}

// --------------------------------------------------
// HOOK
// --------------------------------------------------

export function useSOS(): SOSContextValue {
  const context =
    useContext(SOSContext);

  if (!context) {
    throw new Error(
      "useSOS must be used inside SOSProvider"
    );
  }

  return context;
}