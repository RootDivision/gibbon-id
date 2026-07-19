"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { useAppStore } from "~/app/store";
import { formatSpeciesName } from "~/lib/utils";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatSessionTime(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} - ${hh}:${min}:${ss}`;
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type EditForm = {
  behaviour: string;
  secondaryBehaviour: string;
  startDatetime: string;
  endDatetime: string;
  notes: string;
  apeId: string;
};

export default function LogPage() {
  const researcherId = useAppStore((state) => state.researcherId);
  const methodId = useAppStore((state) => state.methodId);
  const sessionName = useAppStore((state) => state.sessionName);

  const { id: researchId } = useParams<{ id: string }>();

  const { data: researchers } = api.researcher.getResearchers.useQuery();

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [behaviour, setBehaviour] = useState("");
  const [secondaryBehaviour, setSecondaryBehaviour] = useState("");
  const [apeId, setApeId] = useState("");
  const [groupByApe, setGroupByApe] = useState(false);
  const [sessionIntervalId, setSessionIntervalId] = useState<number | null>(
    null,
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  const { selectedApeIds } = useAppStore();
  const { data: apes } = api.ape.getApes.useQuery({
    sortField: "name",
    sortDir: "asc",
  });
  const selectedApes = (apes ?? []).filter((a) =>
    selectedApeIds.includes(a.id),
  );
  const { data: methods } = api.method.getMethods.useQuery();
  const addSession = api.session.addSession.useMutation();
  const addLog = api.log.addLog.useMutation();
  const { data: sessionLogs, refetch: refetchSessionLogs } =
    api.log.getLogsBySessionId.useQuery(
      { sessionId: sessionIntervalId! },
      { enabled: !!sessionIntervalId },
    );

  const [editingLog, setEditingLog] = useState<{ id: number } | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    behaviour: "",
    secondaryBehaviour: "",
    startDatetime: "",
    endDatetime: "",
    notes: "",
    apeId: "",
  });

  const updateLog = api.log.updateLog.useMutation({
    onSuccess: () => {
      setEditingLog(null);
      toast.success("Log updated");
      void refetchSessionLogs();
    },
    onError: () => toast.error("Failed to update log"),
  });

  function openEdit(log: NonNullable<typeof sessionLogs>[number]) {
    setEditingLog({ id: log.id });
    setEditForm({
      behaviour: log.behaviour,
      secondaryBehaviour: log.secondaryBehaviour ?? "",
      startDatetime: toDatetimeLocal(new Date(log.startDatetime)),
      endDatetime: toDatetimeLocal(new Date(log.endDatetime)),
      notes: log.notes ?? "",
      apeId: String(log.apeId),
    });
  }

  function handleEditField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLog) return;
    updateLog.mutate({
      id: editingLog.id,
      behaviour: editForm.behaviour,
      secondaryBehaviour: editForm.secondaryBehaviour || undefined,
      startDatetime: editForm.startDatetime,
      endDatetime: editForm.endDatetime,
      notes: editForm.notes || undefined,
      apeId: Number(editForm.apeId),
      methodId: Number(methodId),
      researchProjectId: Number(researchId),
      sessionId: sessionIntervalId!,
      researcherId: Number(researcherId),
    });
  }

  function stopTimer() {
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    setElapsed(0);
    setSessionIntervalId(null);
    setBehaviour("");
    setSecondaryBehaviour("");
    setApeId("");
    startedAtRef.current = null;
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleStart() {
    if (running || sessionIntervalId) return;
    const now = new Date();
    startedAtRef.current = now;
    const name = sessionName || formatSessionTime(now);
    addSession.mutate(
      { name },
      {
        onSuccess: (s) => {
          setSessionIntervalId(s.id);
          setRunning(true);
        },
        onError: () => toast.error("Failed to create session."),
      },
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!apeId) {
      toast.error("Please select an ape before saving.");
      return;
    }

    if (!researcherId) {
      toast.error("No researcher selected. Please go back and select a researcher.");
      return;
    }

    if (!methodId) {
      toast.error("No method selected. Please go back and select a method.");
      return;
    }

    const endTime = new Date();
    addLog.mutate(
      {
        behaviour: behaviour,
        secondaryBehaviour: secondaryBehaviour || undefined,
        startDatetime: startedAtRef.current!.toISOString(),
        endDatetime: endTime.toISOString(),
        apeId: Number(apeId),
        methodId: Number(methodId),
        researchProjectId: Number(researchId),
        sessionId: sessionIntervalId!,
        researcherId: Number(researcherId),
      },
      {
        onSuccess: () => {
          toast.success("Log saved.");
          void refetchSessionLogs();
          setBehaviour("");
          setSecondaryBehaviour("");
          // next log starts where this one ended
          startedAtRef.current = endTime;
        },
        onError: () => toast.error("Failed to save log."),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1>
        {sessionName} - {methods?.find((m) => m.id === methodId)?.name}
      </h1>
      {researcherId && (
        <p className="text-muted-foreground text-sm">
          Researcher:{" "}
          <span className="text-foreground font-medium">
            {(() => {
              const r = researchers?.find((r) => r.id === researcherId);
              return r ? `${r.firstName} ${r.lastName}` : `#${researcherId}`;
            })()}
          </span>
        </p>
      )}
      <div className="font-mono text-6xl font-bold tracking-widest">
        {formatTime(elapsed)}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleStart}
          disabled={running || !!sessionIntervalId || addSession.isPending}
        >
          Start
        </Button>
        <Button
          type="button"
          onClick={stopTimer}
          disabled={!running}
          variant="destructive"
        >
          Stop
        </Button>
        {!running && !!sessionIntervalId && (
          <Button type="button" onClick={handleReset} variant="outline">
            Reset
          </Button>
        )}
      </div>

      <form className="gap flex flex-col gap-4" onSubmit={handleSave}>
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-4 gap-4">
            {selectedApes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No apes selected — go back and select apes first.
              </p>
            ) : (
              selectedApes.map((ape) => {
                const isActive = apeId === String(ape.id);
                return (
                  <Card
                    key={ape.id}
                    onClick={() => setApeId(isActive ? "" : String(ape.id))}
                    className={`cursor-pointer transition-colors ${
                      isActive
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
                        <span className="text-sm font-medium">{ape.name}</span>
                        {ape.species && (
                          <span className="text-muted-foreground text-xs">
                            {formatSpeciesName(ape.species.name)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Input
            id="behaviour"
            placeholder="Primary behaviour *"
            value={behaviour}
            onChange={(e) => setBehaviour(e.target.value)}
            disabled={!running}
          />
          <Input
            id="secondaryBehaviour"
            placeholder="Secondary behaviour (optional)"
            value={secondaryBehaviour}
            onChange={(e) => setSecondaryBehaviour(e.target.value)}
            disabled={!running}
          />
          <Button type="submit" disabled={!running || !apeId || !researcherId || !methodId || addLog.isPending}>
            {addLog.isPending ? "Saving…" : "Save log"}
          </Button>
        </div>
      </form>

      {sessionLogs && sessionLogs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Session logs</h2>
            <div className="flex overflow-hidden rounded-md border">
              <Button
                type="button"
                size="sm"
                variant={groupByApe ? "ghost" : "secondary"}
                className="rounded-none"
                onClick={() => setGroupByApe(false)}
              >
                Chronological
              </Button>
              <Button
                type="button"
                size="sm"
                variant={groupByApe ? "secondary" : "ghost"}
                className="rounded-none border-l"
                onClick={() => setGroupByApe(true)}
              >
                Group by Ape
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>ID</TableHead>
                <TableHead>Primary Behaviour</TableHead>
                <TableHead>Secondary Behaviour</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Time Difference</TableHead>
                {!groupByApe && <TableHead>Ape</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!groupByApe
                ? sessionLogs.map((log) => {
                    const diffSec = Math.round(
                      (new Date(log.endDatetime).getTime() -
                        new Date(log.startDatetime).getTime()) /
                        1000,
                    );
                    const diffFormatted = [
                      Math.floor(diffSec / 3600),
                      Math.floor((diffSec % 3600) / 60),
                      diffSec % 60,
                    ]
                      .map((v) => String(v).padStart(2, "0"))
                      .join(":");
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="w-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={running}
                            onClick={() => openEdit(log)}
                            aria-label="Edit log"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </TableCell>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.behaviour}</TableCell>
                        <TableCell>{log.secondaryBehaviour ?? "—"}</TableCell>
                        <TableCell>
                          {new Date(log.startDatetime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {new Date(log.endDatetime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{diffFormatted}</TableCell>
                        <TableCell>{log.ape?.name ?? ""}</TableCell>
                      </TableRow>
                    );
                  })
                : selectedApes.flatMap((ape) => {
                    const apeLogs = sessionLogs
                      .filter((l) => l.apeId === ape.id)
                      .sort(
                        (a, b) =>
                          new Date(a.startDatetime).getTime() -
                          new Date(b.startDatetime).getTime(),
                      );
                    if (apeLogs.length === 0) return [];
                    return [
                      <TableRow key={`group-${ape.id}`} className="bg-muted/50">
                        <TableCell colSpan={7} className="py-2 font-semibold">
                          {ape.name}
                          {ape.species ? <> &mdash; {formatSpeciesName(ape.species.name)}</> : ""}
                        </TableCell>
                      </TableRow>,
                      ...apeLogs.map((log) => {
                        const diffSec = Math.round(
                          (new Date(log.endDatetime).getTime() -
                            new Date(log.startDatetime).getTime()) /
                            1000,
                        );
                        const diffFormatted = [
                          Math.floor(diffSec / 3600),
                          Math.floor((diffSec % 3600) / 60),
                          diffSec % 60,
                        ]
                          .map((v) => String(v).padStart(2, "0"))
                          .join(":");
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="w-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                disabled={running}
                                onClick={() => openEdit(log)}
                                aria-label="Edit log"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            </TableCell>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.behaviour}</TableCell>
                            <TableCell>
                              {log.secondaryBehaviour ?? "—"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                log.startDatetime,
                              ).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                log.endDatetime,
                              ).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>{diffFormatted}</TableCell>
                          </TableRow>
                        );
                      }),
                    ];
                  })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editingLog} onOpenChange={(open) => { if (!open) setEditingLog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Log</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-behaviour">Primary Behaviour</Label>
                <Input
                  id="edit-behaviour"
                  required
                  value={editForm.behaviour}
                  onChange={(e) => handleEditField("behaviour", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-secondary">Secondary Behaviour</Label>
                <Input
                  id="edit-secondary"
                  value={editForm.secondaryBehaviour}
                  onChange={(e) => handleEditField("secondaryBehaviour", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-start">Time Start</Label>
                <Input
                  id="edit-start"
                  type="datetime-local"
                  required
                  value={editForm.startDatetime}
                  onChange={(e) => handleEditField("startDatetime", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-end">Time Stop</Label>
                <Input
                  id="edit-end"
                  type="datetime-local"
                  required
                  value={editForm.endDatetime}
                  onChange={(e) => handleEditField("endDatetime", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-ape">Ape</Label>
                <Select
                  required
                  value={editForm.apeId}
                  onValueChange={(v) => handleEditField("apeId", v)}
                >
                  <SelectTrigger id="edit-ape" className="w-full" aria-label="Ape">
                    <SelectValue placeholder="Select ape" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedApes.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                        {a.species && <> ({formatSpeciesName(a.species.name)})</>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) => handleEditField("notes", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLog.isPending}>
                {updateLog.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
