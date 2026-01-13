
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { AddMedicationForm } from "./add-medication-form";
import type { Medication } from "@/lib/types";

type AddMedicationDialogProps = {
  onAddMedication: (values: Omit<Medication, 'id' | 'doses' | 'createdAt' | 'initialDoseTimestamp' | 'userId'> & { initialDoseDate: Date; initialDoseTime: string }) => void;
};


export function AddMedicationDialog({ onAddMedication }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Añadir Medicamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Medicamento</DialogTitle>
          <DialogDescription>
            Rellena los detalles a continuación para añadir un nuevo medicamento a tu horario.
          </DialogDescription>
        </DialogHeader>
        <AddMedicationForm setOpen={setOpen} onAddMedication={onAddMedication} />
      </DialogContent>
    </Dialog>
  );
}
