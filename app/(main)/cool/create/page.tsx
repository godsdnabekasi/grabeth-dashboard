"use client";

import React, { useCallback, useState } from "react";

import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import CoolForm from "@/components/page/cool/form";
import { CoolFormValues } from "@/components/page/cool/types";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import {
  upsertSmallGroup,
  upsertSmallGroupFile,
  upsertSmallGroupLocation,
} from "@/service/small-group";
import userStore from "@/store/user";

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

const CoolCreatePage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (formData: CoolFormValues) => {
      try {
        setIsLoading(true);
        const { day, time, coverImage, location, ...rest } = formData;
        const dayNumber = moment().day(day).valueOf();
        const meetingDate = moment(dayNumber).format("YYYY-MM-DD");
        const meetTimeFormatted = `${meetingDate} ${time}`;
        const churchId = user?.church_user?.church_id;

        const { data: smallGroupData, error: smallGroupError } =
          await upsertSmallGroup({
            ...rest,
            church_id: Number(churchId),
            meet_time: new Date(meetTimeFormatted),
          });
        if (smallGroupError)
          throw "Failed to update COOL, please try again later";
        if (coverImage && typeof coverImage === "object") {
          await handleImageUpload(
            coverImage,
            smallGroupData!.id,
            Number(churchId),
            rest.name
          );
        }

        if (location?.name) {
          const { data: locationData, error: locationError } =
            await upsertLocation({
              name: location.name || "-",
              address: location.address || "-",
              long_lat: [String(location.lat), String(location.lng)],
              type: "home",
            });
          if (locationError)
            throw "Failed to update location, please try again later";

          const { error: locationSmallGroupError } =
            await upsertSmallGroupLocation({
              small_group_id: smallGroupData!.id,
              location_id: Number(locationData?.id),
            });
          if (locationSmallGroupError)
            throw "Failed to update location, please try again later";
        }

        toast.success("Successfully created COOL");
        router.replace("/cool");
      } catch (error) {
        toast.error(String(error));
      } finally {
        setIsLoading(false);
      }
    },
    [router, user?.church_user?.church_id]
  );

  return (
    <>
      <PageHeader title="New COOL" />
      {isLoading ? (
        <LoadingSection />
      ) : (
        <CoolForm
          isSubmitting={isLoading}
          submitLabel="Create"
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default CoolCreatePage;
