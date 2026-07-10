"use client";

import QuizForm from "@/app/(main)/quiz/_components/form";
import { useQuizDetail } from "@/app/(main)/quiz/_hooks/use-quiz-detail";
import PageHeader from "@/components/ui/page-header";

const QuizCreatePage = () => {
  const { isSubmitting, onSubmit } = useQuizDetail({ mode: "create" });

  return (
    <>
      <PageHeader title="Quiz Details" />
      <QuizForm
        isSubmitting={isSubmitting}
        submitLabel="Create Quiz"
        onSubmit={onSubmit}
      />
    </>
  );
};

export default QuizCreatePage;
