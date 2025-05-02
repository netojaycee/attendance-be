"use client";

import { useForm } from "react-hook-form";
import { PracticeSession } from "../../../prisma/src/generated/prisma";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DialogFooter } from "../ui/dialog";
import { Loader2, CalendarIcon } from "lucide-react";
import { z } from "zod";
import {
  useCreatePracticeSessionMutation,
  useUpdatePracticeSessionMutation,
} from "@/app/redux/api";
import { format, parse, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const practiceSessionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  type: z.enum(["SINGLE", "DOUBLE"], {
    required_error: "Type is required",
  }),
});

type PracticeSessionFormData = z.infer<typeof practiceSessionSchema>;

interface PracticeSessionFormProps {
  session?: PracticeSession;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PracticeSessionForm({
  session,
  onSuccess,
  onCancel,
}: PracticeSessionFormProps) {
  const isEditMode = !!session;
  const [
    addPracticeSession,
    {
      isLoading: isLoadingAdd,
      isSuccess: isSuccessAdd,
      isError: isErrorAdd,
      error: errorAdd,
    },
  ] = useCreatePracticeSessionMutation();
  const [
    updatePracticeSession,
    {
      isLoading: isLoadingUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdatePracticeSessionMutation();

  const isLoading = isEditMode ? isLoadingUpdate : isLoadingAdd;
  const isSuccess = isEditMode ? isSuccessUpdate : isSuccessAdd;
  const isError = isEditMode ? isErrorUpdate : isErrorAdd;
  const error = isEditMode ? errorUpdate : errorAdd;

  const form = useForm<PracticeSessionFormData>({
    resolver: zodResolver(practiceSessionSchema),
    defaultValues: {
      date: session ? format(session.date, "yyyy-MM-dd") : "",
      startTime: session ? format(new Date(session.startTime), "HH:mm") : "",
      type: session ? session.type : "SINGLE",
    },
  });

  const onSubmit = async (values: PracticeSessionFormData) => {
    try {
      // Convert date to ISO 8601 datetime (e.g., "2025-10-10" -> "2025-10-10T00:00:00.000Z")
      const dateTime = parse(values.date, "yyyy-MM-dd", new Date());
      const isoDate = dateTime.toISOString();

      // Parse startTime and calculate endTime
      const startDateTime = parse(
        `${values.date} ${values.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const duration = values.type === "SINGLE" ? 2 : 4;
      const endDateTime = addHours(startDateTime, duration);

      const payload = {
        date: isoDate, // Send ISO 8601 datetime
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: values.type,
      };

      if (isEditMode) {
        await updatePracticeSession({ id: session.id, data: payload }).unwrap();
      } else {
        await addPracticeSession(payload).unwrap();
      }
    } catch (error) {
      console.error(
        `${isEditMode ? "Update" : "Add"} practice session error:`,
        error
      );
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        isEditMode
          ? "Practice session updated successfully"
          : "Practice session created successfully",
        { style: { background: "#2dd4bf", color: "#1a3c34" } }
      );
      form.reset();
      if (onSuccess) onSuccess();
    } else if (isError) {
      if (error && "data" in error && typeof error.data === "object") {
        const errorMessage = (error.data as { error?: string })?.error;
        toast.error(errorMessage || "An error occurred", {
          style: { background: "#f87171", color: "#1a3c34" },
        });
      }
    }
  }, [isSuccess, isError, error, form, onSuccess, isEditMode]);

  // Define specific time options (10:00, 12:00, 14:00, 16:00, 18:00, 20:00)
  const timeOptions = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700'>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full">
                    <Button
                      variant='outline'
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString().split("T")[0]);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='startTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700'>Start Time</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className='border-gray-300 focus:border-teal-500 focus:ring-teal-500'>
                    <SelectValue placeholder='Select start time' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel className='text-gray-700'>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className='border-gray-300 focus:border-teal-500 focus:ring-teal-500'>
                    <SelectValue placeholder='Select a type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='SINGLE'>Single</SelectItem>
                  <SelectItem value='DOUBLE'>Double</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            className='bg-teal-500 hover:bg-teal-600'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please wait
              </>
            ) : isEditMode ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
