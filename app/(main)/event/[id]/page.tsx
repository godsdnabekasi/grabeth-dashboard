"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import EventForm from "@/components/page/event/form";
import { EventFormValues } from "@/components/page/event/types";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";
import { formatDate, formatTime } from "@/lib/utils";
import {
  deleteEventBooking,
  deleteEventBookingCategory,
  deleteEventCategory,
  getEvent,
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

async function handleImageUpload(
  coverImage: File,
  eventId: number,
  churchId: number,
  eventName: string
) {
  if (typeof coverImage !== "object") return null;

  const { data: storageData, error: storageError } = await uploadFileToStorage({
    bucket: "images",
    file: coverImage,
    filePath: `event/${churchId}/${eventName}_${Date.now()}.${coverImage.name.split(".").pop()}`,
  });

  if (storageError) throw storageError;

  const { data: fileData, error: fileError } = await uploadFile({
    name: storageData?.path || "-",
    type: "image",
    link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageData?.fullPath || "-"}`,
  });

  if (fileError) throw fileError;

  if (fileData?.id) {
    await upsertEventFile({ event_id: eventId, file_id: fileData.id });
  }

  return fileData?.id;
}

async function handleLocationSync(
  location:
    | {
        id?: number | undefined;
        name?: string | undefined;
        address?: string | null | undefined;
        lat?: number | null | undefined;
        lng?: number | null | undefined;
      }
    | null
    | undefined,
  eventId: number,
  isNewLocation: boolean
) {
  if (!location?.name) return;

  const { data: locationData, error } = await upsertLocation({
    id: location.id ? Number(location.id) : undefined,
    name: location.name,
    address: location.address || "",
    long_lat: [String(location.lng) || "", String(location.lat) || ""],
    type: "building",
  });

  if (error) throw error;

  if (isNewLocation && locationData) {
    await upsertEventLocation({
      event_id: eventId,
      location_id: Number(locationData.id),
    });
  }
}

const EventDetailPage = () => {
  const { id } = useParams();
  const eventId = Number(id);
  const { user } = useSnapshot(userStore);

  const [item, setItem] = useState<EventFormValues | undefined>();
  const [isLoading, setIsLoading] = useState({ submit: false, fetch: false });

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, fetch: true }));
      const { data, error } = await getEvent(eventId);
      if (error) throw error;

      if (data) {
        setItem({
          ...data,
          date: data.start_time ? new Date(data.start_time) : null,
          start_time: data.start_time ? formatTime(data.start_time) : "",
          end_time: data.end_time ? formatTime(data.end_time) : "",
          publish_time: data.publish_time ? new Date(data.publish_time) : null,
          unpublish_time: data.unpublish_time
            ? new Date(data.unpublish_time)
            : null,
          church_id: String(data?.church_id),
          cover_image: data.event_file?.file?.link,
          location: data.event_location?.[0]?.location
            ? {
                id: Number(data.event_location[0].location.id),
                name: data.event_location[0].location.name,
                address: data.event_location[0].location.address,
                lat: Number(data.event_location[0].location.long_lat?.[1]),
                lng: Number(data.event_location[0].location.long_lat?.[0]),
              }
            : undefined,
          tickets: data.event_bookings?.map((booking) => ({
            ...booking,
            publish_time: booking.publish_time
              ? new Date(booking.publish_time)
              : null,
            unpublish_time: booking.unpublish_time
              ? new Date(booking.unpublish_time)
              : null,
            categories: booking.event_booking_categories?.map((category) => ({
              id: category.event_categories?.id,
              title: category.event_categories?.title,
              description: category.event_categories?.description,
              price: category.price,
              final_price: category.final_price,
            })),
          })),
        });
      }
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to fetch event");
    } finally {
      setIsLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [eventId]);

  const onSubmit = useCallback(
    async (formData: EventFormValues) => {
      try {
        setIsLoading((prev) => ({ ...prev, submit: true }));

        const { date, cover_image, location, tickets, ...restFormData } =
          formData;
        const churchId = Number(user?.church_user?.church_id);
        const dateStr = formatDate(date!, "YYYY-MM-DD");

        const start_time = `${dateStr}T${restFormData.start_time}:00+07:00`;
        const end_time = `${dateStr}T${restFormData.end_time}:00+07:00`;

        const { error: eventError } = await upsertEvent({
          ...restFormData,
          id: eventId,
          church_id: churchId,
          start_time,
          end_time,
          publish_time: String(restFormData.publish_time?.toISOString()),
          unpublish_time: String(restFormData.unpublish_time?.toISOString()),
        });
        if (eventError) throw eventError;

        await Promise.all([
          handleImageUpload(cover_image, eventId, churchId, formData.name),
          handleLocationSync(location, eventId, !formData.location?.id),
        ]);

        const deletedTicketIds =
          item?.tickets
            ?.filter((oldT) => !tickets?.some((newT) => newT.id === oldT.id))
            .map((t) => Number(t.id)) || [];

        if (deletedTicketIds.length > 0) {
          await deleteEventBooking(deletedTicketIds);
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
                id: t.id!,
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

        const allNewCategoryIds =
          tickets?.flatMap((t) => t.categories?.map((c) => c.id) || []) || [];
        const deletedCategoryIds =
          item?.tickets
            ?.flatMap((t) => t.categories || [])
            .filter((oldC) => oldC.id && !allNewCategoryIds.includes(oldC.id))
            .map((c) => Number(c.id)) || [];

        if (deletedCategoryIds.length > 0) {
          await deleteEventCategory(deletedCategoryIds);
        }

        const categoryIdMap: Record<string, number> = {};
        const existsCategory = categoriesFlatten.filter((c) => c?.id);
        const newCategory = categoriesFlatten.filter((c) => !c?.id);

        existsCategory.forEach((c) => {
          if (c?.id) categoryIdMap[c.title!] = c.id;
        });

        await Promise.all([
          existsCategory.length > 0 &&
            upsertEventCategory(
              existsCategory.map((c) => ({
                id: c?.id ?? undefined,
                event_id: eventId,
                title: c?.title ?? "",
                description: c?.description ?? "",
              }))
            ),
          (async () => {
            if (newCategory.length === 0) return;
            const { data } = await upsertEventCategory(
              newCategory.map((c) => ({
                event_id: eventId,
                title: c?.title ?? "",
                description: c?.description ?? "",
              }))
            );
            data?.forEach((c) => {
              categoryIdMap[c.title] = c.id;
            });
          })(),
        ]);

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

        const oldPairs =
          item?.tickets?.flatMap((t) =>
            (t.categories || [])
              .filter((c) => t.id && c.id)
              .map((c) => ({ bid: Number(t.id), cid: Number(c.id) }))
          ) || [];

        const currentPairs =
          tickets?.flatMap((t) =>
            (t.categories || [])
              .filter((c) => t.id && c.id)
              .map((c) => ({ bid: Number(t.id), cid: Number(c.id) }))
          ) || [];

        const pairsToDelete = oldPairs
          .filter(
            (oldP) =>
              !currentPairs.some(
                (currP) => currP.bid === oldP.bid && currP.cid === oldP.cid
              )
          )
          .map((p) => ({ event_booking_id: p.bid, event_category_id: p.cid }));

        await Promise.all([
          bookingCategoryRows.length > 0 &&
            upsertEventBookingCategory(bookingCategoryRows),
          pairsToDelete.length > 0 && deleteEventBookingCategory(pairsToDelete),
        ]);

        toast.success("Successfully updated");
        fetchItem();
      } catch (error) {
        toast.error("Failed to update event");
        console.error(error);
      } finally {
        setIsLoading((prev) => ({ ...prev, submit: false }));
      }
    },
    [eventId, fetchItem, item?.tickets, user?.church_user?.church_id]
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
