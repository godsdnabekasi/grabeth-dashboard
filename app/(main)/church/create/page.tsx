"use client";

import ChurchForm from "@/app/(main)/church/_components/form";
import { useChurchDetail } from "@/app/(main)/church/_hooks/use-church-detail";
import PageHeader from "@/components/ui/page-header";

const ChurchCreatePage = () => {
  const { isSubmitting, setDeletedMember, onSubmit } =
    useChurchDetail("create");

  return (
    <>
      <PageHeader title="Create Church" />
      <ChurchForm
        isSubmitting={isSubmitting}
        onRemoveMember={setDeletedMember}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ChurchCreatePage;
