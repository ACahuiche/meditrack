import { AppLogo } from "@/components/icons";
import { AddMedicationDialog } from "./add-medication-dialog";
import type { Medication } from "@/lib/types";

type HeaderProps = {
    onAddMedication: (values: Omit<Medication, 'id' | 'doses' | 'createdAt' | 'initialDoseTimestamp'> & { initialDoseDate: Date; initialDoseTime: string }) => void;
};


export function Header({ onAddMedication }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <AppLogo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
          MediTrack Rx
        </h1>
      </div>
      <div className="ml-auto">
        <AddMedicationDialog onAddMedication={onAddMedication} />
      </div>
    </header>
  );
}
