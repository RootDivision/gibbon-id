"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { CalendarIcon, Eye, PlusCircle, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date({ message: "Start date is required" }),
  locationName: z.string().min(1, "Location name is required"),
  locationType: z.string().min(1, "Location type is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResearchPage() {
  const [isOpen, setIsOpen] = useState(false);

  const { data, refetch } = api.research.getResearches.useQuery();
  const router = useRouter();

  const addResearch = api.research.addResearch.useMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      locationName: "",
      locationType: "",
    },
  });

  function onSubmit(values: FormValues) {
    addResearch.mutate(
      { ...values, startDate: values.startDate.toISOString() },
      {
        onSuccess: () => {
          void refetch();
          form.reset();
          setIsOpen(false);
          toast.success("Research project added.");
        },
        onError: () => toast.error("Failed to add research project."),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1>My Research Projects</h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle />
              New research project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Research Project</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new research project.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Research project title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
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
      </div>
      <p className="text-muted-foreground text-sm">
        All research projects are listed below. Click a project title to view
        its sessions, logs, and details.
      </p>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Location Type</TableHead>
            <TableHead className="min-w-32">Start Date</TableHead>
            <TableHead className="min-w-32">End Date</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((research) => (
            <TableRow key={research.id}>
              <TableCell>{research.id}</TableCell>
              <TableCell>
                <Link href={`/research/${research.id}`}>{research.title}</Link>
              </TableCell>
              <TableCell>{research.description ?? "—"}</TableCell>
              <TableCell>
                {research.locations.map((l) => l.name).join(", ") || "—"}
              </TableCell>
              <TableCell>
                {research.locations.map((l) => l.type).join(", ") || "—"}
              </TableCell>
              <TableCell>{research.startDate.toLocaleDateString()}</TableCell>
              <TableCell>
                {research.endDate ? research.endDate.toLocaleDateString() : "—"}
              </TableCell>
              <TableCell>{research.createdAt.toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  onClick={() => router.push(`/research/${research.id}`)}
                  variant="ghost"
                  size="icon"
                >
                  <Eye />
                </Button>
                <Button variant="ghost" className="text-red-500" size="icon">
                  <Trash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
