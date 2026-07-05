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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarIcon,
  Pencil,
  PlusCircle,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
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

const editFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional(),
  locationName: z.string().min(1, "Location name is required"),
  locationType: z.string().min(1, "Location type is required"),
});

type EditFormValues = z.infer<typeof editFormSchema>;

type BackendSortField =
  | "id"
  | "title"
  | "description"
  | "startDate"
  | "endDate"
  | "createdAt";
type AllSortField = BackendSortField | "locationName" | "locationType";

function isBackendField(f: AllSortField): f is BackendSortField {
  return f !== "locationName" && f !== "locationType";
}

function SortIcon({
  field,
  sort,
}: {
  field: AllSortField;
  sort: { field: AllSortField; dir: "asc" | "desc" };
}) {
  if (sort.field !== field)
    return <ArrowUpDown className="ml-1 inline size-3 opacity-50" />;
  return sort.dir === "asc" ? (
    <ArrowUp className="ml-1 inline size-3" />
  ) : (
    <ArrowDown className="ml-1 inline size-3" />
  );
}

export default function ResearchPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState<{
    field: AllSortField;
    dir: "asc" | "desc";
  }>({
    field: "createdAt",
    dir: "desc",
  });

  function handleSort(field: AllSortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  }

  const { data, refetch } = api.research.getResearches.useQuery({
    sortField: isBackendField(sort.field) ? sort.field : "createdAt",
    sortDir: isBackendField(sort.field) ? sort.dir : "desc",
  });

  const displayData = useMemo(() => {
    if (!data) return [];
    if (sort.field === "locationName") {
      return [...data].sort((a, b) => {
        const av = a.locations.map((l) => l.name).join(", ");
        const bv = b.locations.map((l) => l.name).join(", ");
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    if (sort.field === "locationType") {
      return [...data].sort((a, b) => {
        const av = a.locations.map((l) => l.type).join(", ");
        const bv = b.locations.map((l) => l.type).join(", ");
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return data;
  }, [data, sort]);
  const addResearch = api.research.addResearch.useMutation();
  const updateResearch = api.research.updateResearch.useMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<
    (typeof displayData)[number] | null
  >(null);

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      locationName: "",
      locationType: "",
    },
  });

  function openEditDialog(research: (typeof displayData)[number]) {
    setEditingResearch(research);
    editForm.reset({
      title: research.title,
      description: research.description ?? "",
      startDate: new Date(research.startDate),
      endDate: research.endDate ? new Date(research.endDate) : undefined,
      locationName: research.locations[0]?.name ?? "",
      locationType: research.locations[0]?.type ?? "",
    });
    setEditOpen(true);
  }

  function onEditSubmit(values: EditFormValues) {
    if (!editingResearch) return;
    updateResearch.mutate(
      {
        id: editingResearch.id,
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString() ?? null,
      },
      {
        onSuccess: () => {
          void refetch();
          setEditOpen(false);
          toast.success("Research project updated.");
        },
        onError: () => toast.error("Failed to update research project."),
      },
    );
  }

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
      <h1>My Research Projects</h1>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
      <p className="text-muted-foreground text-sm">
        An overview of all your existing research projects. Click the title of
        a Research Project to show/edit more info about a project, or click
        &ldquo;Create New Research Project&rdquo; to add a new project. When
        adding a new project you will be able to add researchers and apes later
        on.
      </p>
      <div className="pb-4">
        <Button onClick={() => setIsOpen(true)}>
          <PlusCircle />
          Create New Research Project
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Research Project</DialogTitle>
            <DialogDescription>
              Update the details of this research project.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
                              : "Pick a date (optional)"}
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
                control={editForm.control}
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
                control={editForm.control}
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
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateResearch.isPending}>
                  {updateResearch.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("title")}
            >
              Title
              <SortIcon field="title" sort={sort} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("description")}
            >
              Description
              <SortIcon field="description" sort={sort} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("locationName")}
            >
              Location
              <SortIcon field="locationName" sort={sort} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("locationType")}
            >
              Location Type
              <SortIcon field="locationType" sort={sort} />
            </TableHead>
            <TableHead
              className="min-w-32 cursor-pointer select-none"
              onClick={() => handleSort("startDate")}
            >
              Start Date
              <SortIcon field="startDate" sort={sort} />
            </TableHead>
            <TableHead
              className="min-w-32 cursor-pointer select-none"
              onClick={() => handleSort("endDate")}
            >
              End Date
              <SortIcon field="endDate" sort={sort} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("createdAt")}
            >
              Created At
              <SortIcon field="createdAt" sort={sort} />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((research) => (
            <TableRow key={research.id}>
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
                  onClick={() => openEditDialog(research)}
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${research.title}`}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500"
                  size="icon"
                  aria-label={`Delete ${research.title}`}
                >
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
