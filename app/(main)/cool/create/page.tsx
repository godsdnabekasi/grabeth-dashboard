"use client";

import React from "react";

import CoolForm from "@/app/(main)/cool/_components/form";
import { useCreateCool } from "@/app/(main)/cool/_hooks/useCreateCool";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const CoolCreatePage = () => {
  const createMutation = useCreateCool();

  return (
    <>
      <PageHeader title="New COOL" />
      {createMutation.isPending ? (
        <LoadingSection />
      ) : (
        <CoolForm
          mode="create"
          isSubmitting={createMutation.isPending}
          submitLabel="Create"
          onSubmit={createMutation.mutate}
        />
      )}
    </>
  );
};

export default CoolCreatePage;
