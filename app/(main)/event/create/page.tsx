"use client";

import React, { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import EventForm from "@/components/page/event/form";
import { EventFormValues } from "@/components/page/event/types";
import PageHeader from "@/components/ui/page-header";
import { upsertEvent } from "@/service/event";

const CreateEventPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (formData: EventFormValues) => {
      try {
        setIsLoading(true);
        const { date, ...data } = formData;
        const start_time = date + " " + data.start_time;
        const end_time = date + " " + data.end_time;
        const { error } = await upsertEvent({
          ...data,
          church_id: Number(data.church_id),
          start_time,
          end_time,
        });
        if (error) throw error;
        toast.success("Successfully created");
        router.back();
      } catch {
        toast.error("Failed create event");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <>
      <PageHeader title="Create Event" />
      <EventForm
        submitLabel="Create"
        isSubmitting={isLoading}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreateEventPage;
