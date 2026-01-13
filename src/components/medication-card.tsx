"use client";

import type { Medication } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DosageSchedule } from "./dosage-schedule";
import { Pill } from "lucide-react";

export function MedicationCard({ medication, onUpdateDose }: { medication: Medication, onUpdateDose: (medicationId: string, doseId: string, taken: boolean) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Pill className="h-6 w-6 text-primary" />
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
      <CardContent>
        <Accordion type="single" collapsible defaultValue="schedule">
          <AccordionItem value="schedule">
            <AccordionTrigger className="text-base font-semibold">
              Horario de Dosis
            </AccordionTrigger>
            <AccordionContent>
              <DosageSchedule medication={medication} onUpdateDose={onUpdateDose} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
