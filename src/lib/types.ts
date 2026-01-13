
export type Dose = {
  id: string;
  time: string; // ISO string
  taken: boolean;
};

export type Medication = {
  id: string;
  userId: string;
  name: string;
  description: string;
  dosageFrequencyHours: number;
  durationDays: number;
  initialDoseTimestamp: string; // ISO string
  createdAt: string; // ISO string
  doses: Dose[];
};

export type HistoricalMedication = {
    id: string;
    userId: string;
    name: string;
    description: string;
    dosageFrequencyHours: number;
    totalDoses: number;
    startDate: string; // ISO String
    endDate: string; // ISO String
    completedAt: string; // ISO String
};
