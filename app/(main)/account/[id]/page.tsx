"use client";

import { useAccountDetail } from "@/app/(main)/account/_hooks/use-account-detail";
import AccountForm from "@/components/page/account/form";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const AccountDetailPage = () => {
  const { item, isFetching, isSubmitting, onSubmit } = useAccountDetail();

  return (
    <>
      <PageHeader title="Account Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <AccountForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default AccountDetailPage;
