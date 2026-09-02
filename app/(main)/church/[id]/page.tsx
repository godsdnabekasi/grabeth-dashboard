"use client";

import ChurchForm from "@/app/(main)/church/_components/form";
import { useChurchDetail } from "@/app/(main)/church/_hooks/use-church-detail";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const ChurchDetailPage = () => {
  const {
    item,
    isFetching,
    isSubmitting,
    setDeletedMember,
    handleDelete,
    onSubmit,
  } = useChurchDetail("edit");

  return (
    <>
      <PageHeader title="Church Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <ChurchForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onRemoveMember={setDeletedMember}
          onDelete={handleDelete}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default ChurchDetailPage;
