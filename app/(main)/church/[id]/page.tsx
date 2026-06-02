"use client";

import { useChurchDetail } from "@/app/(main)/church/_hooks/use-church-detail";
import AccountForm from "@/components/page/church/form";
import { ISelectedMember } from "@/components/page/church/member/container";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const ChurchDetailPage = () => {
  const {
    item,
    isFetching,
    isSubmitting,
    setNewMember,
    setDeletedMember,
    handleDelete,
    onSubmit,
  } = useChurchDetail("edit");

  const onAddMember = (data: ISelectedMember[]) => {
    console.log(data);

    setNewMember((prev) => [...prev, ...data]);
  };

  return (
    <>
      <PageHeader title="Account Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <AccountForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onAddMember={onAddMember}
          onRemoveMember={setDeletedMember}
          onDelete={handleDelete}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default ChurchDetailPage;
