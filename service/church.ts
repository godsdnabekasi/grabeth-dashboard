import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import {
  IChurch,
  IChurchFile,
  IChurchLocation,
  IChurchUser,
  IPayloadChurch,
  IPayloadChurchFile,
  IPayloadChurchLocation,
} from "@/types/church";
import { QUERY_LOCATION } from "@/types/location";

export const getChurches = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient
    .from("church")
    .select(`*, church_file(file(link))`, { count: "exact" });

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("name", `%${search}%`);
    } else if (id) {
      query.or(`name.ilike.%${search}%,id.eq.${id}`);
    }
  }

  const { data, error, count } = await query.returns<IChurch[]>();

  return { data, error, count };
};

export const getChurchById = async (id: number) => {
  const query = supabaseClient.from("church").select(`
        *,
        church_file(file(link)),
        church_location(*, ${QUERY_LOCATION})
      `);

  const { data, error } = await query.eq("id", id).single<IChurch>();

  return { data, error };
};

export const getChurchUsers = async (
  filter?: IFilterList & { church_id?: number }
) => {
  const query = supabaseClient
    .from("church_user")
    .select(
      `
        *,
        user(*,
          small_group_user(*),
          user_file(*, file(*)),
          user_contact(*, contact(*))
        )
      `,
      {
        count: "exact",
      }
    )
    .eq("church_id", filter?.church_id)
    .not("user", "is", null)
    .is("user.small_group_user", null);

  if (filter) {
    const { search, page, pageSize } = filter;
    if (search) {
      query.ilike("user.name", `%${search}%`);
    }

    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query.range(from, to);
    }
  }

  const { data, error, count } = await query
    .returns<IChurchUser[]>()
    .order("created_at", { ascending: false });

  return { data, error, count };
};

//* INSERT
export const upsertChurch = async (payload: IPayloadChurch) => {
  const { data, error } = await supabaseClient
    .from("church")
    .upsert(payload)
    .select("*")
    .single<IChurch>();

  return { data, error };
};

export const upsertChurchFile = async (payload: IPayloadChurchFile) => {
  const { data, error } = await supabaseClient
    .from("church_file")
    .upsert(payload)
    .select("*, file(link)")
    .single<IChurchFile>();

  return { data, error };
};

export const upsertChurchLocation = async (payload: IPayloadChurchLocation) => {
  const { data, error } = await supabaseClient
    .from("church_location")
    .upsert(payload)
    .select("*")
    .single<IChurchLocation>();

  return { data, error };
};

//* DELETE
export const deleteChurchs = async (ids: number[]) => {
  const query = supabaseClient.from("church").delete().in("id", ids);

  const { error } = await query.returns<IChurch[]>();
  return { error };
};
