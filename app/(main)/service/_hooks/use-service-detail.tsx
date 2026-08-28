"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ServiceFormValues } from "@/app/(main)/service/_types/form";
import { formatDate } from "@/lib/utils";
import { deleteClasses, getClass, upsertClasses } from "@/service/class";
import { uploadImage } from "@/service/file";
import { upsertForm } from "@/service/form";
import { deleteQuestion, upsertQuestion } from "@/service/question";
import userStore from "@/store/user";
import { IClasses } from "@/types/class";
import { TQuestionType } from "@/types/question";

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
  if (typeof photo === "string") return undefined;

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
  return questions.map((question, index) => ({
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

export const useServiceDetail = ({ mode }: IProps) => {
  const { user } = useSnapshot(userStore);
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? Number(params.id) : null;
  const churchId = user?.church_user?.church_id;

  const [service, setService] = useState<IClasses>();
  const [item, setItem] = useState<Partial<ServiceFormValues>>({});
  const [isFetching, setIsFetching] = useState(id !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      const { data, error } = await getClass(id);
      if (error) throw error;
      if (!data) return;

      setService(data);
      setItem({
        ...data,
        name: data.title,
        published_at:
          data.published_at && new Date(formatDate(data.published_at)),
        unpublished_at:
          data.unpublished_at && new Date(formatDate(data.unpublished_at)),
        photo: data.file?.link,
        thumbnail: data.thumbnail?.link,
        church_id: String(data.church_id) || String(churchId),
        question: data.question?.map((q) => ({
          ...q,
          detail: q.detail
            ? { ...q.detail, options: q.detail.options ?? [] }
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

        const fileId =
          values.photo && typeof values.photo !== "string"
            ? await resolvePhotoFileId(values.photo, values.church_id)
            : service?.file_id;
        const thumbnailFileId =
          values.thumbnail && typeof values.thumbnail !== "string"
            ? await resolvePhotoFileId(values.thumbnail, values.church_id)
            : service?.thumbnail_file_id;

        const classPayload: Partial<IClasses> = {
          id: values.id,
          title: values.name,
          description: values.description,
          file_id: fileId,
          thumbnail_file_id: thumbnailFileId,
          published_at: new Date(values.published_at!),
          unpublished_at: values.unpublished_at
            ? new Date(values.unpublished_at!)
            : null,
          church_id: churchId,
        };
        const { data: classData, error: classError } =
          await upsertClasses(classPayload);
        if (classError) throw classError;

        //* FORM
        if (classData) {
          const { error: formError } = await upsertForm({
            id: classData?.forms?.id,
            class_id: values.id || classData.id,
            is_private: false,
          });
          if (formError) throw formError;
        }

        //* QUESTIONS
        const questionPayloads = buildQuestionPayloads(
          values.question,
          values.id ? Number(values.id) : classData!.id
        );
        const { toUpdate, toInsert, toDelete } = partitionQuestions(
          questionPayloads,
          item.question
        );

        if (toUpdate.length > 0) {
          const { error } = await upsertQuestion(toUpdate);
          if (error) throw error;
        }
        if (toInsert.length > 0) {
          const { error } = await upsertQuestion(toInsert);
          if (error) throw error;
        }
        if (toDelete.length > 0) {
          const { error } = await deleteQuestion(toDelete);
          if (error) throw error;
        }

        toast.success("Service updated successfully");
        if (mode === "create") {
          router.push("/service");
        }
        fetchItem();
      } catch {
        toast.error("Oops, something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      service?.file_id,
      service?.thumbnail_file_id,
      churchId,
      item.question,
      mode,
      fetchItem,
      router,
    ]
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
