"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ServiceFormValues } from "@/app/(main)/quiz/_types/form";
import { formatDate } from "@/lib/utils";
import { deleteClasses, upsertClasses } from "@/service/class";
import { uploadImage } from "@/service/file";
import {
  deleteQuestion,
  upsertQuestion,
  upsertQuestionAnswer,
} from "@/service/question";
import { getQuiz, upsertQuiz } from "@/service/quiz";
// import { deleteClasses, getClass, upsertClasses } from "@/quiz/class";
// import { uploadImage } from "@/quiz/file";
// import { getForm, upsertForm } from "@/quiz/form";
// import { deleteQuestion, upsertQuestion } from "@/quiz/question";
import userStore from "@/store/user";
import { IClasses } from "@/types/class";
import { TQuestionType } from "@/types/question";
import { IQuiz } from "@/types/quiz";

interface IProps {
  mode: "edit" | "create";
}

type QuestionValue = ServiceFormValues["question"][number];
type QuestionPayload = QuestionValue & {
  class_id: number;
  type: TQuestionType;
  order: number;
};

/** Uploads a new photo (if one was picked) and returns the resulting file id. */
async function resolvePhotoFileId(
  photo: ServiceFormValues["photo"],
  churchId: ServiceFormValues["church_id"]
) {
  if (typeof photo === "string" || !photo) return undefined;

  const { data, error } = await uploadImage({
    file: photo,
    path: `service/${churchId}/${Date.now()}`,
  });
  if (error) throw error;

  return data?.id;
}

/** Normalizes form questions into DB-ready payloads (ordering, type, option values). */
function buildQuestionPayloads(
  questions: ServiceFormValues["question"],
  classId: number
): QuestionPayload[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return questions.map(({ answer, ...question }, index) => ({
    ...question,
    class_id: classId,
    type: question.type as TQuestionType,
    order: index + 1,
    detail: question.detail && {
      ...question.detail,
      options: question.detail?.options?.map((option) => ({
        ...option,
        value: option.label?.toLowerCase().trim().replace(/ /g, "_"),
      })),
    },
  }));
}

/** Splits submitted questions into update / insert groups, and finds removed ones. */
function partitionQuestions(
  submitted: QuestionPayload[],
  existing: Partial<ServiceFormValues>["question"]
) {
  const toUpdate = submitted.filter((q) => q.id);
  const toInsert = submitted.filter((q) => !q.id);
  const toDelete =
    existing
      ?.filter((s) => !submitted.some((q) => q.id === s.id))
      .map((s) => s.id!) ?? [];

  return { toUpdate, toInsert, toDelete };
}

export const useQuizDetail = ({ mode }: IProps) => {
  const { user } = useSnapshot(userStore);
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? Number(params.id) : null;
  const churchId = user?.church_user?.church_id;

  const [quiz, setQuiz] = useState<IQuiz>();
  const [item, setItem] = useState<Partial<ServiceFormValues>>({});
  const [isFetching, setIsFetching] = useState(id !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      const { data, error } = await getQuiz(id);
      if (error) throw error;
      if (!data) return;

      setQuiz(data);
      setItem({
        id: data.class_id,
        name: data.classes.title,
        description: data.classes.description,
        published_at:
          data.classes.published_at &&
          new Date(formatDate(data.classes.published_at)),
        unpublished_at:
          data.classes.unpublished_at &&
          new Date(formatDate(data.classes.unpublished_at)),
        photo: data.classes.file?.link,
        church_id: String(data.classes.church_id) || String(churchId),
        question: data.classes.question?.map((q) => ({
          ...q,
          point: q.point ?? undefined,
          detail: q.detail
            ? {
                ...q.detail,
                options: q.detail.options ?? [],
              }
            : undefined,
        })),
      });
    } catch {
      toast.error("Oops, something went wrong");
    } finally {
      setIsFetching(false);
    }
  }, [id, churchId]);

  const onSubmit = useCallback(
    async (values: ServiceFormValues) => {
      console.log(values);

      try {
        setIsSubmitting(true);
        const fileId = await resolvePhotoFileId(values.photo, values.church_id);
        const classPayload: Partial<IClasses> = {
          id: values.id,
          title: values.name,
          description: values.description,
          file_id: fileId,
          published_at: new Date(values.published_at!),
          unpublished_at: new Date(values.unpublished_at!),
          church_id: churchId,
        };
        const { data: classData, error: classError } =
          await upsertClasses(classPayload);
        if (classError) throw classError;

        //* FORM
        if (classData) {
          const { error: formError } = await upsertQuiz({
            id: quiz?.id,
            class_id: classData.id,
            is_private: false,
          });
          if (formError) throw formError;
        }

        //* QUESTIONS
        const questionPayloads = buildQuestionPayloads(
          values.question,
          Number(values.id || classData?.id)
        );
        const { toUpdate, toInsert, toDelete } = partitionQuestions(
          questionPayloads,
          item.question
        );
        if (toUpdate.length > 0) {
          const { error } = await upsertQuestion(toUpdate);
          if (error) throw error;
          const { error: errorAnswer } = await upsertQuestionAnswer(
            toUpdate.map((v) => {
              return {
                question_id: v.id!,
                type: v.type,
                answer: v.correct_answer ?? "",
              };
            })
          );
          if (errorAnswer) throw errorAnswer;
        }
        if (toInsert.length > 0) {
          const { data, error } = await upsertQuestion(toInsert);
          if (error) throw error;
          const { error: errorAnswer } = await upsertQuestionAnswer(
            toInsert.map((v, i) => {
              return {
                question_id: data![i].id,
                type: v.type,
                answer: v.correct_answer ?? "",
              };
            })
          );
          if (errorAnswer) throw errorAnswer;
        }
        if (toDelete.length > 0) {
          const { error } = await deleteQuestion(toDelete);
          if (error) throw error;
        }
        if (mode === "create") {
          toast.success("Quize created successfully");
          router.push("/quize");
          return;
        }
        toast.success("Quize updated successfully");
        fetchItem();
      } catch {
        toast.error("Oops, something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [churchId, item.question, mode, fetchItem, quiz?.id, router]
  );

  const onDelete = useCallback(async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      const { error } = await deleteClasses([id]);
      if (error) throw error;
      toast.success("Service deleted successfully");
      router.back();
    } catch {
      toast.error("Oops, something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    isFetching,
    isSubmitting,
    onSubmit,
    onDelete,
  };
};
