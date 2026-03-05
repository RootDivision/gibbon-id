"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api, type RouterOutputs } from "~/trpc/react";

const SEX_OPTIONS = ["Male", "Female"] as const;
const AGE_CLASS_OPTIONS = ["Infant", "Juvenile", "Subadult", "Adult"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  speciesId: z.string(),
  groupId: z.string(),
  sex: z.string(),
  ageClass: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type ApeRow = RouterOutputs["ape"]["getApes"][number];

const EMPTY_VALUES: FormValues = {
  name: "",
  speciesId: "none",
  groupId: "none",
  sex: "none",
  ageClass: "none",
};

function apeToFormValues(ape: ApeRow): FormValues {
  return {
    name: ape.name,
    speciesId: ape.speciesId?.toString() ?? "none",
    groupId: ape.groupId?.toString() ?? "none",
    sex: ape.sex ?? "none",
    ageClass: ape.ageClass ?? "none",
  };
}

export default function ApePage() {
  const [dialogApe, setDialogApe] = useState<ApeRow | null | "add">(null);
  const [deleteApe, setDeleteApe] = useState<ApeRow | null>(null);

  const { data: apes, refetch } = api.ape.getApes.useQuery();
  const { data: species } = api.ape.getSpecies.useQuery();
  const { data: groups } = api.apeGroup.getApeGroups.useQuery();

  const addApe = api.ape.addApe.useMutation();
  const updateApe = api.ape.updateApe.useMutation();
  const deleteApeMutation = api.ape.deleteApe.useMutation();

  const isEditing = dialogApe !== null && dialogApe !== "add";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openAdd() {
    form.reset(EMPTY_VALUES);
    setDialogApe("add");
  }

  function openEdit(ape: ApeRow) {
    form.reset(apeToFormValues(ape));
    setDialogApe(ape);
  }

  function closeDialog() {
    setDialogApe(null);
    form.reset(EMPTY_VALUES);
  }

  function buildPayload(values: FormValues) {
    return {
      name: values.name,
      speciesId:
        values.speciesId && values.speciesId !== "none"
          ? parseInt(values.speciesId)
          : null,
      groupId:
        values.groupId && values.groupId !== "none"
          ? parseInt(values.groupId)
          : null,
      sex: (values.sex === "none" ? null : values.sex) as
        | "Male"
        | "Female"
        | null,
      ageClass: (values.ageClass === "none" ? null : values.ageClass) as
        | "Infant"
        | "Juvenile"
        | "Subadult"
        | "Adult"
        | null,
    };
  }

  function onSubmit(values: FormValues) {
    const payload = buildPayload(values);
    if (isEditing) {
      updateApe.mutate(
        { id: (dialogApe as ApeRow).id, ...payload },
        {
          onSuccess: () => {
            refetch();
            closeDialog();
            toast.success("Ape updated.");
          },
          onError: () => toast.error("Failed to update ape."),
        },
      );
    } else {
      addApe.mutate(payload, {
        onSuccess: () => {
          refetch();
          closeDialog();
          toast.success("Ape added.");
        },
        onError: () => toast.error("Failed to add ape."),
      });
    }
  }

  function confirmDelete() {
    if (!deleteApe) return;
    deleteApeMutation.mutate(
      { id: deleteApe.id },
      {
        onSuccess: () => {
          refetch();
          setDeleteApe(null);
          toast.success("Ape deleted.");
        },
        onError: () => toast.error("Failed to delete ape."),
      },
    );
  }

  const isSaving = addApe.isPending || updateApe.isPending;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1>Apes</h1>
        <Button onClick={openAdd}>
          <PlusCircle />
          Add ape
        </Button>
      </div>

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogApe !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Ape" : "Add Ape"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details for this ape."
                : "Enter the details for the new ape."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ape name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Species */}
              <FormField
                control={form.control}
                name="speciesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {species?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group */}
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {groups?.map((g) => (
                          <SelectItem key={g.id} value={g.id.toString()}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sex */}
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {SEX_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age Class */}
              <FormField
                control={form.control}
                name="ageClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Class</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select age class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {AGE_CLASS_OPTIONS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Saving…"
                    : isEditing
                      ? "Save changes"
                      : "Add ape"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteApe !== null}
        onOpenChange={(open) => !open && setDeleteApe(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Ape</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteApe?.name}</strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteApe(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteApeMutation.isPending}
              onClick={confirmDelete}
            >
              {deleteApeMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4 overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Age Class</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apes?.map((ape) => (
              <TableRow key={ape.id}>
                <TableCell>{ape.id}</TableCell>
                <TableCell>{ape.name}</TableCell>
                <TableCell>{ape.species?.name ?? "—"}</TableCell>
                <TableCell>{ape.group?.name ?? "—"}</TableCell>
                <TableCell>{ape.sex ?? "—"}</TableCell>
                <TableCell>{ape.ageClass ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(ape)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteApe(ape)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {apes?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  No apes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
