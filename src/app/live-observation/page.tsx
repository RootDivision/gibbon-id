"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const newFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.date({ message: "Start date is required" }),
  description: z.string().optional(),
  locationName: z.string().min(1, "Location is required"),
  locationType: z.string().min(1, "Location type is required"),
});

const existingFormSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
});

type NewFormValues = z.infer<typeof newFormSchema>;
type ExistingFormValues = z.infer<typeof existingFormSchema>;

export default function LiveObservation() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isExistingOpen, setIsExistingOpen] = useState(false);
  const router = useRouter();

  const addResearch = api.research.addResearch.useMutation();
  const { data: projects } = api.research.getResearches.useQuery({
    sortField: "title",
    sortDir: "asc",
  });

  const newForm = useForm<NewFormValues>({
    resolver: zodResolver(newFormSchema),
    defaultValues: {
      title: "",
      startDate: undefined,
      description: "",
      locationName: "",
      locationType: "",
    },
  });

  const existingForm = useForm<ExistingFormValues>({
    resolver: zodResolver(existingFormSchema),
    defaultValues: { projectId: "" },
  });

  function onNewSubmit(values: NewFormValues) {
    addResearch.mutate(
      {
        title: values.title,
        startDate: values.startDate.toISOString(),
        description: values.description,
        locationName: values.locationName,
        locationType: values.locationType,
      },
      {
        onSuccess: (project) => {
          setIsNewOpen(false);
          newForm.reset();
          router.push(`/research/${project.id}`);
        },
        onError: () => toast.error("Failed to create research project."),
      },
    );
  }

  function onExistingSubmit(values: ExistingFormValues) {
    setIsExistingOpen(false);
    existingForm.reset();
    router.push(`/research/${values.projectId}`);
  }

  return (
    <main className="flex flex-col gap-4">
      <h1>Live Observation</h1>
      <section className="flex gap-4">
        <Button onClick={() => setIsNewOpen(true)}>New research project</Button>
        <Button onClick={() => setIsExistingOpen(true)}>
          Existing research project
        </Button>
      </section>

      {/* New research project dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Research Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new research project.
            </DialogDescription>
          </DialogHeader>
          <Form {...newForm}>
            <form
              onSubmit={newForm.handleSubmit(onNewSubmit)}
              className="space-y-4"
            >
              <FormField
                control={newForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Research project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newForm.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Danum Valley" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newForm.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Forest, Savanna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addResearch.isPending}>
                  {addResearch.isPending ? "Creating…" : "Create project"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Existing research project dialog */}
      <Dialog open={isExistingOpen} onOpenChange={setIsExistingOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Continue Research Project</DialogTitle>
            <DialogDescription>
              Select an existing project to open.
            </DialogDescription>
          </DialogHeader>
          <Form {...existingForm}>
            <form
              onSubmit={existingForm.handleSubmit(onExistingSubmit)}
              className="space-y-4"
            >
              <FormField
                control={existingForm.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Project</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExistingOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Open project</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
