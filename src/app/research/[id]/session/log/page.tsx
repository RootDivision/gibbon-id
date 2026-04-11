"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { api } from "~/trpc/react";
import { useAppStore } from "~/app/store";

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

export default function LogPage() {
  const researcherId = useAppStore((state) => state.researcherId);
  const methodId = useAppStore((state) => state.methodId);
  const sessionName = useAppStore((state) => state.sessionName);

  const { id: researchId } = useParams<{ id: string }>();

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [behaviour, setBehaviour] = useState("");
  const [apeId, setApeId] = useState("");
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

  function stopTimer() {
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    setElapsed(0);
    setSessionIntervalId(null);
    setBehaviour("");
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

    const endTime = new Date();
    addLog.mutate(
      {
        behaviour: behaviour,
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
                            {ape.species.name}
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
            placeholder="Behaviour"
            value={behaviour}
            onChange={(e) => setBehaviour(e.target.value)}
            disabled={!running}
          />
          <Button type="submit" disabled={!running || addLog.isPending}>
            {addLog.isPending ? "Saving…" : "Save log"}
          </Button>
        </div>
      </form>

      {sessionLogs && sessionLogs.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Session logs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Behaviour</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Ape</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Time Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionLogs.map((log) => {
                const diffSec = Math.round(
                  (new Date(log.endDatetime).getTime() -
                    new Date(log.startDatetime).getTime()) /
                    1000,
                );
                const h = Math.floor(diffSec / 3600);
                const m = Math.floor((diffSec % 3600) / 60);
                const s = diffSec % 60;
                const diffFormatted = [h, m, s]
                  .map((v) => String(v).padStart(2, "0"))
                  .join(":");
                return (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.behaviour}</TableCell>
                    <TableCell>
                      {new Date(log.startDatetime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {new Date(log.endDatetime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{log.ape?.name ?? ""}</TableCell>
                    <TableCell>{log.method?.name ?? ""}</TableCell>
                    <TableCell>{diffFormatted}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
