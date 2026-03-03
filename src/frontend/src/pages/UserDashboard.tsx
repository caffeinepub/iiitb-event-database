import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/useEvents";
import type { IEvent } from "@/store/eventStore";
import { getStorageClient } from "@/utils/storage";
import {
  CalendarDays,
  Download,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  LogOut,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

interface UserDashboardProps {
  onLogout: () => void;
}

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

/** Fetches blob from a URL and triggers browser download */
async function downloadFromUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

/** Check if a filename is a PDF */
function isPDF(filename: string | undefined): boolean {
  if (!filename) return false;
  return filename.toLowerCase().endsWith(".pdf");
}

// ─── Poster Lightbox ────────────────────────────────────────────────────────

interface PosterLightboxProps {
  imageUrl: string;
  filename: string;
  onClose: () => void;
}

function PosterLightbox({ imageUrl, filename, onClose }: PosterLightboxProps) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadFromUrl(imageUrl, filename);
      toast.success("Poster downloaded");
    } catch {
      toast.error("Failed to download poster");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      data-ocid="user.poster_lightbox.modal"
    >
      {/* Controls bar */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          variant="secondary"
          className="h-9 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
          onClick={handleDownload}
          disabled={downloading}
          data-ocid="user.poster_lightbox.download_button"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Downloading…" : "Download"}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
          onClick={onClose}
          data-ocid="user.poster_lightbox.close_button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Image */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={filename}
          className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl object-contain"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Document Viewer ─────────────────────────────────────────────────────────

interface DocViewerProps {
  docUrl: string;
  filename: string;
  onClose: () => void;
}

function DocViewer({ docUrl, filename, onClose }: DocViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const canPreview = isPDF(filename);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadFromUrl(docUrl, filename);
      toast.success("Document downloaded");
    } catch {
      toast.error("Failed to download document");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      data-ocid="user.doc_viewer.modal"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border"
        style={{ width: "95vw", height: "90vh", maxWidth: "1200px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {filename}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={handleDownload}
              disabled={downloading}
              data-ocid="user.doc_viewer.download_button"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {downloading ? "Downloading…" : "Download"}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              data-ocid="user.doc_viewer.close_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden bg-muted/30">
          {canPreview ? (
            <iframe
              src={docUrl}
              className="w-full h-full border-0"
              title={filename}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground font-display mb-2">
                  Preview not available
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This document format cannot be previewed in the browser.
                  Please download it to view.
                </p>
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? "Downloading…" : "Download Document"}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  event,
  index,
  onView,
}: {
  event: IEvent;
  index: number;
  onView: (id: string) => void;
}) {
  const [viewed, setViewed] = useState(false);

  // Poster lightbox state
  const [fetchingPoster, setFetchingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [showPosterLightbox, setShowPosterLightbox] = useState(false);

  // Doc viewer state
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [showDocViewer, setShowDocViewer] = useState(false);

  function handleCardClick() {
    if (!viewed) {
      onView(event.id);
      setViewed(true);
    }
  }

  const [downloadingPoster, setDownloadingPoster] = useState(false);
  const [downloadingOrder, setDownloadingOrder] = useState(false);

  async function ensurePosterUrl(): Promise<string | null> {
    if (posterUrl) return posterUrl;
    const client = await getStorageClient();
    const url = await client.getDirectURL(event.poster!);
    setPosterUrl(url);
    return url;
  }

  async function ensureOrderUrl(): Promise<string | null> {
    if (orderUrl) return orderUrl;
    const client = await getStorageClient();
    const url = await client.getDirectURL(event.adminOrder!);
    setOrderUrl(url);
    return url;
  }

  async function handleViewPoster(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.poster) return;
    setFetchingPoster(true);
    try {
      const url = await ensurePosterUrl();
      if (url) setShowPosterLightbox(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load poster");
    } finally {
      setFetchingPoster(false);
    }
  }

  async function handleDownloadPoster(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.poster) return;
    setDownloadingPoster(true);
    try {
      const url = await ensurePosterUrl();
      if (url) {
        await downloadFromUrl(url, event.posterName || `${event.name}-poster`);
        toast.success("Poster downloaded");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download poster",
      );
    } finally {
      setDownloadingPoster(false);
    }
  }

  async function handleViewOrder(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.adminOrder) return;
    setFetchingOrder(true);
    try {
      const url = await ensureOrderUrl();
      if (url) setShowDocViewer(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load document",
      );
    } finally {
      setFetchingOrder(false);
    }
  }

  async function handleDownloadOrder(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.adminOrder) return;
    setDownloadingOrder(true);
    try {
      const url = await ensureOrderUrl();
      if (url) {
        await downloadFromUrl(
          url,
          event.adminOrderName || `${event.name}-admin-order`,
        );
        toast.success("Document downloaded");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download document",
      );
    } finally {
      setDownloadingOrder(false);
    }
  }

  function handleViewPhotos(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.photoLink) return;
    window.open(event.photoLink, "_blank", "noopener,noreferrer");
  }

  const startMonth = new Date(event.startDate).toLocaleString("en-IN", {
    month: "short",
  });
  const startDay = new Date(event.startDate).getDate();
  const startYear = new Date(event.startDate).getFullYear();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
        onClick={handleCardClick}
        data-ocid={`user.events.card.${index + 1}`}
      >
        {/* Card top accent */}
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="p-5">
          {/* Date badge + title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-12 text-center bg-secondary rounded-lg py-1.5 px-1 border border-border/60">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                {startMonth}
              </p>
              <p className="text-xl font-bold font-display text-primary leading-tight">
                {startDay}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {startYear}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base font-display text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {event.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDateRange(event.startDate, event.endDate)}
              </p>
            </div>
          </div>

          {/* Participants badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-primary/8 text-primary border-0 gap-1 text-xs"
            >
              <Users className="w-3 h-3" />
              {Number(event.participants).toLocaleString()} participants
            </Badge>
          </div>

          {/* Venue + Organiser */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            {event.organiser && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{event.organiser}</span>
              </div>
            )}
          </div>

          {/* Purpose snippet */}
          {event.purpose && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 border-t border-border/40 pt-3">
              {event.purpose}
            </p>
          )}

          {/* Actions footer */}
          <div className="space-y-2 pt-3 border-t border-border/40">
            {/* Photos row */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                disabled={!event.photoLink}
                onClick={handleViewPhotos}
                data-ocid={`user.events.photos_button.${index + 1}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Photos
              </Button>
            </div>

            {/* Poster row */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                disabled={!event.poster || fetchingPoster}
                onClick={handleViewPoster}
                data-ocid={`user.events.poster_view_button.${index + 1}`}
              >
                {fetchingPoster ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                {fetchingPoster ? "Loading…" : "View Poster"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                disabled={!event.poster || downloadingPoster}
                onClick={handleDownloadPoster}
                data-ocid={`user.events.poster_download_button.${index + 1}`}
              >
                {downloadingPoster ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingPoster ? "Saving…" : "Download"}
              </Button>
            </div>

            {/* Document row */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                disabled={!event.adminOrder || fetchingOrder}
                onClick={handleViewOrder}
                data-ocid={`user.events.order_view_button.${index + 1}`}
              >
                {fetchingOrder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {fetchingOrder ? "Loading…" : "View Document"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 flex-1"
                disabled={!event.adminOrder || downloadingOrder}
                onClick={handleDownloadOrder}
                data-ocid={`user.events.order_download_button.${index + 1}`}
              >
                {downloadingOrder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingOrder ? "Saving…" : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Poster Lightbox */}
      <AnimatePresence>
        {showPosterLightbox && posterUrl && (
          <PosterLightbox
            imageUrl={posterUrl}
            filename={event.posterName || `${event.name}-poster`}
            onClose={() => setShowPosterLightbox(false)}
          />
        )}
      </AnimatePresence>

      {/* Document Viewer */}
      <AnimatePresence>
        {showDocViewer && orderUrl && (
          <DocViewer
            docUrl={orderUrl}
            filename={event.adminOrderName || `${event.name}-admin-order`}
            onClose={() => setShowDocViewer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function UserDashboard({ onLogout }: UserDashboardProps) {
  const { events, loading, recordView } = useEvents();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  // Available years
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

  async function handleView(id: string) {
    await recordView(id);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-bold font-display leading-tight">
                IIIT Bangalore
              </p>
              <p className="text-xs text-primary-foreground/70 leading-tight hidden sm:block">
                Event Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-0 text-xs hidden sm:flex"
            >
              <Users className="w-3 h-3 mr-1" />
              Staff / Faculty View
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-primary-foreground/80 hover:text-white hover:bg-white/10 gap-1.5"
              data-ocid="user.logout.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-foreground">
            Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and access IIITB events, photos, posters, and documents
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger
              className="w-36 h-9"
              data-ocid="user.filter.month.select"
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
              data-ocid="user.filter.year.select"
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

          <span className="text-sm text-muted-foreground ml-auto flex items-center gap-1.5">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading
              ? "Loading…"
              : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Events Grid */}
        {loading && events.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="user.events.loading_state"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading events…</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="user.events.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-display mb-1">
              No events found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              No events match your current filter criteria. Try adjusting the
              month or year filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event, idx) => (
              <EventCard
                key={event.id}
                event={event}
                index={idx}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </main>

      {/* View hint */}
      <div className="bg-secondary/40 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Click any card to record a view. Use the buttons on each card to
            open photos, view or download posters, and view or download admin
            order documents.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
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
    </div>
  );
}
