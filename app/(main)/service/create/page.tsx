"use client";

import ServiceForm from "@/app/(main)/service/_components/form";
import { useServiceDetail } from "@/app/(main)/service/_hooks/use-service-detail";
import PageHeader from "@/components/ui/page-header";

const ServiceCreatePage = () => {
  const { isSubmitting, onSubmit } = useServiceDetail({ mode: "create" });

  return (
    <>
      <PageHeader title="Service Details" />
      <ServiceForm
        isSubmitting={isSubmitting}
        submitLabel="Create Service"
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ServiceCreatePage;
