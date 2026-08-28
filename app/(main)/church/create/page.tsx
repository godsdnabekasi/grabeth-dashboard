"use client";

import AccountForm from "@/app/(main)/church/_components/form";
import { useChurchDetail } from "@/app/(main)/church/_hooks/use-church-detail";
import PageHeader from "@/components/ui/page-header";

const ChurchCreatePage = () => {
  const { isSubmitting, setDeletedMember, onSubmit } =
    useChurchDetail("create");

  return (
    <>
      <PageHeader title="Account Details" />
      <AccountForm
        isSubmitting={isSubmitting}
        onRemoveMember={setDeletedMember}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ChurchCreatePage;
