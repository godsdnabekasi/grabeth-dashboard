"use client";

import { useEffect } from "react";

import { useEventDetail } from "../_hooks/useEventDetail";
import EventForm from "@/app/(main)/event/_components/form";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const EventDetailPage = () => {
  const { item, isLoading, fetchItem, onSubmit } = useEventDetail("edit");

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return (
    <>
      <PageHeader title="Event Detail" />
      {isLoading.fetch ? (
        <LoadingSection />
      ) : (
        <EventForm
          initialValues={item}
          isSubmitting={isLoading.submit}
          submitLabel="Update"
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default EventDetailPage;
