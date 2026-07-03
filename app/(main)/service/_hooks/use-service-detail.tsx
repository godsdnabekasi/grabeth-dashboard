"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ServiceFormValues } from "@/app/(main)/service/_types/form";
import { formatDate } from "@/lib/utils";
import { deleteClasses, getClass, upsertClasses } from "@/service/class";
import { uploadImage } from "@/service/file";
import { deleteQuestion, upsertQuestion } from "@/service/question";
import userStore from "@/store/user";
import { IClasses } from "@/types/class";
import { TQuestionType } from "@/types/question";

interface IProps {
  mode: "edit" | "create";
}

export const useServiceDetail = ({ mode }: IProps) => {
  const { user } = useSnapshot(userStore);
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? Number(params?.id) : null;

  const [item, setItem] = useState<Partial<ServiceFormValues>>({});
  const [isFetching, setIsFetching] = useState(id !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      setIsSubmitting(true);
      let file_id;
      if (typeof values.photo !== "string") {
        const { data: uploadData, error: uploadError } = await uploadImage({
          file: values.photo,
          path: `service/${values.church_id}/${Date.now()}`,
        });
        if (uploadError) throw uploadError;
        file_id = uploadData?.id;
      }

      const data: Partial<IClasses> = {
        id: values.id,
        title: values.name,
        description: values.description,
        file_id: file_id,
        published_at: new Date(values.published_at!),
        unpublished_at: new Date(values.unpublished_at!),
        church_id: user?.church_user?.church_id,
      };
      const { error } = await upsertClasses(data);
      if (error) throw error;

      //* QUESTIONS
      const questions = values.question.map((q, i) => ({
        ...q,
        class_id: Number(values.id),
        type: q.type as TQuestionType,
        order: i + 1,
        detail: {
          ...q.detail,
          options: q.detail?.options?.map((d) => ({
            ...d,
            value: d.label?.toLowerCase().trim().replace(/ /g, "_"),
          })),
        },
      }));
      const updateQuestions = questions.filter((q) => q.id);
      const newQuestions = questions.filter((q) => !q.id);
      const deletedQuestions =
        item?.question
          ?.filter((s) => !questions?.some((service) => service.id === s.id))
          .map((s) => s.id!) || [];

      if (updateQuestions.length > 0) {
        const { error: questionUpdateError } =
          await upsertQuestion(updateQuestions);
        if (questionUpdateError) throw questionUpdateError;
      }

      if (newQuestions.length > 0) {
        const { error: questionInsertError } =
          await upsertQuestion(newQuestions);
        if (questionInsertError) throw questionInsertError;
      }

      if (deletedQuestions?.length > 0) {
        const { error: questionDeleteError } =
          await deleteQuestion(deletedQuestions);
        if (questionDeleteError) throw questionDeleteError;
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
  };

  const fetchItem = useCallback(async () => {
    if (!id) return;

    setIsFetching(true);
    try {
      const { data, error } = await getClass(id);
      if (error) throw error;
      if (data) {
        setItem({
          ...data,
          name: data.title,
          published_at:
            data.published_at && new Date(formatDate(data.published_at)),
          unpublished_at:
            data.unpublished_at && new Date(formatDate(data.unpublished_at)),
          photo: data.file?.link,
          church_id:
            String(data.church_id) || String(user?.church_user?.church_id),
          question: data.question?.map((q) => ({
            ...q,
            detail: q.detail
              ? { ...q.detail, options: q.detail.options ?? [] }
              : undefined,
          })),
        });
      }
    } catch {
      toast.error("Oops, something went wrong");
    } finally {
      setIsFetching(false);
    }
  }, [id, user?.church_user?.church_id]);

  const onDelete = useCallback(async () => {
    try {
      if (!id) return;
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
