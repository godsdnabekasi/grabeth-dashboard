import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { IClasses } from "@/types/class";

export const getClasses = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient
    .from("classes")
    .select(`*, file:file_id(*), thumbnail_file:thumbnail_file_id(*)`, {
      count: "exact",
    });

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("title", `%${search}%`);
    } else if (id) {
      query.or(`title.ilike.%${search}%,id.eq.${id}`);
    }
  }

  const { data, error, count } = await query.returns<IClasses[]>();

  return { data, error, count };
};

export const getClass = async (id: number) => {
  const { data, error } = await supabaseClient
    .from("classes")
    .select(
      `*, file:file_id(*), thumbnail:thumbnail_file_id(*), question!question_class_id_fkey(*), forms(*)`
    )
    .eq("id", id)
    .single<IClasses>();

  return { data: data as IClasses, error };
};

//* SUBMIT
export const upsertClasses = async (values: Partial<IClasses>) => {
  const { data, error } = await supabaseClient
    .from("classes")
    .upsert(values)
    .select(`*, file:file_id(*), thumbnail_file:thumbnail_file_id(*), forms(*)`)
    .single<IClasses>();
  return { data, error };
};

//* DELETE
export const deleteClasses = async (ids: number[]) => {
  const { error } = await supabaseClient.from("classes").delete().in("id", ids);
  return { error };
};
