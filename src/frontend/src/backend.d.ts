import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Event {
    id: string;
    photoLink: string;
    organiser: string;
    participants: bigint;
    endDate: string;
    venue: string;
    views: bigint;
    name: string;
    createdAt: bigint;
    posterName: string;
    adminOrder: string;
    adminOrderName: string;
    purpose: string;
    startDate: string;
    poster: string;
}
export interface backendInterface {
    addEvent(name: string, startDate: string, endDate: string, participants: bigint, purpose: string, venue: string, photoLink: string, organiser: string, posterId: string, posterName: string, adminOrderId: string, adminOrderName: string): Promise<Event>;
    deleteEvent(id: string): Promise<boolean>;
    getEvents(): Promise<Array<Event>>;
    recordView(id: string): Promise<Event | null>;
    updateEvent(id: string, name: string, startDate: string, endDate: string, participants: bigint, purpose: string, venue: string, photoLink: string, organiser: string, posterId: string, posterName: string, adminOrderId: string, adminOrderName: string): Promise<Event | null>;
}
