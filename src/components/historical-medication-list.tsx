"use client";

import type { HistoricalMedication } from "@/lib/types";
import { History } from "lucide-react";
import { HistoricalMedicationCard } from "./historical-medication-card";

export function HistoricalMedicationList({ medications }: { medications: HistoricalMedication[]}) {
  if (medications.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-center">
            <History className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">
            No completed medications
          </h3>
          <p className="text-sm text-muted-foreground">
            Your medication history will appear here once you complete a course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {medications.map((med) => (
        <HistoricalMedicationCard key={med.id} medication={med} />
      ))}
    </div>
  );
}
