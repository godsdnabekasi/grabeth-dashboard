import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { IForm, IPayloadForm } from "@/types/form";

export const getForms = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient
    .from("forms")
    .select(
      `*, classes(*, file:file_id(*), thumbnail_file:thumbnail_file_id(*))`,
      {
        count: "exact",
      }
    );

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
    .select(
      `*, classes(*, question(*), file:file_id(*), thumbnail_file:thumbnail_file_id(*))`
    )
    .eq("id", id)
    .single<IForm>();

  return { data, error };
};

export const upsertForm = async (values: IPayloadForm) => {
  const { data, error } = await supabaseClient
    .from("forms")
    .upsert(values)
    .select("*")
    .returns<IForm[]>();

  return { data, error };
};
