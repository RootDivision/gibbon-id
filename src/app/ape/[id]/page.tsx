"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

type LogSortField = "id" | "startDatetime" | "endDatetime" | "behaviour";

type LogFilters = {
  behaviour: string;
  researchProjectId: string;
  sessionId: string;
  methodId: string;
  researcherId: string;
};

const EMPTY_FILTERS: LogFilters = {
  behaviour: "",
  researchProjectId: "",
  sessionId: "",
  methodId: "",
  researcherId: "",
};

function SortIcon({
  field,
  sort,
}: {
  field: LogSortField;
  sort: { field: LogSortField; dir: "asc" | "desc" };
}) {
  if (sort.field !== field)
    return <ArrowUpDown className="ml-1 inline size-3 opacity-50" />;
  return sort.dir === "asc" ? (
    <ArrowUp className="ml-1 inline size-3" />
  ) : (
    <ArrowDown className="ml-1 inline size-3" />
  );
}

export default function ApeProfilePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    notFound();
  }

  const apeId = Number(id);

  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<LogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{
    field: LogSortField;
    dir: "asc" | "desc";
  }>({
    field: "startDatetime",
    dir: "desc",
  });

  function setFilter<K extends keyof LogFilters>(key: K, value: LogFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSort(field: LogSortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  }

  const { data: ape, isLoading: apeLoading } = api.ape.getApeById.useQuery({
    id: apeId,
  });

  const { data: logs = [], isLoading: logsLoading } =
    api.log.getLogsByApeId.useQuery({
      apeId,
      sortField: sort.field,
      sortDir: sort.dir,
      behaviour: filters.behaviour || undefined,
      researchProjectId: filters.researchProjectId
        ? Number(filters.researchProjectId)
        : undefined,
      sessionId: filters.sessionId ? Number(filters.sessionId) : undefined,
      methodId: filters.methodId ? Number(filters.methodId) : undefined,
      researcherId: filters.researcherId
        ? Number(filters.researcherId)
        : undefined,
    });

  const { data: projects } = api.research.getResearches.useQuery({
    sortField: "title",
    sortDir: "asc",
  });
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: methods } = api.method.getMethods.useQuery();
  const { data: researchers } = api.researcher.getResearchers.useQuery();

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
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Observation Logs</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                placeholder="Search behaviour…"
                value={filters.behaviour}
                onChange={(e) => setFilter("behaviour", e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="mr-2 size-4" />
              {showFilters ? "Hide filters" : "Show filters"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Filters</span>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="filter-project" className="text-xs">
                  Project
                </Label>
                <Select
                  value={filters.researchProjectId || "all"}
                  onValueChange={(v) =>
                    setFilter("researchProjectId", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger id="filter-project" className="w-full">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-session" className="text-xs">
                  Session
                </Label>
                <Select
                  value={filters.sessionId || "all"}
                  onValueChange={(v) =>
                    setFilter("sessionId", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger id="filter-session" className="w-full">
                    <SelectValue placeholder="All sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sessions</SelectItem>
                    {sessions?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-method" className="text-xs">
                  Method
                </Label>
                <Select
                  value={filters.methodId || "all"}
                  onValueChange={(v) =>
                    setFilter("methodId", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger id="filter-method" className="w-full">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    {methods?.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-researcher" className="text-xs">
                  Researcher
                </Label>
                <Select
                  value={filters.researcherId || "all"}
                  onValueChange={(v) =>
                    setFilter("researcherId", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger id="filter-researcher" className="w-full">
                    <SelectValue placeholder="All researchers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All researchers</SelectItem>
                    {researchers?.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.firstName} {r.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Table>
          {!logsLoading && logs.length === 0 && (
            <TableCaption>No logs found for this ape.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("id")}
              >
                ID <SortIcon field="id" sort={sort} />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("behaviour")}
              >
                Behaviour <SortIcon field="behaviour" sort={sort} />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("startDatetime")}
              >
                Start <SortIcon field="startDatetime" sort={sort} />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("endDatetime")}
              >
                End <SortIcon field="endDatetime" sort={sort} />
              </TableHead>
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
