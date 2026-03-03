import { Badge } from "@/components/ui/badge";
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
import type { IEvent } from "@/store/eventStore";
import { CalendarDays, Eye, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface AnalyticsPageProps {
  events: IEvent[];
}

export default function AnalyticsPage({ events }: AnalyticsPageProps) {
  const allYears = useMemo(() => {
    const yrs = new Set<number>();
    for (const e of events) {
      yrs.add(new Date(e.startDate).getFullYear());
    }
    const sorted = Array.from(yrs).sort((a, b) => a - b);
    if (sorted.length === 0) sorted.push(new Date().getFullYear());
    return sorted;
  }, [events]);

  const [selectedYear, setSelectedYear] = useState<number>(
    allYears[allYears.length - 1],
  );

  // Stats
  const totalEvents = events.length;
  const totalViews = events.reduce((s, e) => s + e.views, 0);

  const venueCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of events) {
      map[e.venue] = (map[e.venue] || 0) + 1;
    }
    return map;
  }, [events]);

  const mostActiveVenue = useMemo(() => {
    const entries = Object.entries(venueCounts);
    if (entries.length === 0) return "—";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [venueCounts]);

  const avgParticipants = useMemo(() => {
    if (events.length === 0) return 0;
    return Math.round(
      events.reduce((s, e) => s + e.participants, 0) / events.length,
    );
  }, [events]);

  // Monthly chart data for selected year
  const monthlyData = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const count = events.filter((e) => {
        const d = new Date(e.startDate);
        return d.getFullYear() === selectedYear && d.getMonth() === idx;
      }).length;
      return { month, count };
    });
  }, [events, selectedYear]);

  // Yearly chart data
  const yearlyData = useMemo(() => {
    return allYears.map((yr) => ({
      year: String(yr),
      count: events.filter((e) => new Date(e.startDate).getFullYear() === yr)
        .length,
    }));
  }, [events, allYears]);

  // Sorted event views table
  const sortedByViews = useMemo(
    () => [...events].sort((a, b) => b.views - a.views),
    [events],
  );

  const statCards = [
    {
      label: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-accent-foreground",
      bg: "bg-accent/20",
    },
    {
      label: "Most Active Venue",
      value: mostActiveVenue,
      icon: MapPin,
      color: "text-primary",
      bg: "bg-primary/8",
      small: true,
    },
    {
      label: "Avg Participants",
      value: avgParticipants.toLocaleString(),
      icon: Users,
      color: "text-accent-foreground",
      bg: "bg-accent/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border/60 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">
                {stat.label}
              </p>
              <div
                className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p
              className={`font-display font-bold text-foreground ${stat.small ? "text-lg leading-tight" : "text-2xl"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-semibold font-display text-foreground">
              Monthly Event Volume
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Number of events per month
            </p>
          </div>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger
              className="w-32 h-8 text-sm"
              data-ocid="analytics.year.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allYears.map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={monthlyData}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.88 0.03 255)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "oklch(0.5 0.05 255)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.5 0.05 255)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.03 255)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              cursor={{ fill: "oklch(0.88 0.03 255 / 0.4)" }}
            />
            <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-month-${entry.month}`}
                  fill={
                    entry.count > 0
                      ? "oklch(0.28 0.12 255)"
                      : "oklch(0.93 0.03 255)"
                  }
                  data-ocid={`analytics.monthly.chart_point.${index + 1}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Chart */}
      <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold font-display text-foreground">
            Yearly Event Volume
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total events per year
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={yearlyData}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.88 0.03 255)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "oklch(0.5 0.05 255)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "oklch(0.5 0.05 255)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.03 255)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              cursor={{ fill: "oklch(0.88 0.03 255 / 0.4)" }}
            />
            <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
              {yearlyData.map((_entry, index) => (
                <Cell
                  key={`cell-yr-${yearlyData[index].year}`}
                  fill="oklch(0.78 0.15 80)"
                  data-ocid={`analytics.yearly.chart_point.${index + 1}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event Views Table */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/60">
          <h3 className="text-base font-semibold font-display text-foreground">
            Event Engagement
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sorted by view count (descending)
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Event Name
                </TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Venue
                </TableHead>
                <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Views
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByViews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="analytics.events.empty_state"
                  >
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                sortedByViews.map((event, idx) => (
                  <TableRow
                    key={event.id}
                    className="hover:bg-secondary/20"
                    data-ocid={`analytics.events.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-sm font-body">
                      {event.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.venue}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-0 font-mono text-xs"
                      >
                        {event.views.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
