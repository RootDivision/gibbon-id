"use client";

import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { formatSpeciesName } from "~/lib/utils";

export default function SessionPage() {
  const { id: researchId, sessionId } = useParams<{
    id: string;
    sessionId: string;
  }>();

  if (!researchId || !sessionId) {
    notFound();
  }

  const [groupByApe, setGroupByApe] = useState(false);

  const { data: session } = api.session.getSessionById.useQuery({
    sessionId: Number(sessionId),
  });

  const { data: logs = [] } = api.log.getLogsBySessionId.useQuery({
    sessionId: Number(sessionId),
  });

  // Unique apes from logs, sorted by name, for grouped view
  const groupedApes = Array.from(
    new Map(
      logs
        .filter((l) => l.ape)
        .map((l) => [l.apeId, l.ape!]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <Link href={`/research/${researchId}`} className="hover:underline">
          ← Back to sessions
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {session?.name ?? `Session #${sessionId}`}
        </h1>
        {logs.length > 0 && (
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
        )}
      </div>

      <Table>
        {logs.length === 0 && (
          <TableCaption>No logs found for this session.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Primary Behaviour</TableHead>
            <TableHead>Secondary Behaviour</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            {!groupByApe && <TableHead>Ape</TableHead>}
            <TableHead>Method</TableHead>
            <TableHead>Researcher</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!groupByApe
            ? logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.behaviour ?? "—"}</TableCell>
                  <TableCell>{log.secondaryBehaviour ?? "—"}</TableCell>
                  <TableCell>
                    {log.startDatetime
                      ? new Date(log.startDatetime).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {log.endDatetime
                      ? new Date(log.endDatetime).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>{log.ape?.name ?? "—"}</TableCell>
                  <TableCell>{log.method?.name ?? "—"}</TableCell>
                  <TableCell>
                    {log.researcher
                      ? `${log.researcher.firstName} ${log.researcher.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell>{log.notes ?? "—"}</TableCell>
                </TableRow>
              ))
            : groupedApes.flatMap((ape) => {
                const apeLogs = logs
                  .filter((l) => l.apeId === ape.id)
                  .sort(
                    (a, b) =>
                      new Date(a.startDatetime).getTime() -
                      new Date(b.startDatetime).getTime(),
                  );
                return [
                  <TableRow key={`group-${ape.id}`} className="bg-muted/50">
                    <TableCell colSpan={8} className="py-2 font-semibold">
                      {ape.name}
                      {ape.species ? <> &mdash; {formatSpeciesName(ape.species.name)}</> : ""}
                    </TableCell>
                  </TableRow>,
                  ...apeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.behaviour ?? "—"}</TableCell>
                      <TableCell>{log.secondaryBehaviour ?? "—"}</TableCell>
                      <TableCell>
                        {log.startDatetime
                          ? new Date(log.startDatetime).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {log.endDatetime
                          ? new Date(log.endDatetime).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>{log.method?.name ?? "—"}</TableCell>
                      <TableCell>
                        {log.researcher
                          ? `${log.researcher.firstName} ${log.researcher.lastName}`
                          : "—"}
                      </TableCell>
                      <TableCell>{log.notes ?? "—"}</TableCell>
                    </TableRow>
                  )),
                ];
              })}
        </TableBody>
      </Table>
    </div>
  );
}
