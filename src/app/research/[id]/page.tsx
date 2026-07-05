"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { cn, formatSpeciesName } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { useAppStore } from "~/app/store";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { toast } from "sonner";

export default function ResearchPage() {
  const { id: researchId } = useParams<{ id: string }>();
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const {
    selectedApeIds,
    selectApe,
    clearSelectedApes,
    methodId,
    selectMethod,
    researcherId,
    selectResearcher,
    sessionName,
    setSessionName,
  } = useAppStore();

  if (!researchId) {
    notFound();
  }

  const { data: methods = [] } = api.method.getMethods.useQuery();

  const { data: logsByResearchId = [] } =
    api.research.getLogsByResearchId.useQuery({
      researchId: Number(researchId),
    });

  const { data: project, refetch: refetchProject } =
    api.research.getResearchById.useQuery({
      researchId: Number(researchId),
    });

  const { data: allApes = [] } = api.ape.getApes.useQuery({
    sortField: "name",
    sortDir: "asc",
  });

  const addApeGroupToProject = api.apeGroup.addApeGroupToProject.useMutation();
  const addResearcherToProject =
    api.research.addResearcherToProject.useMutation();
  const removeResearcherFromProject =
    api.research.removeResearcherFromProject.useMutation();
  const updateResearchTitle = api.research.updateResearchTitle.useMutation();
  const updateResearchDates = api.research.updateResearchDates.useMutation();
  const updateResearchDescription =
    api.research.updateResearchDescription.useMutation();
  const updateApeGroup = api.apeGroup.updateApeGroup.useMutation();
  const updateLocation = api.research.updateLocation.useMutation();

  const { data: allResearchers = [] } =
    api.researcher.getResearchers.useQuery();

  const [addResearcherOpen, setAddResearcherOpen] = useState(false);
  const [selectedResearcherId, setSelectedResearcherId] = useState("");

  function saveResearcher() {
    if (!selectedResearcherId) return;
    addResearcherToProject.mutate(
      {
        researchProjectId: Number(researchId),
        researcherId: Number(selectedResearcherId),
      },
      {
        onSuccess: () => {
          void refetchProject();
          setAddResearcherOpen(false);
          setSelectedResearcherId("");
        },
      },
    );
  }

  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupNotes, setGroupNotes] = useState("");
  const [selectedGroupApeIds, setSelectedGroupApeIds] = useState<number[]>([]);

  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const [editDatesOpen, setEditDatesOpen] = useState(false);
  const [startDateDraft, setStartDateDraft] = useState<Date | undefined>();
  const [endDateDraft, setEndDateDraft] = useState<Date | undefined>();

  const [editDescOpen, setEditDescOpen] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const [manageResearchersOpen, setManageResearchersOpen] = useState(false);

  const [editGroupsOpen, setEditGroupsOpen] = useState(false);
  const [groupDrafts, setGroupDrafts] = useState<
    Record<number, { name: string; notes: string }>
  >({});

  const [editLocationsOpen, setEditLocationsOpen] = useState(false);
  const [locationDrafts, setLocationDrafts] = useState<
    Record<
      number,
      {
        name: string;
        type: string;
        country: string;
        xCoordinate: string;
        yCoordinate: string;
      }
    >
  >({});

  function toggleGroupApe(apeId: number) {
    setSelectedGroupApeIds((prev) =>
      prev.includes(apeId)
        ? prev.filter((id) => id !== apeId)
        : [...prev, apeId],
    );
  }

  function openAddGroup() {
    setGroupName("");
    setGroupNotes("");
    setSelectedGroupApeIds([]);
    setAddGroupOpen(true);
  }

  function saveApeGroup() {
    if (!groupName.trim()) return;
    addApeGroupToProject.mutate(
      {
        name: groupName.trim(),
        notes: groupNotes.trim() || undefined,
        apeIds: selectedGroupApeIds,
        researchProjectId: Number(researchId),
      },
      {
        onSuccess: () => {
          void refetchProject();
          setAddGroupOpen(false);
        },
      },
    );
  }

  function openEditGroupsDialog() {
    const drafts: Record<number, { name: string; notes: string }> = {};
    for (const g of project?.apeGroups ?? []) {
      drafts[g.id] = { name: g.name, notes: g.notes ?? "" };
    }
    setGroupDrafts(drafts);
    setEditGroupsOpen(true);
  }

  function openEditLocationsDialog() {
    const drafts: Record<
      number,
      {
        name: string;
        type: string;
        country: string;
        xCoordinate: string;
        yCoordinate: string;
      }
    > = {};
    for (const loc of project?.locations ?? []) {
      drafts[loc.id] = {
        name: loc.name,
        type: loc.type,
        country: loc.country,
        xCoordinate: String(loc.xCoordinate),
        yCoordinate: String(loc.yCoordinate),
      };
    }
    setLocationDrafts(drafts);
    setEditLocationsOpen(true);
  }

  const sessions = Array.from(
    new Map(
      logsByResearchId
        .filter((l) => l.session)
        .map((l) => [l.sessionId, l.session]),
    ).values(),
  ).sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

  const projectResearchers = project?.researchers ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <Link href={`/research`} className="hover:underline">
          ← Back to my research projects
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {project?.title ?? `Research #${researchId}`}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit title"
            onClick={() => {
              setTitleDraft(project?.title ?? "");
              setEditTitleOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
        <Button onClick={() => setSessionModalOpen(true)}>
          Start New Session
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-sm">
          {project?.startDate
            ? `Start: ${new Date(project.startDate).toLocaleDateString()}`
            : "No start date"}
          {project?.endDate
            ? ` · End: ${new Date(project.endDate).toLocaleDateString()}`
            : ""}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Edit dates"
          onClick={() => {
            setStartDateDraft(
              project?.startDate ? new Date(project.startDate) : undefined,
            );
            setEndDateDraft(
              project?.endDate ? new Date(project.endDate) : undefined,
            );
            setEditDatesOpen(true);
          }}
        >
          <Pencil className="size-3" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <p>{project?.description}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Edit description"
          onClick={() => {
            setDescDraft(project?.description ?? "");
            setEditDescOpen(true);
          }}
        >
          <Pencil className="size-3" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Researchers</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Manage researchers"
          onClick={() => setManageResearchersOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {projectResearchers.map((r) => (
          <Card key={r.id} className="w-72">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {(r.firstName[0] ?? "") + (r.lastName[0] ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">
                  {r.firstName} {r.lastName}
                </CardTitle>
                <CardContent className="text-muted-foreground p-0 text-sm">
                  {r.email}
                </CardContent>
              </div>
            </CardHeader>
          </Card>
        ))}
        <Card
          className="w-72 cursor-pointer border-dashed"
          onClick={() => setAddResearcherOpen(true)}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarFallback>
                <Plus className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Add New Researcher</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Ape Groups</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit ape groups"
            onClick={openEditGroupsDialog}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
        <Button size="sm" className="w-36" onClick={openAddGroup}>
          <Plus className="mr-1 size-4" />
          Add Ape Group
        </Button>
      </div>

      {(project?.apeGroups ?? []).length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {project?.apeGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  {group.notes && <p>{group.notes}</p>}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {group.apes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No apes in this group
                    </p>
                  ) : (
                    group.apes.map((ape) => (
                      <Card key={ape.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {ape.name[0]}
                            </AvatarFallback>
                          </Avatar>

                          <CardTitle>{ape.name}</CardTitle>
                        </CardHeader>
                        {ape.species && (
                          <CardContent>
                            <span className="text-muted-foreground text-sm">
                              {formatSpeciesName(ape.species.name)}
                            </span>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Locations</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit locations"
          onClick={openEditLocationsDialog}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <Table>
        {(project?.locations ?? []).length === 0 && (
          <TableCaption>No locations linked to this project.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Coordinates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project?.locations.map((loc) => (
            <TableRow key={loc.id}>
              <TableCell>{loc.name}</TableCell>
              <TableCell>{loc.country}</TableCell>
              <TableCell>{loc.type}</TableCell>
              <TableCell>
                {loc.xCoordinate}, {loc.yCoordinate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="text-lg font-bold">Sessions</h2>

      <Table>
        {sessions.length === 0 && (
          <TableCaption>
            No sessions found for this research project.
          </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Session Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session?.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() =>
                (window.location.href = `/research/${researchId}/session/${session?.id}`)
              }
            >
              <TableCell>{session?.id}</TableCell>
              <TableCell>
                {session?.name ?? `Session #${session?.id}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={sessionModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            clearSelectedApes();
            setSessionName("");
          }
          setSessionModalOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start New Session</DialogTitle>
            <DialogDescription>
              Select the apes to observe in this session for{" "}
              <span className="font-medium">
                {project?.title ?? `Research #${researchId}`}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="researcher-session-select">Researcher</Label>
              <Select
                value={researcherId ? String(researcherId) : ""}
                onValueChange={(val) => selectResearcher(Number(val))}
              >
                <SelectTrigger
                  id="researcher-session-select"
                  className="w-full"
                >
                  <SelectValue placeholder="Select a researcher…" />
                </SelectTrigger>
                <SelectContent>
                  {projectResearchers.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.firstName} {r.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="session-name">Session name</Label>
              <Input
                id="session-name"
                placeholder="e.g. Morning observation"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 py-2">
            {(project?.apeGroups ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No ape groups linked to this project.
              </p>
            ) : (
              project?.apeGroups.map((group) => (
                <div key={group.id} className="flex flex-col gap-4">
                  <p className="text-sm font-medium">{group.name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {group.apes.map((ape) => {
                      const selected = selectedApeIds.includes(ape.id);
                      return (
                        <Card
                          key={ape.id}
                          onClick={() => selectApe(ape.id)}
                          className={`cursor-pointer transition-colors ${
                            selected
                              ? "border-primary bg-primary/10"
                              : "hover:bg-muted"
                          }`}
                        >
                          <CardHeader className="flex flex-row items-center gap-3 p-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs">
                                {ape.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {ape.name}
                              </span>
                              {ape.species && (
                                <span className="text-muted-foreground text-xs">
                                  {formatSpeciesName(ape.species.name)}
                                </span>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {selectedApeIds.length > 0 && (
              <p className="text-muted-foreground text-xs">
                {selectedApeIds.length} ape
                {selectedApeIds.length > 1 ? "s" : ""} selected
              </p>
            )}

            <div className="flex flex-col gap-4">
              <Label htmlFor="method-select">Observation method</Label>
              <Select
                value={methodId ? String(methodId) : ""}
                onValueChange={(val) => selectMethod(Number(val))}
              >
                <SelectTrigger id="method-select" className="w-full">
                  <SelectValue placeholder="Select a method…" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  clearSelectedApes();
                  setSessionName("");
                  setSessionModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                asChild
                disabled={
                  selectedApeIds.length === 0 || !methodId || !researcherId
                }
                onClick={() => setSessionModalOpen(false)}
              >
                <Link href={`/research/${researchId}/session/log`}>
                  Continue
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Ape Group dialog */}
      <Dialog
        open={addGroupOpen}
        onOpenChange={(open) => {
          if (!open) {
            setGroupName("");
            setGroupNotes("");
            setSelectedGroupApeIds([]);
          }
          setAddGroupOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Ape Group</DialogTitle>
            <DialogDescription>
              Create a new ape group and link it to this research project.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input
                id="group-name"
                placeholder="e.g. Danum Alpha Group"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="group-notes">Notes (optional)</Label>
              <Input
                id="group-notes"
                placeholder="Any notes about this group…"
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Add apes</Label>
              {allApes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No apes available.
                </p>
              ) : (
                <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                  {allApes.map((ape) => (
                    <div key={ape.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`group-ape-${ape.id}`}
                        checked={selectedGroupApeIds.includes(ape.id)}
                        onCheckedChange={() => toggleGroupApe(ape.id)}
                      />
                      <label
                        htmlFor={`group-ape-${ape.id}`}
                        className="cursor-pointer text-sm"
                      >
                        {ape.name}
                        {ape.species && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({formatSpeciesName(ape.species.name)})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedGroupApeIds.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {selectedGroupApeIds.length} ape
                  {selectedGroupApeIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddGroupOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!groupName.trim() || addApeGroupToProject.isPending}
                onClick={saveApeGroup}
              >
                {addApeGroupToProject.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Researcher dialog */}
      <Dialog
        open={addResearcherOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedResearcherId("");
          setAddResearcherOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Researcher</DialogTitle>
            <DialogDescription>
              Link an existing researcher to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="researcher-select">Researcher</Label>
              <Select
                value={selectedResearcherId}
                onValueChange={setSelectedResearcherId}
              >
                <SelectTrigger id="researcher-select" className="w-full">
                  <SelectValue placeholder="Select a researcher…" />
                </SelectTrigger>
                <SelectContent>
                  {allResearchers
                    .filter(
                      (r) => !projectResearchers.some((pr) => pr.id === r.id),
                    )
                    .map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.firstName} {r.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setAddResearcherOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  !selectedResearcherId || addResearcherToProject.isPending
                }
                onClick={saveResearcher}
              >
                {addResearcherToProject.isPending ? "Saving…" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Title dialog */}
      <Dialog open={editTitleOpen} onOpenChange={setEditTitleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
            <DialogDescription>
              Update the research project title.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Research project title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditTitleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!titleDraft.trim() || updateResearchTitle.isPending}
                onClick={() =>
                  updateResearchTitle.mutate(
                    { id: Number(researchId), title: titleDraft.trim() },
                    {
                      onSuccess: () => {
                        void refetchProject();
                        setEditTitleOpen(false);
                        toast.success("Title updated.");
                      },
                      onError: () => toast.error("Failed to update title."),
                    },
                  )
                }
              >
                {updateResearchTitle.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dates dialog */}
      <Dialog open={editDatesOpen} onOpenChange={setEditDatesOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Dates</DialogTitle>
            <DialogDescription>
              Update the project start and end dates.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !startDateDraft && "text-muted-foreground",
                    )}
                  >
                    {startDateDraft
                      ? format(startDateDraft, "PPP")
                      : "Pick a date"}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDateDraft}
                    onSelect={setStartDateDraft}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label>End Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !endDateDraft && "text-muted-foreground",
                    )}
                  >
                    {endDateDraft
                      ? format(endDateDraft, "PPP")
                      : "Pick a date (optional)"}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDateDraft}
                    onSelect={setEndDateDraft}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDatesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!startDateDraft || updateResearchDates.isPending}
                onClick={() =>
                  updateResearchDates.mutate(
                    {
                      id: Number(researchId),
                      startDate: startDateDraft!.toISOString(),
                      endDate: endDateDraft?.toISOString() ?? null,
                    },
                    {
                      onSuccess: () => {
                        void refetchProject();
                        setEditDatesOpen(false);
                        toast.success("Dates updated.");
                      },
                      onError: () => toast.error("Failed to update dates."),
                    },
                  )
                }
              >
                {updateResearchDates.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Description dialog */}
      <Dialog open={editDescOpen} onOpenChange={setEditDescOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
            <DialogDescription>
              Update the project description.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                placeholder="Brief description (optional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDescOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={updateResearchDescription.isPending}
                onClick={() =>
                  updateResearchDescription.mutate(
                    { id: Number(researchId), description: descDraft },
                    {
                      onSuccess: () => {
                        void refetchProject();
                        setEditDescOpen(false);
                        toast.success("Description updated.");
                      },
                      onError: () =>
                        toast.error("Failed to update description."),
                    },
                  )
                }
              >
                {updateResearchDescription.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Researchers dialog */}
      <Dialog
        open={manageResearchersOpen}
        onOpenChange={setManageResearchersOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Researchers</DialogTitle>
            <DialogDescription>
              Remove researchers from this project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {projectResearchers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No researchers linked.
              </p>
            ) : (
              projectResearchers.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-sm">
                    {r.firstName} {r.lastName}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    disabled={removeResearcherFromProject.isPending}
                    onClick={() =>
                      removeResearcherFromProject.mutate(
                        {
                          researchProjectId: Number(researchId),
                          researcherId: r.id,
                        },
                        {
                          onSuccess: () => {
                            void refetchProject();
                            toast.success(
                              `${r.firstName} ${r.lastName} removed.`,
                            );
                          },
                          onError: () =>
                            toast.error("Failed to remove researcher."),
                        },
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setManageResearchersOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Ape Groups dialog */}
      <Dialog open={editGroupsOpen} onOpenChange={setEditGroupsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ape Groups</DialogTitle>
            <DialogDescription>
              Update the name and notes of each ape group.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {(project?.apeGroups ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No ape groups linked.
              </p>
            ) : (
              (project?.apeGroups ?? []).map((group) => {
                const draft = groupDrafts[group.id] ?? {
                  name: group.name,
                  notes: group.notes ?? "",
                };
                return (
                  <div
                    key={group.id}
                    className="flex flex-col gap-2 rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`group-name-${group.id}`}>Name</Label>
                      <Input
                        id={`group-name-${group.id}`}
                        value={draft.name}
                        onChange={(e) =>
                          setGroupDrafts((prev) => ({
                            ...prev,
                            [group.id]: { ...draft, name: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`group-notes-${group.id}`}>Notes</Label>
                      <Input
                        id={`group-notes-${group.id}`}
                        value={draft.notes}
                        onChange={(e) =>
                          setGroupDrafts((prev) => ({
                            ...prev,
                            [group.id]: { ...draft, notes: e.target.value },
                          }))
                        }
                        placeholder="Optional notes"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={
                          !draft.name.trim() || updateApeGroup.isPending
                        }
                        onClick={() =>
                          updateApeGroup.mutate(
                            {
                              id: group.id,
                              name: draft.name.trim(),
                              notes: draft.notes || undefined,
                            },
                            {
                              onSuccess: () => {
                                void refetchProject();
                                toast.success(`"${draft.name}" updated.`);
                              },
                              onError: () =>
                                toast.error("Failed to update group."),
                            },
                          )
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setEditGroupsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Locations dialog */}
      <Dialog open={editLocationsOpen} onOpenChange={setEditLocationsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Locations</DialogTitle>
            <DialogDescription>
              Update the details of each location.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {(project?.locations ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No locations linked.
              </p>
            ) : (
              (project?.locations ?? []).map((loc) => {
                const draft = locationDrafts[loc.id] ?? {
                  name: loc.name,
                  type: loc.type,
                  country: loc.country,
                  xCoordinate: String(loc.xCoordinate),
                  yCoordinate: String(loc.yCoordinate),
                };
                return (
                  <div
                    key={loc.id}
                    className="flex flex-col gap-2 rounded-md border p-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`loc-name-${loc.id}`}>Name</Label>
                        <Input
                          id={`loc-name-${loc.id}`}
                          value={draft.name}
                          onChange={(e) =>
                            setLocationDrafts((prev) => ({
                              ...prev,
                              [loc.id]: { ...draft, name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`loc-type-${loc.id}`}>Type</Label>
                        <Input
                          id={`loc-type-${loc.id}`}
                          value={draft.type}
                          onChange={(e) =>
                            setLocationDrafts((prev) => ({
                              ...prev,
                              [loc.id]: { ...draft, type: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`loc-country-${loc.id}`}>Country</Label>
                        <Input
                          id={`loc-country-${loc.id}`}
                          value={draft.country}
                          onChange={(e) =>
                            setLocationDrafts((prev) => ({
                              ...prev,
                              [loc.id]: { ...draft, country: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`loc-x-${loc.id}`}>Lat (X)</Label>
                        <Input
                          id={`loc-x-${loc.id}`}
                          type="number"
                          value={draft.xCoordinate}
                          onChange={(e) =>
                            setLocationDrafts((prev) => ({
                              ...prev,
                              [loc.id]: {
                                ...draft,
                                xCoordinate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`loc-y-${loc.id}`}>Lng (Y)</Label>
                        <Input
                          id={`loc-y-${loc.id}`}
                          type="number"
                          value={draft.yCoordinate}
                          onChange={(e) =>
                            setLocationDrafts((prev) => ({
                              ...prev,
                              [loc.id]: {
                                ...draft,
                                yCoordinate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={
                          !draft.name.trim() || updateLocation.isPending
                        }
                        onClick={() =>
                          updateLocation.mutate(
                            {
                              id: loc.id,
                              name: draft.name.trim(),
                              type: draft.type.trim(),
                              country: draft.country.trim(),
                              xCoordinate:
                                parseFloat(draft.xCoordinate) || 0,
                              yCoordinate:
                                parseFloat(draft.yCoordinate) || 0,
                            },
                            {
                              onSuccess: () => {
                                void refetchProject();
                                toast.success("Location updated.");
                              },
                              onError: () =>
                                toast.error("Failed to update location."),
                            },
                          )
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setEditLocationsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
