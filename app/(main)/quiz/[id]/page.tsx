"use client";

import React from "react";

import ServiceForm from "@/app/(main)/quiz/_components/form";
import { useQuizDetail } from "@/app/(main)/quiz/_hooks/use-quiz-detail";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const QuizDetailPage = () => {
  const { item, isFetching, isSubmitting, onSubmit, onDelete } = useQuizDetail({
    mode: "edit",
  });

  return (
    <>
      <PageHeader title="Quiz Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <ServiceForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default QuizDetailPage;
