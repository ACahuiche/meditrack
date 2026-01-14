"use client";

import type { Dose, Medication } from "@/lib/types";
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
import { Pill, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

function NextDose({
  medication,
  onUpdateDose,
}: {
  medication: Medication;
  onUpdateDose: (medicationId: string, doseId: string, taken: boolean) => void;
}) {
  const nextDose = medication.doses.find((dose) => !dose.taken);

  if (!nextDose) {
    return (
      <div className="text-sm text-center text-muted-foreground p-4">
        ¡Todas las dosis han sido tomadas!
      </div>
    );
  }

  const handleCheckedChange = (checked: boolean) => {
    onUpdateDose(medication.id, nextDose.id, !!checked);
  };

  const doseTime = parseISO(nextDose.time);

  return (
    <div className="p-4 border rounded-lg bg-background">
      <p className="text-sm font-medium text-muted-foreground mb-2">Próxima Dosis</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold capitalize">
              {format(doseTime, "eeee, d 'de' MMMM", { locale: es })}
            </span>
            <span className="text-lg font-mono">{format(doseTime, "h:mm aa")}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <Checkbox
              id={`next-dose-${nextDose.id}`}
              onCheckedChange={handleCheckedChange}
              className="h-6 w-6 rounded-full"
            />
           <Label htmlFor={`next-dose-${nextDose.id}`} className="text-sm font-medium">Marcar como tomada</Label>
        </div>
      </div>
    </div>
  );
}


export function MedicationCard({ medication, onUpdateDose }: { medication: Medication, onUpdateDose: (medicationId: string, doseId: string, taken: boolean) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Pill className="h-6 w-6 text-primary" />
            <div>
                <CardTitle as="h3" className="font-headline">{medication.name}</CardTitle>
                {medication.description && (
                <CardDescription className="mt-1">
                    {medication.description}
                </CardDescription>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <NextDose medication={medication} onUpdateDose={onUpdateDose} />
        <Accordion type="single" collapsible>
          <AccordionItem value="schedule">
            <AccordionTrigger className="text-base font-semibold">
              Ver Horario Completo
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
