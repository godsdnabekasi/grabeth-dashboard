"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import EventForm from "@/components/page/event/form";
import { EventFormValues } from "@/components/page/event/types";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";
import { formatDate, formatTime } from "@/lib/utils";
import {
  getEvent,
  upsertEvent,
  upsertEventFile,
  upsertEventLocation,
} from "@/service/event";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import userStore from "@/store/user";

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useSnapshot(userStore);
  const [item, setItem] = useState<EventFormValues | undefined>();
  const [isLoading, setIsLoading] = useState({
    submit: false,
    fetch: false,
  });

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, fetch: true }));
      const { data, error } = await getEvent(Number(id));
      if (error) throw error;

      if (data) {
        setItem({
          name: data.name || "",
          date: data.start_time ? new Date(data.start_time) : null,
          start_time: data.start_time ? formatTime(data.start_time) : "",
          end_time: data.end_time ? formatTime(data.end_time) : "",
          publish_time: data.publish_time ? new Date(data.publish_time) : null,
          unpublish_time: data.unpublish_time
            ? new Date(data.unpublish_time)
            : null,
          church_id: String(data?.church_id),
          cover_image: data.event_file?.file?.link,
          location:
            data.event_location && data.event_location?.length > 0
              ? {
                  id: Number(data.event_location?.[0].location?.id),
                  name: data.event_location?.[0].location?.name,
                  address: data.event_location?.[0].location?.address,
                  lat: Number(data.event_location?.[0].location?.long_lat?.[1]),
                  lng: Number(data.event_location?.[0].location?.long_lat?.[0]),
                }
              : undefined,
        });
      }
      setIsLoading((prev) => ({ ...prev, fetch: false }));
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to fetch event");
    } finally {
      setIsLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [id]);

  const onSubmit = useCallback(
    async (formData: EventFormValues) => {
      console.log(formData);

      try {
        setIsLoading((prev) => ({ ...prev, submit: true }));
        const { date, cover_image, location, ...restFormData } = formData;
        let fileId = null;

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
        const { error } = await upsertEvent({
          ...restFormData,
          id: Number(id),
          church_id: Number(user?.church_user?.church_id),
          start_time,
          end_time,
          publish_time: String(restFormData.publish_time),
          unpublish_time: String(restFormData.unpublish_time),
        });
        if (error) throw error;

        if (fileId) {
          await upsertEventFile({
            event_id: Number(id),
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
              event_id: Number(id),
              location_id: Number(locationData.id),
            });
          }
        }

        toast.success("Successfully updated");
        router.back();
      } catch {
        toast.error("Failed update event");
      } finally {
        setIsLoading((prev) => ({ ...prev, submit: false }));
      }
    },
    [id, router, user?.church_user?.church_id]
  );

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
