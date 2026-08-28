"use client";

import { useSnapshot } from "valtio";

import EventForm from "@/app/(main)/event/_components/form";
import { useEventDetail } from "@/app/(main)/event/_hooks/useEventDetail";
import PageHeader from "@/components/ui/page-header";
import userStore from "@/store/user";

const CreateEventPage = () => {
  const { user } = useSnapshot(userStore);
  const { isLoading, onSubmit } = useEventDetail("create");

  return (
    <>
      <PageHeader title="Create Event" />
      <EventForm
        submitLabel="Create"
        isSubmitting={isLoading.submit}
        initialValues={{
          church_id: String(user?.church_user?.church_id),
          schedules: [
            {
              date: null,
              event_id: null,
              start_time: null,
              end_time: null,
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreateEventPage;
