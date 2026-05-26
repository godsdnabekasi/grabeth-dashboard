"use client";

import { useAccountDetail } from "@/app/(main)/account/_hooks/use-account-detail";
import AccountForm from "@/components/page/account/form";
import PageHeader from "@/components/ui/page-header";

const AccountCreatePage = () => {
  const { isSubmitting, onSubmit } = useAccountDetail("create");

  return (
    <>
      <PageHeader title="Account Details" />
      <AccountForm
        mode="create"
        isSubmitting={isSubmitting}
        submitLabel="Create Account"
        onSubmit={onSubmit}
      />
    </>
  );
};

export default AccountCreatePage;
