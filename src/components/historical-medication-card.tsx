"use client";

import type { HistoricalMedication } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArchiveRestore, CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Doses } from "./icons";

export function HistoricalMedicationCard({ medication }: { medication: HistoricalMedication }) {

  return (
    <Card className="bg-card/70 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
            <ArchiveRestore className="h-6 w-6 text-muted-foreground" />
            <div>
                <CardTitle className="font-headline">{medication.name}</CardTitle>
                {medication.description && (
                <CardDescription className="mt-1">
                    {medication.description}
                </CardDescription>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <Doses className="h-4 w-4" />
            <span>{medication.totalDoses} dosis</span>
        </div>
         <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Cada {medication.dosageFrequencyHours} horas</span>
        </div>
        <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(medication.startDate), "d MMM, yyyy", { locale: es })} - {format(new Date(medication.endDate), "d MMM, yyyy", { locale: es })}</span>
        </div>
         <div className="flex items-center gap-2 pt-2 text-xs">
            Completado el {format(new Date(medication.completedAt), "d MMM, yyyy 'a las' h:mm aa", { locale: es })}
        </div>
      </CardContent>
    </Card>
  );
}
