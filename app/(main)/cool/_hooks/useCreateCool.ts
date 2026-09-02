import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { CoolFormValues } from "@/app/(main)/cool/_types";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import {
  upsertSmallGroup,
  upsertSmallGroupFile,
  upsertSmallGroupLocation,
  upsertSmallGroupUser,
} from "@/service/small-group";
import userStore from "@/store/user";
import { LocationType } from "@/types/location";
import { SmallGroupRole } from "@/types/small-group";

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

export const useCreateCool = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CoolFormValues) => {
      const { day, time, members, coverImage, location, ...rest } = formData;
      const dayNumber = moment().day(day).valueOf();
      const meetingDate = moment(dayNumber).format("YYYY-MM-DD");
      const meetTimeFormatted = `${meetingDate} ${time}`;
      const churchId = user?.church_user?.church_id;

      if (!churchId) {
        throw new Error("Church ID is missing");
      }

      const { data: smallGroupData, error: smallGroupError } =
        await upsertSmallGroup({
          ...rest,
          church_id: Number(churchId),
          meet_time: new Date(meetTimeFormatted),
        });
      
      if (smallGroupError || !smallGroupData?.id) {
        throw new Error("Failed to create COOL, please try again later");
      }

      if (coverImage && typeof coverImage === "object") {
        await handleImageUpload(
          coverImage,
          smallGroupData.id,
          Number(churchId),
          rest.name
        );
      }

      if (members && members?.length > 0) {
        const { error: smallGroupUserError } = await upsertSmallGroupUser(
          members.map((member) => ({
            small_group_id: smallGroupData.id,
            user_id: member.id!,
            role: (member.newRole || member.role) as SmallGroupRole,
          }))
        );
        if (smallGroupUserError)
          throw new Error("Failed to update COOL, please try again later");
      }

      if (location?.name) {
        const { data: locationData, error: locationError } =
          await upsertLocation({
            name: location.name || "-",
            address: location.address || "-",
            long_lat: [Number(location.lat), Number(location.lng)],
            type: "home" as LocationType,
          });
        if (locationError)
          throw new Error("Failed to update location, please try again later");

        const { error: locationSmallGroupError } =
          await upsertSmallGroupLocation({
            small_group_id: smallGroupData.id,
            location_id: Number(locationData?.id),
          });
        if (locationSmallGroupError)
          throw new Error("Failed to update location, please try again later");
      }
    },
    onSuccess: () => {
      toast.success("Successfully created COOL");
      // Optional: invalidate cool lists if there's a query for it
      queryClient.invalidateQueries({ queryKey: ["cool-list"] });
      router.replace("/cool");
    },
    onError: (error) => {
      toast.error(error.message || String(error));
    },
  });
};
