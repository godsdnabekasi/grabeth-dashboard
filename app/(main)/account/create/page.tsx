"use client";

import { useAccountDetail } from "@/app/(main)/account/_hooks/use-account-detail";
import AccountForm from "@/components/page/account/form";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const AccountCreatePage = () => {
  const { isFetching, isSubmitting, onSubmit } = useAccountDetail("create");

  return (
    <>
      <PageHeader title="Account Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <AccountForm
          mode="create"
          isSubmitting={isSubmitting}
          submitLabel="Create Account"
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default AccountCreatePage;
