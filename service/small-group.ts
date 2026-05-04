import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import {
  IPayloadSmallGroup,
  IPayloadSmallGroupFile,
  IPayloadSmallGroupLocation,
  IPayloadSmallGroupUser,
  ISmallGroup,
  ISmallGroupFile,
  ISmallGroupLocation,
  ISmallGroupUser,
} from "@/types/small-group";

export const getSmallGroups = async (
  filter?: IFilterList & { id?: number; church_id: number }
) => {
  const query = supabaseClient
    .from("small_group")
    .select(
      `
      *,
      small_group_location(location(*)),
      small_group_user(*, user(*)),
      small_group_file(file(link))
    `,
      { count: "exact" }
    )
    .eq("church_id", filter?.church_id)
    .is("deleted_at", null);

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

  const { data, error, count } = await query.returns<ISmallGroup[]>();
  return { data, error, count };
};

export const getSmallGroup = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("small_group")
    .select(
      `
      *,
      small_group_location(location(*)),
      small_group_user(*, user(*, user_file(file(link)))),
      small_group_file(file(link))
    `
    )
    .eq("id", id)
    .limit(1)
    .single<ISmallGroup>();
  return { data, error };
};

export const upsertSmallGroup = async (payload: IPayloadSmallGroup) => {
  const { data, error } = await supabaseClient
    .from("small_group")
    .upsert(payload)
    .select("*")
    .single<ISmallGroup>();

  return { data, error };
};

//* USER
export const upsertSmallGroupUser = async (
  payload: IPayloadSmallGroupUser[]
) => {
  const { data, error } = await supabaseClient
    .from("small_group_user")
    .upsert(payload)
    .select("*")
    .returns<ISmallGroupUser[]>();

  return { data, error };
};

export const deleteSmallGroupUser = async (
  payload: { user_id: string; small_group_id: number }[]
) => {
  const filter = payload
    .map(
      (p) =>
        `and(user_id.eq.${p.user_id},small_group_id.eq.${p.small_group_id})`
    )
    .join(",");

  const { data, error } = await supabaseClient
    .from("small_group_user")
    .delete()
    .or(filter)
    .select("*")
    .returns<ISmallGroupUser[]>();

  return { data, error };
};

//* FILE
export const upsertSmallGroupFile = async (payload: IPayloadSmallGroupFile) => {
  const { data, error } = await supabaseClient
    .from("small_group_file")
    .upsert(payload)
    .select("*")
    .single<ISmallGroupFile>();

  return { data, error };
};

//* LOCATION
export const upsertSmallGroupLocation = async (
  payload: IPayloadSmallGroupLocation
) => {
  const { data, error } = await supabaseClient
    .from("small_group_location")
    .upsert(payload)
    .select("*")
    .single<ISmallGroupLocation>();

  return { data, error };
};

export const deleteSmallGroup = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("small_group")
    .delete()
    .in("id", ids)
    .select("*");

  return { data, error };
};
