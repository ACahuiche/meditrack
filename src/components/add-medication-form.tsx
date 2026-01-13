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
  name: z.string().min(2, 'Medication name must be at least 2 characters.'),
  description: z.string().optional(),
  dosageFrequencyHours: z.coerce
    .number()
    .min(1, 'Frequency must be at least 1 hour.'),
  durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day.'),
  initialDoseDate: z.date({ required_error: 'Please select a date.' }),
  initialDoseTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
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
      title: 'Success!',
      description: `Medication "${values.name}" has been added.`,
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
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Amoxicillin" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Take with food. For bacterial infection."
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
                <FormLabel>Frequency (hours)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 8" {...field} />
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
                <FormLabel>Duration (days)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 7" {...field} />
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
                <FormLabel>Start Date</FormLabel>
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
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Add Medication
        </Button>
      </form>
    </Form>
  );
}
