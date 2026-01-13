'use client';

import { useOptimistic, useTransition } from 'react';
import type { Dose, Medication } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { CircleCheck, CircleDashed } from 'lucide-react';

type GroupedDoses = { [key: string]: Dose[] };

function DoseCheckbox({ medicationId, dose, onDoseChange }: { medicationId: string, dose: Dose, onDoseChange: (medicationId: string, doseId: string, taken: boolean) => void }) {
    
    const handleCheckedChange = (checked: boolean) => {
        const newTakenState = !!checked;
        onDoseChange(medicationId, dose.id, newTakenState);
    };

    return (
        <Checkbox
            id={dose.id}
            checked={dose.taken}
            onCheckedChange={handleCheckedChange}
            className="h-5 w-5 rounded-full"
        />
    );
}

export function DosageSchedule({ medication, onUpdateDose }: { medication: Medication, onUpdateDose: (medicationId: string, doseId: string, taken: boolean) => void }) {
    const [isPending, startTransition] = useTransition();
    const [optimisticDoses, setOptimisticDoses] = useOptimistic<Dose[], { doseId: string; taken: boolean }>(
        medication.doses,
        (state, { doseId, taken }) =>
            state.map((d) => (d.id === doseId ? { ...d, taken } : d))
    );

    const handleDoseChange = (medicationId: string, doseId: string, taken: boolean) => {
        startTransition(() => {
            setOptimisticDoses({ doseId, taken });
            onUpdateDose(medicationId, doseId, taken);
        });
    };

    const groupedDoses = optimisticDoses.reduce<GroupedDoses>((acc, dose) => {
        // Parse the ISO string to a Date object before formatting
        const doseDate = parseISO(dose.time);
        const dateKey = format(doseDate, "yyyy-MM-dd");
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(dose);
        return acc;
    }, {});

    const sortedDays = Object.keys(groupedDoses).sort();

    return (
        <div className="space-y-4">
            {sortedDays.map((dateKey) => {
                const dosesForDay = groupedDoses[dateKey];
                const allTaken = dosesForDay.every(d => d.taken);
                
                // When creating the Date for formatting, add timezone info to avoid UTC conversion
                const displayDate = new Date(`${dateKey}T00:00:00`);

                return (
                    <Card key={dateKey} className={cn(allTaken && "bg-accent/50 border-accent")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                            <CardTitle className="text-base font-medium capitalize">
                                {format(displayDate, "eeee, d 'de' MMMM", { locale: es })}
                            </CardTitle>
                            {allTaken ? (
                                <Badge variant="outline" className="bg-accent text-accent-foreground border-accent-foreground/50">
                                    <CircleCheck className="mr-1 h-3 w-3" />
                                    Completado
                                </Badge>
                            ) : (
                                <Badge variant="secondary">
                                    <CircleDashed className="mr-1 h-3 w-3" />
                                    En Progreso
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="space-y-2">
                                {dosesForDay.map((dose) => {
                                    // Parse ISO string to ensure correct time is formatted
                                    const doseTime = parseISO(dose.time);
                                    return (
                                        <div
                                            key={dose.id}
                                            className={cn(
                                                "flex items-center space-x-3 rounded-md p-2 transition-colors",
                                                dose.taken && "bg-accent text-accent-foreground"
                                            )}
                                        >
                                            <DoseCheckbox
                                                medicationId={medication.id}
                                                dose={dose}
                                                onDoseChange={handleDoseChange}
                                            />
                                            <Label
                                                htmlFor={dose.id}
                                                className={cn("text-lg font-mono", dose.taken && "line-through opacity-70")}
                                            >
                                                {format(doseTime, "h:mm aa")}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
