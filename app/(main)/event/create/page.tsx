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
  upsertEventBooking,
  upsertEventBookingCategory,
  upsertEventCategory,
  upsertEventFile,
  upsertEventLocation,
} from "@/service/event";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import userStore from "@/store/user";
import { IEventBookingCategory } from "@/types/event";

const CreateEventPage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (formData: EventFormValues) => {
      try {
        setIsLoading(true);
        const { date, cover_image, location, tickets, ...restFormData } =
          formData;
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
        const eventId = data!.id;

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
            long_lat:
              location?.lng && location?.lat
                ? [Number(location.lng), Number(location.lat)]
                : undefined,
            type: "building",
          });

          if (!formData.location?.id && locationData) {
            await upsertEventLocation({
              event_id: data!.id,
              location_id: Number(locationData?.id),
            });
          }
        }

        //* EVENT BOOKING
        const ticketIdMap: Record<string, number> = {};
        const existsTicket = tickets?.filter((t) => t.id) || [];
        const newTicket = tickets?.filter((t) => !t.id) || [];

        existsTicket.forEach((t) => {
          if (t.id) ticketIdMap[t.title!] = t.id;
        });

        await Promise.all([
          existsTicket.length > 0 &&
            upsertEventBooking(
              existsTicket.map((t) => ({
                event_id: eventId,
                title: t.title!,
                description: t.description || "",
                terms: t.terms || "",
                publish_time: String(restFormData.publish_time?.toISOString()),
                unpublish_time: String(
                  restFormData.unpublish_time?.toISOString()
                ),
              }))
            ),

          (async () => {
            if (newTicket.length === 0) return;
            const { data } = await upsertEventBooking(
              newTicket.map((t) => ({
                event_id: eventId,
                title: t.title!,
                description: t.description || "",
                terms: t.terms || "",
                publish_time: String(restFormData.publish_time?.toISOString()),
                unpublish_time: String(
                  restFormData.unpublish_time?.toISOString()
                ),
              }))
            );
            data?.forEach((t) => {
              ticketIdMap[t.title] = t.id;
            });
          })(),
        ]);

        //* EVENT CATEGORY
        const categoriesFlatten =
          tickets?.flatMap((t) =>
            t.categories?.map((c) => ({ ...c, ticketTitle: t.title }))
          ) || [];

        const categoryIdMap: Record<string, number> = {};
        const newCategory = categoriesFlatten.filter((c) => !c?.id);

        if (newCategory.length === 0) return;
        const { data: categoryData } = await upsertEventCategory(
          newCategory.map((c) => ({
            event_id: eventId,
            title: c?.title ?? "",
            description: c?.description ?? "",
          }))
        );
        categoryData?.forEach((c) => {
          categoryIdMap[c.title] = c.id;
        });

        //* EVENT BOOKING CATEGORY
        const bookingCategoryRows: IEventBookingCategory[] = [];
        tickets?.forEach((t) => {
          const tId = t.id || (t.title ? ticketIdMap[t.title] : null);
          if (!tId) return;

          t.categories?.forEach((c) => {
            const cId = c.id || (c.title ? categoryIdMap[c.title] : null);
            if (!cId) return;

            bookingCategoryRows.push({
              event_booking_id: tId,
              event_category_id: cId,
              price: c.price ?? null,
              final_price: c.final_price ?? null,
            });
          });
        });

        if (bookingCategoryRows.length > 0) {
          await upsertEventBookingCategory(bookingCategoryRows);
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
