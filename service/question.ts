import { supabaseClient } from "@/lib/supabase/client";
import { TPayloadQuestion, TPayloadQuestionAnswer } from "@/types/question";

export const upsertQuestion = async (values: TPayloadQuestion[]) => {
  const { data, error } = await supabaseClient
    .from("question")
    .upsert(values)
    .select("*");
  return { data, error };
};

export const upsertQuestionAnswer = async (
  values: TPayloadQuestionAnswer[]
) => {
  const { data, error } = await supabaseClient
    .from("question_answer")
    .upsert(values)
    .select("*");
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
