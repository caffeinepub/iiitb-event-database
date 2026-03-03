import { useActor } from "@/hooks/useActor";
import type { IEvent } from "@/store/eventStore";
import { useCallback, useEffect, useState } from "react";

function mapEvent(raw: {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: bigint;
  purpose: string;
  venue: string;
  photoLink: string;
  organiser: string;
  poster: string;
  posterName: string;
  adminOrder: string;
  adminOrderName: string;
  createdAt: bigint;
  views: bigint;
}): IEvent {
  return {
    id: raw.id,
    name: raw.name,
    startDate: raw.startDate,
    endDate: raw.endDate,
    participants: raw.participants,
    purpose: raw.purpose,
    venue: raw.venue,
    photoLink: raw.photoLink,
    organiser: raw.organiser,
    poster: raw.poster,
    posterName: raw.posterName,
    adminOrder: raw.adminOrder,
    adminOrderName: raw.adminOrderName,
    createdAt: raw.createdAt,
    views: raw.views,
  };
}

export function useEvents() {
  const { actor, isFetching } = useActor();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await actor.getEvents();
      setEvents(raw.map(mapEvent));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor && !isFetching) {
      setLoading(false);
      return;
    }
    if (actor) {
      refresh();
    }
  }, [actor, isFetching, refresh]);

  async function addEvent(params: {
    name: string;
    startDate: string;
    endDate: string;
    participants: bigint;
    purpose: string;
    venue: string;
    photoLink: string;
    organiser: string;
    posterId: string;
    posterName: string;
    adminOrderId: string;
    adminOrderName: string;
  }): Promise<IEvent> {
    if (!actor) throw new Error("Actor not ready");
    const result = await actor.addEvent(
      params.name,
      params.startDate,
      params.endDate,
      params.participants,
      params.purpose,
      params.venue,
      params.photoLink,
      params.organiser,
      params.posterId,
      params.posterName,
      params.adminOrderId,
      params.adminOrderName,
    );
    await refresh();
    return mapEvent(result);
  }

  async function updateEvent(
    id: string,
    params: {
      name: string;
      startDate: string;
      endDate: string;
      participants: bigint;
      purpose: string;
      venue: string;
      photoLink: string;
      organiser: string;
      posterId: string;
      posterName: string;
      adminOrderId: string;
      adminOrderName: string;
    },
  ): Promise<IEvent | null> {
    if (!actor) throw new Error("Actor not ready");
    const result = await actor.updateEvent(
      id,
      params.name,
      params.startDate,
      params.endDate,
      params.participants,
      params.purpose,
      params.venue,
      params.photoLink,
      params.organiser,
      params.posterId,
      params.posterName,
      params.adminOrderId,
      params.adminOrderName,
    );
    await refresh();
    return result ? mapEvent(result) : null;
  }

  async function deleteEvent(id: string): Promise<void> {
    if (!actor) throw new Error("Actor not ready");
    await actor.deleteEvent(id);
    await refresh();
  }

  async function recordView(id: string): Promise<IEvent | null> {
    if (!actor) return null;
    try {
      const result = await actor.recordView(id);
      if (result) {
        const mapped = mapEvent(result);
        setEvents((prev) => prev.map((e) => (e.id === id ? mapped : e)));
        return mapped;
      }
    } catch {
      // Non-critical — don't surface view tracking errors
    }
    return null;
  }

  return {
    events,
    loading,
    error,
    refresh,
    addEvent,
    updateEvent,
    deleteEvent,
    recordView,
  };
}
