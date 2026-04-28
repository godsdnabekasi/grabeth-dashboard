"use client";

import React, { useCallback, useEffect, useState } from "react";

import moment from "moment";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import CoolForm from "@/components/page/cool/form";
import { CoolFormValues } from "@/components/page/cool/types";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";
import { formatTime } from "@/lib/utils";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import {
  getSmallGroup,
  upsertSmallGroup,
  upsertSmallGroupFile,
  upsertSmallGroupLocation,
} from "@/service/small-group";

async function handleImageUpload(
  coverImage: File,
  coolId: number,
  churchId: number,
  coolName: string
) {
  if (typeof coverImage !== "object") return null;

  const { data: storageData, error: storageError } = await uploadFileToStorage({
    bucket: "images",
    file: coverImage,
    filePath: `cool/${churchId}/${coolName}_${Date.now()}.${coverImage.name.split(".").pop()}`,
  });

  if (storageError) throw storageError;

  const { data: fileData, error: fileError } = await uploadFile({
    name: storageData?.path || "-",
    type: "image",
    link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageData?.fullPath || "-"}`,
  });

  if (fileError) throw fileError;

  if (fileData?.id) {
    await upsertSmallGroupFile({
      small_group_id: coolId,
      file_id: fileData.id,
    });
  }
}

const CoolDetailPage = () => {
  const { id } = useParams();
  const coolId = Number(id);
  const [isLoading, setIsLoading] = useState({
    fetch: true,
    submit: false,
  });
  const [item, setItem] = useState<CoolFormValues | undefined>();

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, fetch: true }));
      const { data, error } = await getSmallGroup(coolId);
      if (error) throw error;
      setItem({
        id: data?.id,
        coverImage: data?.small_group_file?.file?.link,
        name: data?.name || "",
        description: data?.description || "",
        church_id: String(data?.church_id),
        day: data?.meet_time ? moment(data?.meet_time).format("dddd") : "",
        time: data?.meet_time ? formatTime(data?.meet_time) : "",
        location: data?.small_group_location?.[0]?.location
          ? {
              id: data?.small_group_location?.[0].location?.id,
              name: data?.small_group_location?.[0].location?.name,
              address: data?.small_group_location?.[0].location?.address,
              lat: Number(
                data?.small_group_location?.[0].location?.long_lat?.[0]
              ),
              lng: Number(
                data?.small_group_location?.[0].location?.long_lat?.[1]
              ),
            }
          : undefined,
      });
    } catch {
      toast.error("Failed to fetch cool");
    } finally {
      setIsLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [coolId]);

  const onSubmit = useCallback(
    async (formData: CoolFormValues) => {
      try {
        setIsLoading((prev) => ({ ...prev, submit: true }));
        const { day, time, coverImage, location, ...rest } = formData;
        const dayNumber = moment().day(day).valueOf();
        const meetingDate = moment(dayNumber).format("YYYY-MM-DD");
        const meetTimeFormatted = `${meetingDate} ${time}`;

        const { error: smallGroupError } = await upsertSmallGroup({
          ...rest,
          church_id: Number(rest.church_id),
          meet_time: new Date(meetTimeFormatted),
        });
        if (smallGroupError)
          throw "Failed to update COOL, please try again later";
        if (coverImage && typeof coverImage === "object") {
          await handleImageUpload(
            coverImage,
            coolId,
            Number(rest.church_id),
            rest.name
          );
        }

        if (location?.name) {
          const { data: locationData, error: locationError } =
            await upsertLocation({
              id: location.id,
              name: location.name || "-",
              address: location.address || "-",
              long_lat: [String(location.lat), String(location.lng)],
              type: "home",
            });
          if (locationError)
            throw "Failed to update location, please try again later";

          if (!location.id) {
            const { error: locationSmallGroupError } =
              await upsertSmallGroupLocation({
                small_group_id: coolId,
                location_id: Number(locationData?.id),
              });
            if (locationSmallGroupError)
              throw "Failed to update location, please try again later";
          }
        }

        toast.success("Successfully updated COOL");
        await fetchItem();
      } catch (error) {
        toast.error(String(error));
      } finally {
        setIsLoading((prev) => ({ ...prev, submit: false }));
      }
    },
    [coolId, fetchItem]
  );

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return (
    <>
      <PageHeader title="COOL Details" />
      {isLoading.fetch ? (
        <LoadingSection />
      ) : (
        <CoolForm
          initialValues={item}
          isSubmitting={isLoading.submit}
          submitLabel="Update"
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default CoolDetailPage;
