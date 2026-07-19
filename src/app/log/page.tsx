"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  Search,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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
import { api } from "~/trpc/react";
import { formatSpeciesName } from "~/lib/utils";

type EditForm = {
  behaviour: string;
  secondaryBehaviour: string;
  startDatetime: string;
  endDatetime: string;
  notes: string;
  apeId: string;
  methodId: string;
  researchProjectId: string;
  sessionId: string;
  researcherId: string;
};

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type ColumnKey =
  | "ape"
  | "species"
  | "behaviour"
  | "startDatetime"
  | "endDatetime"
  | "notes"
  | "method"
  | "researcher"
  | "session"
  | "location"
  | "locationType"
  | "researchProject";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "ape", label: "Ape" },
  { key: "species", label: "Species" },
  { key: "behaviour", label: "Behaviour" },
  { key: "startDatetime", label: "Time Start" },
  { key: "endDatetime", label: "Time Stop" },
  { key: "notes", label: "Notes" },
  { key: "method", label: "Method" },
  { key: "researcher", label: "Researcher" },
  { key: "session", label: "Session" },
  { key: "location", label: "Location" },
  { key: "locationType", label: "Location Type" },
  { key: "researchProject", label: "Research Project" },
];

type SortKey =
  | "behaviour"
  | "startDatetime"
  | "endDatetime"
  | "method"
  | "researcher"
  | "ape"
  | "species"
  | "session"
  | "location"
  | "locationType"
  | "researchProject";

type SortDir = "asc" | "desc";

type Filters = {
  behaviour: string;
  researchProjectId: string;
  sessionId: string;
  researcherId: string;
  methodId: string;
  apeId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

export default function LogPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(ALL_COLUMNS.map((c) => c.key)),
  );

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const show = (key: ColumnKey) => visibleColumns.has(key);
  const [sortKey, setSortKey] = useState<SortKey>("startDatetime");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    behaviour: "",
    researchProjectId: "",
    sessionId: "",
    researcherId: "",
    methodId: "",
    apeId: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [editingLog, setEditingLog] = useState<{ id: number } | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    behaviour: "",
    secondaryBehaviour: "",
    startDatetime: "",
    endDatetime: "",
    notes: "",
    apeId: "",
    methodId: "",
    researchProjectId: "",
    sessionId: "",
    researcherId: "",
  });

  const utils = api.useUtils();
  const updateLog = api.log.updateLog.useMutation({
    onSuccess: () => {
      setEditingLog(null);
      toast.success("Log updated");
      void utils.log.getLogs.invalidate();
    },
    onError: () => {
      toast.error("Failed to update log");
    },
  });

  function openEdit(log: (typeof sortedLogs)[number]) {
    setEditingLog({ id: log.id });
    setEditForm({
      behaviour: log.behaviour,
      secondaryBehaviour: log.secondaryBehaviour ?? "",
      startDatetime: toDatetimeLocal(log.startDatetime),
      endDatetime: toDatetimeLocal(log.endDatetime),
      notes: log.notes ?? "",
      apeId: String(log.apeId),
      methodId: String(log.methodId),
      researchProjectId: String(log.researchProjectId),
      sessionId: String(log.sessionId),
      researcherId: String(log.researcherId),
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
      methodId: Number(editForm.methodId),
      researchProjectId: Number(editForm.researchProjectId),
      sessionId: Number(editForm.sessionId),
      researcherId: Number(editForm.researcherId),
    });
  }

  const { data: logs } = api.log.getLogs.useQuery();
  const { data: methods } = api.method.getMethods.useQuery();
  const { data: projects } = api.research.getResearches.useQuery({
    sortField: "title",
    sortDir: "asc",
  });
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: researchers } = api.researcher.getResearchers.useQuery();
  const { data: apes } = api.ape.getApes.useQuery({
    sortField: "name",
    sortDir: "asc",
  });

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setGlobalSearch("");
    setFilters({
      behaviour: "",
      researchProjectId: "",
      sessionId: "",
      researcherId: "",
      methodId: "",
      apeId: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
  }

  const filteredLogs = (logs ?? []).filter((log) => {
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      const fields = [
        String(log.id),
        log.behaviour,
        log.notes ?? "",
        log.method?.name ?? "",
        log.researcher
          ? `${log.researcher.firstName} ${log.researcher.lastName}`
          : "",
        log.ape?.name ?? "",
        log.ape?.species?.name ?? "",
        log.session?.name ?? "",
        log.researchProject?.title ?? "",
        log.researchProject?.locations?.map((l) => l.name).join(" ") ?? "",
        log.researchProject?.locations?.map((l) => l.type).join(" ") ?? "",
        format(log.startDatetime, "PPP"),
        format(log.endDatetime, "PPP"),
      ];
      if (!fields.some((f) => f.toLowerCase().includes(q))) return false;
    }
    if (
      filters.behaviour &&
      !log.behaviour.toLowerCase().includes(filters.behaviour.toLowerCase())
    )
      return false;
    if (
      filters.researchProjectId &&
      log.researchProjectId !== Number(filters.researchProjectId)
    )
      return false;
    if (filters.sessionId && log.sessionId !== Number(filters.sessionId))
      return false;
    if (
      filters.researcherId &&
      log.researcherId !== Number(filters.researcherId)
    )
      return false;
    if (filters.methodId && log.methodId !== Number(filters.methodId))
      return false;
    if (filters.apeId && log.apeId !== Number(filters.apeId)) return false;
    if (filters.dateFrom && log.startDatetime < filters.dateFrom) return false;
    if (
      filters.dateTo &&
      log.startDatetime > new Date(filters.dateTo.setHours(23, 59, 59, 999))
    )
      return false;
    return true;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "behaviour":
        cmp = a.behaviour.localeCompare(b.behaviour);
        break;
      case "startDatetime":
        cmp = a.startDatetime.getTime() - b.startDatetime.getTime();
        break;
      case "endDatetime":
        cmp = a.endDatetime.getTime() - b.endDatetime.getTime();
        break;
      case "method":
        cmp = (a.method?.name ?? "").localeCompare(b.method?.name ?? "");
        break;
      case "researcher":
        cmp =
          `${a.researcher?.firstName} ${a.researcher?.lastName}`.localeCompare(
            `${b.researcher?.firstName} ${b.researcher?.lastName}`,
          );
        break;
      case "ape":
        cmp = (a.ape?.name ?? "").localeCompare(b.ape?.name ?? "");
        break;
      case "species":
        cmp = (a.ape?.species?.name ?? "").localeCompare(
          b.ape?.species?.name ?? "",
        );
        break;
      case "session":
        cmp = (a.session?.name ?? "").localeCompare(b.session?.name ?? "");
        break;
      case "location":
        cmp = (
          a.researchProject?.locations.map((l) => l.name).join(", ") ?? ""
        ).localeCompare(
          b.researchProject?.locations.map((l) => l.name).join(", ") ?? "",
        );
        break;
      case "locationType":
        cmp = (
          a.researchProject?.locations.map((l) => l.type).join(", ") ?? ""
        ).localeCompare(
          b.researchProject?.locations.map((l) => l.type).join(", ") ?? "",
        );
        break;
      case "researchProject":
        cmp = (a.researchProject?.title ?? "").localeCompare(
          b.researchProject?.title ?? "",
        );
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1>Logs</h1>
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            placeholder="Search all fields…"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="mr-2 size-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <p className="mb-2 text-xs font-medium">Toggle columns</p>
              <div className="space-y-2">
                {ALL_COLUMNS.map((col) => (
                  <div key={col.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`col-${col.key}`}
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={() => toggleColumn(col.key)}
                    />
                    <label
                      htmlFor={`col-${col.key}`}
                      className="cursor-pointer text-sm"
                    >
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Filters</span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground text-xs underline"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="filter-behaviour" className="text-xs">
                Behaviour
              </Label>
              <Input
                id="filter-behaviour"
                placeholder="Search behaviour…"
                value={filters.behaviour}
                onChange={(e) => setFilter("behaviour", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-research-project" className="text-xs">
                Research Project
              </Label>
              <Select
                value={filters.researchProjectId || "all"}
                onValueChange={(v) =>
                  setFilter("researchProjectId", v === "all" ? "" : v)
                }
              >
                <SelectTrigger
                  id="filter-research-project"
                  className="w-full"
                  aria-label="Research Project"
                >
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
                <SelectTrigger
                  id="filter-session"
                  className="w-full"
                  aria-label="Session"
                >
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
              <Label htmlFor="filter-researcher" className="text-xs">
                Researcher
              </Label>
              <Select
                value={filters.researcherId || "all"}
                onValueChange={(v) =>
                  setFilter("researcherId", v === "all" ? "" : v)
                }
              >
                <SelectTrigger
                  id="filter-researcher"
                  className="w-full"
                  aria-label="Researcher"
                >
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
                <SelectTrigger
                  id="filter-method"
                  className="w-full"
                  aria-label="Method"
                >
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
              <Label htmlFor="filter-ape" className="text-xs">
                Ape
              </Label>
              <Select
                value={filters.apeId || "all"}
                onValueChange={(v) => setFilter("apeId", v === "all" ? "" : v)}
              >
                <SelectTrigger
                  id="filter-ape"
                  className="w-full"
                  aria-label="Ape"
                >
                  <SelectValue placeholder="All apes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All apes</SelectItem>
                  {apes?.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                      {a.species && <> (<span className="italic">{a.species.name}</span>)</>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-date-from" className="text-xs">
                Date from
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-date-from"
                    variant="outline"
                    data-empty={!filters.dateFrom}
                    aria-label="Date from"
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {filters.dateFrom ? (
                      format(filters.dateFrom, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(d) => setFilter("dateFrom", d)}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-date-to" className="text-xs">
                Date to
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-date-to"
                    variant="outline"
                    data-empty={!filters.dateTo}
                    aria-label="Date to"
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {filters.dateTo ? (
                      format(filters.dateTo, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(d) => setFilter("dateTo", d)}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            {filteredLogs.length} of {logs?.length ?? 0} log
            {logs?.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              {(
                [
                  ["ape", "Ape"],
                  ["species", "Species"],
                  ["behaviour", "Behaviour"],
                  ["startDatetime", "Time Start"],
                  ["endDatetime", "Time Stop"],
                  ["notes", "Notes"],
                  ["method", "Method"],
                  ["researcher", "Researcher"],
                  ["session", "Session"],
                  ["location", "Location"],
                  ["locationType", "Location Type"],
                  ["researchProject", "Research Project"],
                ] as [ColumnKey, string][]
              ).map(([key, label]) =>
                show(key) ? (
                  key === "notes" ? (
                    <TableHead key={key}>Notes</TableHead>
                  ) : (
                    <TableHead key={key}>
                      <button
                        onClick={() => handleSort(key as SortKey)}
                        className="hover:text-foreground flex items-center gap-1"
                      >
                        {label}
                        {sortKey === key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        )}
                      </button>
                    </TableHead>
                  )
                ) : null,
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="w-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openEdit(log)}
                    aria-label="Edit log"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </TableCell>
                {show("ape") && <TableCell>{log.ape?.name ?? ""}</TableCell>}
                {show("species") && (
                  <TableCell>{log.ape?.species?.name ? formatSpeciesName(log.ape.species.name) : ""}</TableCell>
                )}
                {show("behaviour") && <TableCell>{log.behaviour}</TableCell>}
                {show("startDatetime") && (
                  <TableCell>{log.startDatetime.toLocaleString()}</TableCell>
                )}
                {show("endDatetime") && (
                  <TableCell>{log.endDatetime.toLocaleString()}</TableCell>
                )}
                {show("notes") && <TableCell>{log.notes ?? ""}</TableCell>}
                {show("method") && (
                  <TableCell>{log.method?.name ?? ""}</TableCell>
                )}
                {show("researcher") && (
                  <TableCell>
                    {log.researcher
                      ? `${log.researcher.firstName} ${log.researcher.lastName}`
                      : ""}
                  </TableCell>
                )}
                {show("session") && (
                  <TableCell>{log.session?.name ?? ""}</TableCell>
                )}
                {show("location") && (
                  <TableCell>
                    {log.researchProject?.locations
                      .map((l) => l.name)
                      .join(", ") ?? ""}
                  </TableCell>
                )}
                {show("locationType") && (
                  <TableCell>
                    {log.researchProject?.locations
                      .map((l) => l.type)
                      .join(", ") ?? ""}
                  </TableCell>
                )}
                {show("researchProject") && (
                  <TableCell>{log.researchProject?.title ?? ""}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editingLog} onOpenChange={(open) => { if (!open) setEditingLog(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Log</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-behaviour">Behaviour</Label>
                <Input
                  id="edit-behaviour"
                  required
                  value={editForm.behaviour}
                  onChange={(e) => handleEditField("behaviour", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-secondary-behaviour">Secondary Behaviour</Label>
                <Input
                  id="edit-secondary-behaviour"
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
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) => handleEditField("notes", e.target.value)}
                />
              </div>
              <div className="space-y-1">
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
                    {apes?.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-method">Method</Label>
                <Select
                  required
                  value={editForm.methodId}
                  onValueChange={(v) => handleEditField("methodId", v)}
                >
                  <SelectTrigger id="edit-method" className="w-full" aria-label="Method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods?.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-researcher">Researcher</Label>
                <Select
                  required
                  value={editForm.researcherId}
                  onValueChange={(v) => handleEditField("researcherId", v)}
                >
                  <SelectTrigger id="edit-researcher" className="w-full" aria-label="Researcher">
                    <SelectValue placeholder="Select researcher" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchers?.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.firstName} {r.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-session">Session</Label>
                <Select
                  required
                  value={editForm.sessionId}
                  onValueChange={(v) => handleEditField("sessionId", v)}
                >
                  <SelectTrigger id="edit-session" className="w-full" aria-label="Session">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="edit-project">Research Project</Label>
                <Select
                  required
                  value={editForm.researchProjectId}
                  onValueChange={(v) => handleEditField("researchProjectId", v)}
                >
                  <SelectTrigger id="edit-project" className="w-full" aria-label="Research Project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
    </>
  );
}
