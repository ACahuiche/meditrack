"use client";

import type { Medication } from "@/lib/types";
import { MedicationCard } from "./medication-card";
import { Pill } from "lucide-react";

export function MedicationList({ medications, onUpdateDose }: { medications: Medication[], onUpdateDose: (medicationId: string, doseId: string, taken: boolean) => void }) {
  if (medications.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
            <Pill className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">
            No medications found
          </h3>
          <p className="text-sm text-muted-foreground">
            Click "Add Medication" to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {medications.map((med) => (
        <MedicationCard key={med.id} medication={med} onUpdateDose={onUpdateDose} />
      ))}
    </div>
  );
}
