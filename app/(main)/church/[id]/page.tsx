"use client";

import { useChurchDetail } from "@/app/(main)/church/_hooks/use-church-detail";
import AccountForm from "@/components/page/church/form";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const ChurchDetailPage = () => {
  const { item, isFetching, isSubmitting, handleDelete, onSubmit } =
    useChurchDetail("edit");

  return (
    <>
      <PageHeader title="Account Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <AccountForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onDelete={handleDelete}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default ChurchDetailPage;
