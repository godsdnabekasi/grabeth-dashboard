"use client";

import React from "react";

import ServiceForm from "@/app/(main)/service/_components/form";
import { useServiceDetail } from "@/app/(main)/service/_hooks/use-service-detail";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const ServiceDetailPage = () => {
  const { item, isFetching, isSubmitting, onSubmit, onDelete } =
    useServiceDetail({ mode: "edit" });

  return (
    <>
      <PageHeader title="Service Details" />
      {isFetching ? (
        <LoadingSection />
      ) : (
        <ServiceForm
          initialValues={item}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default ServiceDetailPage;
