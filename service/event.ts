import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import {
  IEvent,
  IEventBooking,
  IEventBookingCategory,
  IEventCategory,
  IEventFile,
  IEventLocation,
  IPayloadEvent,
  IPayloadEventBooking,
  IPayloadEventBookingCategory,
  IPayloadEventCategory,
} from "@/types/event";

export const getEvents = async (
  filter?: IFilterList & { id?: number; church_id: number }
) => {
  const query = supabaseClient
    .from("event")
    .select("*, event_file(file(link))", { count: "exact" })
    .eq("church_id", filter?.church_id);

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("name", `%${search}%`);
    } else if (id) {
      query.or(`name.ilike.%${search}%,id.eq.${id}`);
    }
    if (filter.page && filter.pageSize) {
      query
        .range(
          (filter.page - 1) * filter.pageSize,
          filter.page * filter.pageSize - 1
        )
        .limit(filter.pageSize);
    }
  }

  const { data, error, count } = await query.returns<IEvent[]>();
  return { data, error, count };
};

export const getEvent = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("event")
    .select(
      `
      *,
      event_location(location(*)),
      event_file(file(link)),
      event_bookings(*, event_booking_categories(*, event_categories(*)))
    `
    )
    .eq("id", id)
    .limit(1)
    .single<IEvent>();
  return { data, error };
};

export const upsertEvent = async (payload: IPayloadEvent) => {
  const { data, error } = await supabaseClient
    .from("event")
    .upsert(payload)
    .select("*")
    .single<IEvent>();

  return { data, error };
};

export const upsertEventFile = async (payload: IEventFile) => {
  const { data, error } = await supabaseClient
    .from("event_file")
    .upsert(payload)
    .select("*")
    .single<IEventFile>();

  return { data, error };
};

export const upsertEventLocation = async (payload: IEventLocation) => {
  const { data, error } = await supabaseClient
    .from("event_location")
    .upsert(payload)
    .select("*")
    .single<IEventLocation>();

  return { data, error };
};

export const deleteEvent = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("event")
    .delete()
    .in("id", ids)
    .select("*");

  return { data, error };
};

//* Event Booking
export const upsertEventBooking = async (payload: IPayloadEventBooking[]) => {
  const { data, error } = await supabaseClient
    .from("event_bookings")
    .upsert(payload)
    .select("*")
    .returns<IEventBooking[]>();

  return { data, error };
};

export const deleteEventBooking = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("event_bookings")
    .delete()
    .in("id", ids)
    .select("*");

  return { data, error };
};

//* Event Category
export const upsertEventCategory = async (payload: IPayloadEventCategory[]) => {
  const { data, error } = await supabaseClient
    .from("event_categories")
    .upsert(payload)
    .select("*")
    .returns<IEventCategory[]>();

  return { data, error };
};

export const deleteEventCategory = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("event_categories")
    .delete()
    .in("id", ids)
    .select("*");

  return { data, error };
};

//* Event Booking Category
export const upsertEventBookingCategory = async (
  payload: IPayloadEventBookingCategory[]
) => {
  const { data, error } = await supabaseClient
    .from("event_booking_categories")
    .upsert(payload)
    .select("*")
    .returns<IEventBookingCategory[]>();

  return { data, error };
};

export const deleteEventBookingCategory = async (
  pairs: {
    event_booking_id: number;
    event_category_id: number;
  }[]
) => {
  const filter = pairs
    .map(
      (p) =>
        `and(event_booking_id.eq.${p.event_booking_id},event_category_id.eq.${p.event_category_id})`
    )
    .join(",");

  const { data, error } = await supabaseClient
    .from("event_booking_categories")
    .delete()
    .or(filter)
    .select("*")
    .returns<IEventBookingCategory[]>();

  return { data, error };
};
