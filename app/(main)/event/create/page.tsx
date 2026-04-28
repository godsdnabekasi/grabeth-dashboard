"use client";

import React, { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import EventForm from "@/components/page/event/form";
import { EventFormValues } from "@/components/page/event/types";
import PageHeader from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import {
  upsertEvent,
  upsertEventFile,
  upsertEventLocation,
} from "@/service/event";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import userStore from "@/store/user";

const CreateEventPage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (formData: EventFormValues) => {
      try {
        setIsLoading(true);
        const { date, cover_image, location, ...restFormData } = formData;
        let fileId = null;
        const start_time =
          formatDate(date!, "YYYY-MM-DD") +
          "T" +
          restFormData.start_time +
          ":00+07:00";
        const end_time =
          formatDate(date!, "YYYY-MM-DD") +
          "T" +
          restFormData.end_time +
          ":00+07:00";

        const { data, error } = await upsertEvent({
          ...restFormData,
          church_id: Number(user?.church_user?.church_id),
          start_time,
          end_time,
          publish_time: String(restFormData.publish_time?.toISOString()),
          unpublish_time: String(restFormData.unpublish_time?.toISOString()),
        });
        if (error) throw error;

        if (typeof cover_image === "object") {
          const { data, error } = await uploadFileToStorage({
            bucket: "images",
            file: cover_image,
            filePath: `event/${user?.church_user?.church_id}/${formData.name}_${Date.now()}.${cover_image.name.split(".")[1]}`,
          });
          if (error) throw error;

          const { data: fileData, error: fileError } = await uploadFile({
            name: data?.path || "-",
            type: "image",
            link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data?.fullPath || "-"}`,
          });
          if (fileError) throw fileError;
          fileId = fileData?.id;
        }

        if (fileId) {
          await upsertEventFile({
            event_id: data?.id,
            file_id: fileId,
          });
        }

        if (location && location.name) {
          const { data: locationData } = await upsertLocation({
            id: location?.id ? Number(location.id) : undefined,
            name: location?.name,
            address: location?.address || "",
            long_lat: [
              String(location?.lng) || "",
              String(location?.lat) || "",
            ],
            type: "building",
          });

          if (!formData.location?.id && locationData) {
            await upsertEventLocation({
              event_id: data!.id,
              location_id: Number(locationData.id),
            });
          }
        }
        toast.success("Successfully created");
        router.back();
      } catch {
        toast.error("Failed create event");
      } finally {
        setIsLoading(false);
      }
    },
    [router, user?.church_user?.church_id]
  );

  return (
    <>
      <PageHeader title="Create Event" />
      <EventForm
        submitLabel="Create"
        isSubmitting={isLoading}
        initialValues={{
          church_id: String(user?.church_user?.church_id),
        }}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreateEventPage;
