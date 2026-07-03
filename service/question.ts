import { supabaseClient } from "@/lib/supabase/client";
import { TPayloadQuestion } from "@/types/question";

export const upsertQuestion = async (values: TPayloadQuestion[]) => {
  const { data, error } = await supabaseClient.from("question").upsert(values);
  return { data, error };
};

//* DELETE
export const deleteQuestion = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("question")
    .delete()
    .in("id", ids);
  return { data, error };
};
