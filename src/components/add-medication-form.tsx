'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Medication } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre del medicamento debe tener al menos 2 caracteres.'),
  description: z.string().optional(),
  dosageFrequencyHours: z.coerce
    .number()
    .min(1, 'La frecuencia debe ser de al menos 1 hora.'),
  durationDays: z.coerce.number().min(1, 'La duración debe ser de al menos 1 día.'),
  initialDoseDate: z.date({ required_error: 'Por favor, selecciona una fecha.' }),
  initialDoseTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora no válido (HH:MM).'),
});

type FormValues = z.infer<typeof formSchema>;

type AddMedicationFormProps = {
  setOpen: (open: boolean) => void;
  onAddMedication: (values: FormValues) => void;
};

export function AddMedicationForm({
  setOpen,
  onAddMedication,
}: AddMedicationFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      dosageFrequencyHours: 8,
      durationDays: 7,
      initialDoseTime: "08:00",
    },
  });

  function onSubmit(values: FormValues) {
    onAddMedication(values);
    toast({
      title: '¡Éxito!',
      description: `El medicamento "${values.name}" ha sido añadido.`,
      variant: 'default',
      className: 'bg-accent text-accent-foreground',
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Medicamento</FormLabel>
              <FormControl>
                <Input placeholder="ej., Amoxicilina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ej., Tomar con comida. Para infección bacteriana."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dosageFrequencyHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frecuencia (horas)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ej., 8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (días)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="ej., 7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="initialDoseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Input
                  type="date"
                  value={
                    field.value ? field.value.toISOString().split('T')[0] : ''
                  }
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initialDoseTime"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Hora de Inicio</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Añadir Medicamento
        </Button>
      </form>
    </Form>
  );
}
