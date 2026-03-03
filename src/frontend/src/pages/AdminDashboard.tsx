import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useEvents } from "@/hooks/useEvents";
import { clearSession } from "@/store/eventStore";
import { getStorageClient } from "@/utils/storage";
import {
  BarChart2,
  CalendarDays,
  FileText,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import AnalyticsPage from "./AnalyticsPage";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface AdminDashboardProps {
  onLogout: () => void;
  initialTab?: "events" | "analytics";
}

type FormData = {
  name: string;
  startDate: string;
  endDate: string;
  participants: string;
  purpose: string;
  venue: string;
  photoLink: string;
  organiser: string;
  posterId: string;
  posterName: string;
  adminOrderId: string;
  adminOrderName: string;
};

const emptyForm: FormData = {
  name: "",
  startDate: "",
  endDate: "",
  participants: "",
  purpose: "",
  venue: "",
  photoLink: "",
  organiser: "",
  posterId: "",
  posterName: "",
  adminOrderId: "",
  adminOrderName: "",
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  if (start === end) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

export default function AdminDashboard({
  onLogout,
  initialTab = "events",
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"events" | "analytics">(
    initialTab,
  );
  const { events, loading, refresh, addEvent, updateEvent, deleteEvent } =
    useEvents();

  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Upload states: null = idle, 0–100 = uploading
  const [posterProgress, setPosterProgress] = useState<number | null>(null);
  const [orderProgress, setOrderProgress] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  const uploadingPoster = posterProgress !== null;
  const uploadingOrder = orderProgress !== null;

  // Available years from events
  const availableYears = [
    ...new Set(events.map((e) => new Date(e.startDate).getFullYear())),
  ].sort((a, b) => a - b);

  // Filtered events
  const filteredEvents = events.filter((e) => {
    const d = new Date(e.startDate);
    const monthMatch =
      filterMonth === "all" || d.getMonth() + 1 === Number(filterMonth);
    const yearMatch =
      filterYear === "all" || d.getFullYear() === Number(filterYear);
    return monthMatch && yearMatch;
  });

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(event: (typeof events)[0]) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      participants: String(Number(event.participants)),
      purpose: event.purpose,
      venue: event.venue,
      photoLink: event.photoLink,
      organiser: event.organiser,
      posterId: event.poster,
      posterName: event.posterName,
      adminOrderId: event.adminOrder,
      adminOrderName: event.adminOrderName,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPosterProgress(null);
    setOrderProgress(null);
  }

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 100 MB.`,
      );
      e.target.value = "";
      return;
    }
    setPosterProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const client = await getStorageClient();
      const { hash } = await client.putFile(bytes, (pct) => {
        setPosterProgress(pct);
      });
      setForm((f) => ({ ...f, posterId: hash, posterName: file.name }));
      toast.success("Poster uploaded successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload poster";
      toast.error(msg);
      setForm((f) => ({ ...f, posterId: "", posterName: "" }));
    } finally {
      setPosterProgress(null);
      e.target.value = "";
    }
  }

  async function handleOrderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 100 MB.`,
      );
      e.target.value = "";
      return;
    }
    setOrderProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const client = await getStorageClient();
      const { hash } = await client.putFile(bytes, (pct) => {
        setOrderProgress(pct);
      });
      setForm((f) => ({
        ...f,
        adminOrderId: hash,
        adminOrderName: file.name,
      }));
      toast.success("Document uploaded successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload document";
      toast.error(msg);
      setForm((f) => ({ ...f, adminOrderId: "", adminOrderName: "" }));
    } finally {
      setOrderProgress(null);
      e.target.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.venue.trim()) {
      toast.error("Please fill in required fields (Name, Start Date, Venue)");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate || form.startDate,
        participants: BigInt(Number(form.participants) || 0),
        purpose: form.purpose.trim(),
        venue: form.venue.trim(),
        photoLink: form.photoLink.trim(),
        organiser: form.organiser.trim(),
        posterId: form.posterId,
        posterName: form.posterName,
        adminOrderId: form.adminOrderId,
        adminOrderName: form.adminOrderName,
      };

      if (editingId) {
        await updateEvent(editingId, payload);
        toast.success("Event updated successfully");
      } else {
        await addEvent(payload);
        toast.success("Event added successfully");
      }
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save event";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteEvent(deletingId);
      toast.success("Event deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete event";
      toast.error(msg);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  }

  function handleLogout() {
    clearSession();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <p className="text-sm font-bold font-display leading-tight">
                IIIT Bangalore
              </p>
              <p className="text-xs text-primary-foreground/70 leading-tight">
                Event Management
              </p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                activeTab === "events"
                  ? "bg-white/15 text-white"
                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
              }`}
              data-ocid="admin.events.tab"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                activeTab === "analytics"
                  ? "bg-white/15 text-white"
                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
              }`}
              data-ocid="admin.analytics.tab"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-primary-foreground/80 hover:text-white hover:bg-white/10 gap-1.5"
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "events" ? (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Page header */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    All Events
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {loading
                      ? "Loading…"
                      : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} found`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  <Button
                    onClick={openAddModal}
                    className="gap-2 font-body"
                    data-ocid="admin.event.open_modal_button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger
                    className="w-36 h-9"
                    data-ocid="admin.filter.month.select"
                  >
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTH_NAMES.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger
                    className="w-28 h-9"
                    data-ocid="admin.filter.year.select"
                  >
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((yr) => (
                      <SelectItem key={yr} value={String(yr)}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filterMonth !== "all" || filterYear !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterMonth("all");
                      setFilterYear("all");
                    }}
                    className="h-9 text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className="h-9 ml-auto text-muted-foreground hover:text-foreground gap-1"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Refresh
                </Button>
              </div>

              {/* Events Table */}
              <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                          Event Name
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground min-w-[200px]">
                          Dates
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                          Participants
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground min-w-[140px]">
                          Venue
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground min-w-[140px]">
                          Organiser
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground text-right">
                          Views
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && events.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-16"
                            data-ocid="admin.events.loading_state"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-border" />
                              <p className="text-sm">Loading events…</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredEvents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-16"
                            data-ocid="admin.events.empty_state"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <CalendarDays className="w-8 h-8 text-border" />
                              <p className="text-sm">
                                No events found for the selected filters
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEvents.map((event, idx) => (
                          <TableRow
                            key={event.id}
                            className="hover:bg-secondary/20"
                            data-ocid={`admin.events.row.${idx + 1}`}
                          >
                            <TableCell className="font-medium text-sm font-body">
                              {event.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDateRange(event.startDate, event.endDate)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-primary/8 text-primary border-0 text-xs"
                              >
                                {Number(event.participants).toLocaleString()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {event.venue}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {event.organiser}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {Number(event.views).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => openEditModal(event)}
                                  data-ocid={`admin.events.edit_button.${idx + 1}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => confirmDelete(event.id)}
                                  data-ocid={`admin.events.delete_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Monitor event trends and participation patterns
                </p>
              </div>
              <AnalyticsPage events={events} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            © IIIT Bangalore. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Add/Edit Event Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="admin.event.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingId ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingId
                ? "Update the event details below."
                : "Fill in the details to create a new event."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="event-name" className="text-sm font-body">
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Annual TechFest 2025"
                  data-ocid="admin.event.name.input"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-sm font-body">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  data-ocid="admin.event.startdate.input"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-sm font-body">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  data-ocid="admin.event.enddate.input"
                />
              </div>

              {/* Participants */}
              <div className="space-y-1.5">
                <Label htmlFor="participants" className="text-sm font-body">
                  No. of Participants
                </Label>
                <Input
                  id="participants"
                  type="number"
                  min={0}
                  value={form.participants}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, participants: e.target.value }))
                  }
                  placeholder="e.g. 250"
                  data-ocid="admin.event.participants.input"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1.5">
                <Label htmlFor="venue" className="text-sm font-body">
                  Venue <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue"
                  value={form.venue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, venue: e.target.value }))
                  }
                  placeholder="e.g. Main Auditorium"
                  data-ocid="admin.event.venue.input"
                />
              </div>

              {/* Organiser */}
              <div className="space-y-1.5">
                <Label htmlFor="organiser" className="text-sm font-body">
                  Organiser
                </Label>
                <Input
                  id="organiser"
                  value={form.organiser}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, organiser: e.target.value }))
                  }
                  placeholder="e.g. Student Council"
                  data-ocid="admin.event.organiser.input"
                />
              </div>

              {/* Photo Link */}
              <div className="space-y-1.5">
                <Label htmlFor="photo-link" className="text-sm font-body">
                  Photo Link (URL)
                </Label>
                <Input
                  id="photo-link"
                  type="url"
                  value={form.photoLink}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, photoLink: e.target.value }))
                  }
                  placeholder="https://photos.google.com/..."
                  data-ocid="admin.event.photolink.input"
                />
              </div>

              {/* Purpose */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="purpose" className="text-sm font-body">
                  Purpose / Description
                </Label>
                <Textarea
                  id="purpose"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purpose: e.target.value }))
                  }
                  placeholder="Brief description of the event's purpose..."
                  rows={3}
                  className="resize-none"
                  data-ocid="admin.event.purpose.textarea"
                />
              </div>

              {/* Poster Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-body">Event Poster</Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() =>
                    !uploadingPoster && posterInputRef.current?.click()
                  }
                  disabled={uploadingPoster}
                  data-ocid="admin.event.poster.dropzone"
                >
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterUpload}
                    data-ocid="admin.event.poster.upload_button"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    {uploadingPoster ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                    ) : (
                      <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    {uploadingPoster ? (
                      <span className="text-primary font-medium">
                        Uploading… {posterProgress}%
                      </span>
                    ) : form.posterName ? (
                      <span className="text-foreground font-medium truncate">
                        {form.posterName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Upload poster image (up to 100 MB)
                      </span>
                    )}
                  </div>
                  {uploadingPoster && posterProgress !== null && (
                    <div className="mt-2">
                      <Progress value={posterProgress} className="h-1.5" />
                    </div>
                  )}
                </button>
                {form.posterName && !uploadingPoster && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() =>
                      setForm((f) => ({ ...f, posterId: "", posterName: "" }))
                    }
                  >
                    Remove poster
                  </button>
                )}
              </div>

              {/* Admin Order Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-body">
                  Admin Order (Document)
                </Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() =>
                    !uploadingOrder && orderInputRef.current?.click()
                  }
                  disabled={uploadingOrder}
                  data-ocid="admin.event.order.dropzone"
                >
                  <input
                    ref={orderInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/*"
                    className="hidden"
                    onChange={handleOrderUpload}
                    data-ocid="admin.event.order.upload_button"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    {uploadingOrder ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    {uploadingOrder ? (
                      <span className="text-primary font-medium">
                        Uploading… {orderProgress}%
                      </span>
                    ) : form.adminOrderName ? (
                      <span className="text-foreground font-medium truncate">
                        {form.adminOrderName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Upload PDF, Word, etc. (up to 100 MB)
                      </span>
                    )}
                  </div>
                  {uploadingOrder && orderProgress !== null && (
                    <div className="mt-2">
                      <Progress value={orderProgress} className="h-1.5" />
                    </div>
                  )}
                </button>
                {form.adminOrderName && !uploadingOrder && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        adminOrderId: "",
                        adminOrderName: "",
                      }))
                    }
                  >
                    Remove document
                  </button>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                data-ocid="admin.event.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadingPoster || uploadingOrder}
                data-ocid="admin.event.save_button"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving…
                  </>
                ) : uploadingPoster || uploadingOrder ? (
                  "Uploading file…"
                ) : editingId ? (
                  "Update Event"
                ) : (
                  "Add Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm" data-ocid="admin.delete.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="admin.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
