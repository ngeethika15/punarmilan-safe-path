import React, { createContext, useContext, useState } from 'react';

export interface Survivor {
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

export interface SOSRequest {
  id: string;
  location: string;
  needs: string[];
  urgency: 'HIGH' | 'CRITICAL' | 'MODERATE';
  timestamp: string;
  coords?: [number, number];
}

interface DisasterContextType {
  survivors: Survivor[];
  addSurvivor: (survivor: Survivor) => void;
  sosRequests: SOSRequest[];
  addSOSRequest: (sos: SOSRequest) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export function DisasterProvider({ children }: { children: React.ReactNode }) {
  const [survivors, setSurvivors] = useState<Survivor[]>([
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
  ]);

  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([
    {
      id: 'SOS-901',
      location: 'Sector 4 Flood Plain',
      needs: ['Boat Rescue', 'Medical/Insulin'],
      urgency: 'CRITICAL',
      timestamp: '2 mins ago via Mesh',
      coords: [12.971, 77.594],
    },
  ]);

  const addSurvivor = (survivor: Survivor) => {
    setSurvivors((prev) => [survivor, ...prev]);
  };

  const addSOSRequest = (sos: SOSRequest) => {
    setSosRequests((prev) => [sos, ...prev]);
  };

  return (
    <DisasterContext.Provider value={{ survivors, addSurvivor, sosRequests, addSOSRequest }}>
      {children}
    </DisasterContext.Provider>
  );
}

export function useDisaster() {
  const context = useContext(DisasterContext);
  if (!context) throw new Error('useDisaster must be used within a DisasterProvider');
  return context;
}