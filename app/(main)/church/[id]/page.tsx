"use client";

import AccountForm from "@/app/(main)/church/_components/form";
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
      <PageHeader title="Account Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <AccountForm
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
