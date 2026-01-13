"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import {
  addMedication,
  generateDescriptionForMedication,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Medication name must be at least 2 characters."),
  description: z.string().optional(),
  dosageFrequencyHours: z.coerce
    .number()
    .min(1, "Frequency must be at least 1 hour."),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day."),
  initialDoseDate: z.date({ required_error: "Please select a date." }),
  initialDoseTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)."),
});

export function AddMedicationForm({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      dosageFrequencyHours: 8,
      durationDays: 7,
      initialDoseTime: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await addMedication(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Medication "${values.name}" has been added.`,
          variant: "default",
          className: "bg-accent text-accent-foreground",
        });
        setOpen(false);
      }
    });
  }

  async function handleGenerateDescription() {
    const values = form.getValues();
    if (!values.name || !values.dosageFrequencyHours || !values.durationDays || !values.initialDoseTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in Name, Frequency, Duration, and Start Time before generating a description.",
        variant: "destructive",
      });
      return;
    }

    startGeneratingTransition(async () => {
       try {
        const { description } = await generateDescriptionForMedication({
          medicationName: values.name,
          dosageFrequencyHours: values.dosageFrequencyHours,
          durationDays: values.durationDays,
          initialDoseTime: values.initialDoseTime,
        });
        if (description) {
            form.setValue("description", description);
        }
      } catch (e) {
         toast({ title: "AI Error", description: "Failed to generate description.", variant: "destructive" });
      }
    });
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
              <FormLabel className="flex items-center justify-between">
                <span>Description (Optional)</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-2">Generate with AI</span>
                </Button>
              </FormLabel>
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
                    <Input type="date"
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Medication
        </Button>
      </form>
    </Form>
  );
}
