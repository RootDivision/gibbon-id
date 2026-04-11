"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
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
        <h1 className="text-2xl font-bold">
          {project?.title ?? `Research #${researchId}`}
        </h1>
        <Button onClick={() => setSessionModalOpen(true)}>
          Start New Session
        </Button>
      </div>
      <p>{project?.createdAt.toDateString()}</p>
      <p>{project?.description}</p>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Researchers</h2>
        <Button size="sm" onClick={() => setAddResearcherOpen(true)}>
          <Plus className="mr-1 size-4" />
          Add Researcher
        </Button>
      </div>
      {projectResearchers.length > 0 && (
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
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Ape Groups</h2>
        <Button size="sm" onClick={openAddGroup}>
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
                              {ape.species.name}
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

      <h2 className="text-lg font-bold">Locations</h2>

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
            <Label htmlFor="session-name">Session name</Label>
            <Input
              id="session-name"
              placeholder="e.g. Morning observation"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
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
                                  {ape.species.name}
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

            <div className="flex flex-col gap-4">
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
                            ({ape.species.name})
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
    </div>
  );
}
