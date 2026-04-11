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

export default function ApeProfilePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    notFound();
  }

  const apeId = Number(id);

  const { data: ape, isLoading: apeLoading } = api.ape.getApeById.useQuery({
    id: apeId,
  });

  const { data: logs = [], isLoading: logsLoading } =
    api.log.getLogsByApeId.useQuery({ apeId });

  if (!apeLoading && !ape) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-muted-foreground text-sm">
        <Link href="/ape" className="hover:underline">
          ← Back to apes
        </Link>
      </div>

      {apeLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold">{ape?.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">ID: {ape?.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Species
              </p>
              <p className="mt-1">{ape?.species?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Group
              </p>
              <p className="mt-1">{ape?.group?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Sex
              </p>
              <p className="mt-1">{ape?.sex ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Age Class
              </p>
              <p className="mt-1">{ape?.ageClass ?? "—"}</p>
            </div>
          </div>
        </>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Observation Logs</h2>
        <Table>
          {!logsLoading && logs.length === 0 && (
            <TableCaption>No logs found for this ape.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Behaviour</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Researcher</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-muted-foreground text-center"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
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
                  <TableCell>{log.researchProject?.title ?? "—"}</TableCell>
                  <TableCell>{log.session?.name ?? "—"}</TableCell>
                  <TableCell>{log.method?.name ?? "—"}</TableCell>
                  <TableCell>
                    {log.researcher
                      ? `${log.researcher.firstName} ${log.researcher.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell>{log.notes ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
