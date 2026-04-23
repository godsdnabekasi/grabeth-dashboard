import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { IChurch } from "@/types/church";

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
