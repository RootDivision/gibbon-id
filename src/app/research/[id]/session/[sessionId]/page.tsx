"use client";

import { notFound, useParams } from "next/navigation";
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
import { api } from "~/trpc/react";

export default function SessionPage() {
  const { id: researchId, sessionId } = useParams<{
    id: string;
    sessionId: string;
  }>();

  if (!researchId || !sessionId) {
    notFound();
  }

  const { data: session } = api.session.getSessionById.useQuery({
    sessionId: Number(sessionId),
  });

  const { data: logs = [] } = api.log.getLogsBySessionId.useQuery({
    sessionId: Number(sessionId),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <Link href={`/research/${researchId}`} className="hover:underline">
          ← Back to sessions
        </Link>
      </div>

      <h1 className="mb-4 text-2xl font-bold">
        {session?.name ?? `Session #${sessionId}`}
      </h1>

      {/* <div className="mb-6">
        <Button asChild>
          <Link href={`/research/${researchId}/session/log`}>
            Start New Session
          </Link>
        </Button>
      </div> */}

      <Table>
        {logs.length === 0 && (
          <TableCaption>No logs found for this session.</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Behaviour</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Ape</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.id}</TableCell>
              <TableCell>{log.behaviour ?? "—"}</TableCell>
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
              <TableCell>{log.notes ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
