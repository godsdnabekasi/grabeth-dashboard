import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { IChurch, IChurchUser } from "@/types/church";

export const getChurches = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient.from("church").select("*");

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("name", `%${search}%`);
    } else if (id) {
      query.or(`name.ilike.%${search}%,id.eq.${id}`);
    }
  }

  const { data, error } = await query.returns<IChurch[]>();

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
      user(*, small_group_user(*), user_file(*, file(*)))
      `
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
