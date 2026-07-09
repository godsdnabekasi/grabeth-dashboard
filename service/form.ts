import { supabaseClient } from "@/lib/supabase/client";
import { QUERY_FILE } from "@/service/file";
import { IFilterList } from "@/types";
import { IForm, IPayloadForm } from "@/types/form";

export const getForms = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient
    .from("forms")
    .select(`*, classes(*, ${QUERY_FILE})`, {
      count: "exact",
    });

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("forms.title", `%${search}%`);
    } else if (id) {
      query.or(`forms.title.ilike.%${search}%,forms.id.eq.${id}`);
    }
  }

  const { data, error, count } = await query.returns<IForm[]>();

  return { data, error, count };
};

export const getForm = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("forms")
    .select(`*, classes(*, question(*), ${QUERY_FILE})`)
    .eq("id", id)
    .single<IForm>();

  return { data, error };
};

export const upsertForm = async (values: IPayloadForm) => {
  const { data, error } = await supabaseClient
    .from("form")
    .upsert(values)
    .select("*")
    .returns<IForm[]>();

  return { data, error };
};
