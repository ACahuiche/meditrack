export type Dose = {
  id: string;
  time: string; // ISO string
  taken: boolean;
};

export type Medication = {
  id: string;
  name: string;
  description: string;
  dosageFrequencyHours: number;
  durationDays: number;
  initialDoseTimestamp: string; // ISO string
  createdAt: string; // ISO string
  doses: Dose[];
};
