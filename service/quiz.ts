import { supabaseClient } from "@/lib/supabase/client";
import { QUERY_FILE } from "@/service/file";
import { IFilterList } from "@/types";
import { IPayloadQuiz, IQuiz } from "@/types/quiz";

export const getQuizes = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient
    .from("learnings")
    .select(`*, classes(*, ${QUERY_FILE})`, {
      count: "exact",
    });

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("classes.title", `%${search}%`);
    } else if (id) {
      query.or(`classes.title.ilike.%${search}%,classes.id.eq.${id}`);
    }
  }

  const { data, error, count } = await query.returns<IQuiz[]>();

  return { data, error, count };
};

export const getQuiz = async (church_id: number) => {
  const { data, error } = await supabaseClient
    .from("learnings")
    .select(
      `
        *,
        classes(*, ${QUERY_FILE}, 
          question!question_class_id_fkey(*,
            question_answer!question_answer_question_id_fkey(*)
          ),
          class_user_answer_summary(*, user(*))
        )
      `
    )
    .eq("classes.church_id", church_id)
    .single<IQuiz>();

  return { data, error };
};

//* SUBMIT
export const upsertQuiz = async (values: IPayloadQuiz) => {
  const { data, error } = await supabaseClient
    .from("learnings")
    .upsert(values)
    .select(`*, classes(*, ${QUERY_FILE})`)
    .single<IQuiz>();
  return { data, error };
};

//* DELETE
export const deleteQuizes = async (ids: number[]) => {
  const { error } = await supabaseClient
    .from("learnings")
    .delete()
    .in("id", ids);
  return { error };
};
