import { IChurch } from "@/types/church";
import { IFile } from "@/types/file";
import { ILocation } from "@/types/location";

export interface IEvent {
  id: number;
  name: string;
  description?: string;
  church_id?: number;
  church?: IChurch;
  publish_time: string;
  unpublish_time?: string | null;
  capacity?: number | null;
  website?: string | null;
  created_at?: string;
  event_file?: IEventFile;
  event_bookings?: IEventBooking[];
  event_location?: {
    event_id: number;
    event: IEvent;
    location_id: number;
    location: ILocation;
  }[];
  event_schedule?: IEventSchedule[];
}

export interface IPayloadEvent extends Omit<IEvent, "id"> {
  id?: number | undefined;
}

export interface IEventSchedule {
  id: number;
  event_id: number;
  start_time: string | null;
  end_time?: string | null;
  capacity?: number | null;
  published_time?: string | null;
  unpublished_time?: string | null;
}

export interface IPayloadEventSchedule extends Omit<IEventSchedule, "id"> {
  id?: number | undefined;
}

export interface IEventFile {
  event_id?: number;
  event?: IEvent;
  file_id?: number;
  file?: IFile;
}

export interface IEventLocation {
  event_id: number;
  event?: IEvent;
  location_id: number;
  location?: ILocation;
}

export interface IEventBooking {
  id: number;
  event?: IEvent;
  event_id: number;
  title: string;
  description?: string;
  terms?: string;
  publish_time: string;
  unpublish_time: string;
  created_at?: string;
  max?: number;
  event_booking_categories?: IEventBookingCategory[];
}

export interface IPayloadEventBooking extends Omit<IEventBooking, "id"> {
  id?: number | undefined;
}

export interface IEventCategory {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  event_booking_category?: IEventBookingCategory;
}

export interface IPayloadEventCategory extends Omit<IEventCategory, "id"> {
  id?: number | undefined;
}

export interface IEventBookingCategory {
  event_booking_id: number;
  event_bookings?: IEventBooking;
  event_category_id: number;
  event_categories?: IEventCategory;
  price?: number | null;
  final_price?: number | null;
  created_at?: string;
}

export type IPayloadEventBookingCategory = IEventBookingCategory;
