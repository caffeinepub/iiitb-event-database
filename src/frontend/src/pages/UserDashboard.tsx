import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type IEvent,
  getEvents,
  incrementViewAndGet,
} from "@/store/eventStore";
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  LogOut,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
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

function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

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

  function handleCardClick() {
    if (!viewed) {
      onView(event.id);
      setViewed(true);
    }
  }

  function handleDownloadPoster(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.posterId) return;
    downloadFile(event.posterId, event.posterName || `${event.name}-poster`);
    toast.success("Poster downloaded");
  }

  function handleDownloadOrder(e: React.MouseEvent) {
    e.stopPropagation();
    if (!event.adminOrderId) return;
    downloadFile(
      event.adminOrderId,
      event.adminOrderName || `${event.name}-order`,
    );
    toast.success("Document downloaded");
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
            {event.participants.toLocaleString()} participants
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
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 flex-1 min-w-[100px]"
            disabled={!event.photoLink}
            onClick={handleViewPhotos}
            data-ocid={`user.events.photos_button.${index + 1}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Photos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 flex-1 min-w-[100px]"
            disabled={!event.posterId}
            onClick={handleDownloadPoster}
            data-ocid={`user.events.poster_button.${index + 1}`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Poster
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 flex-1 min-w-[100px]"
            disabled={!event.adminOrderId}
            onClick={handleDownloadOrder}
            data-ocid={`user.events.order_button.${index + 1}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Admin Order
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function UserDashboard({ onLogout }: UserDashboardProps) {
  const [events, setEvents] = useState<IEvent[]>(() => getEvents());
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

  const handleView = useCallback((id: string) => {
    const updated = incrementViewAndGet(id);
    if (updated) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, views: updated.views } : e)),
      );
    }
  }, []);

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
              Student / Faculty View
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

          <span className="text-sm text-muted-foreground ml-auto">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
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

      {/* Download hint */}
      <div className="bg-secondary/40 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Click any card to record a view. Use the buttons to access photos,
            download event posters, and admin orders.
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
