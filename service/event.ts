import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import {
  IEvent,
  IEventFile,
  IEventLocation,
  IPayloadEvent,
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
    .select("*, event_location(location(*)), event_file(file(link))")
    .eq("id", id)
    .limit(1)
    .single<IEvent>();
  return { data, error };
};

export const upsertEvent = async (payload: IPayloadEvent) => {
  const { data, error } = await supabaseClient
    .from("event")
    .upsert(payload)
    .select("*");

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
