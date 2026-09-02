import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CoolFormValues } from "@/app/(main)/cool/_types";
import { changeTimeZone, formatTime } from "@/lib/utils";
import { uploadFile, uploadFileToStorage } from "@/service/file";
import { upsertLocation } from "@/service/location";
import {
  deleteSmallGroupUser,
  getSmallGroup,
  upsertSmallGroup,
  upsertSmallGroupFile,
  upsertSmallGroupLocation,
  upsertSmallGroupUser,
} from "@/service/small-group";
import { ISmallGroup, SmallGroupRole } from "@/types/small-group";

export const useCoolDetail = (coolId: number) => {
  return useQuery({
    queryKey: ["cool-detail", coolId],
    queryFn: async () => {
      return fetchSmallGroupById(coolId);
    },
    enabled: !!coolId,
  });
};

export async function fetchSmallGroupById(
  coolId: number,
  startDate?: string,
  endDate?: string
) {
  const filter =
    startDate && endDate
      ? {
          start_date: startDate,
          end_date: endDate,
        }
      : undefined;

  const { data, error } = await getSmallGroup(coolId, filter);

  if (error) {
    toast.error("Failed to fetch cool");
    throw new Error("Failed to fetch cool");
  }

  const item: CoolFormValues = {
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
          lat: data?.small_group_location?.[0].location?.long_lat?.[0]
            ? Number(data?.small_group_location?.[0].location?.long_lat?.[0])
            : null,
          lng: data?.small_group_location?.[0].location?.long_lat?.[1]
            ? Number(data?.small_group_location?.[0].location?.long_lat?.[1])
            : null,
        }
      : undefined,
    members: data?.small_group_user?.map((memberItem) => ({
      name: memberItem.user?.name || "-",
      id: memberItem.user?.id,
      joinedDate: moment(memberItem.created_at).format("DD MMM YYYY"),
      role: memberItem.role || "-",
      image: memberItem.user?.user_file?.file?.link,
    })),
  };

  return { smallGroupData: data as ISmallGroup, item };
}

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

export const useUpdateCool = (coolId: number, oldItem?: CoolFormValues) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CoolFormValues) => {
      const { day, time, members, coverImage, location, ...rest } = formData;
      const dayNumber = moment().day(day).valueOf();
      const meetingDate = moment(dayNumber).format("YYYY-MM-DD");
      const meetTimeFormatted = `${meetingDate} ${time}`;

      const newMembers = members?.filter((member) => member.selected) || [];
      const changedMemberRole =
        members?.filter((member) => !member.selected && member.newRole) || [];
      const deletedMember = oldItem?.members
        ?.filter(
          (oldMember) =>
            !members?.some((newMember) => newMember.id === oldMember.id)
        )
        .map((oldMember) => oldMember.id);

      const { error: smallGroupError } = await upsertSmallGroup({
        ...rest,
        church_id: Number(rest.church_id),
        meet_time: new Date(meetTimeFormatted),
      });
      if (smallGroupError)
        throw new Error("Failed to update COOL, please try again later");

      if (coverImage && typeof coverImage === "object") {
        await handleImageUpload(
          coverImage,
          coolId,
          Number(rest.church_id),
          rest.name
        );
      }

      //* UPSERT NEW MEMBER
      if (newMembers?.length > 0) {
        const { error: smallGroupUserError } = await upsertSmallGroupUser(
          newMembers.map((member) => ({
            small_group_id: coolId,
            user_id: member.id!,
            role: (member.newRole || member.role) as SmallGroupRole,
          }))
        );
        if (smallGroupUserError)
          throw new Error("Failed to update COOL, please try again later");
      }

      //* UPDATE ROLE
      if (changedMemberRole?.length > 0) {
        const { error: smallGroupUserError } = await upsertSmallGroupUser(
          changedMemberRole.map((member) => ({
            small_group_id: coolId,
            user_id: member.id!,
            role: member.newRole as SmallGroupRole,
          }))
        );
        if (smallGroupUserError)
          throw new Error("Failed to update COOL, please try again later");
      }

      //* DELETE MEMBER
      if (deletedMember && deletedMember?.length > 0) {
        const { error: smallGroupUserError } = await deleteSmallGroupUser(
          deletedMember.map((id) => ({
            small_group_id: coolId,
            user_id: id!,
          }))
        );
        if (smallGroupUserError)
          throw new Error("Failed to update COOL, please try again later");
      }

      if (location?.name) {
        const { data: locationData, error: locationError } =
          await upsertLocation({
            id: location.id,
            name: location.name || "-",
            address: location.address || "-",
            long_lat: [Number(location.lat), Number(location.lng)],
            type: "home",
          });
        if (locationError)
          throw new Error("Failed to update location, please try again later");

        if (!location.id) {
          const { error: locationSmallGroupError } =
            await upsertSmallGroupLocation({
              small_group_id: coolId,
              location_id: Number(locationData?.id),
            });
          if (locationSmallGroupError)
            throw new Error(
              "Failed to update location, please try again later"
            );
        }
      }
    },
    onSuccess: () => {
      toast.success("Successfully updated COOL");
      queryClient.invalidateQueries({ queryKey: ["cool-detail", coolId] });
    },
    onError: (error) => {
      toast.error(error.message || String(error));
    },
  });
};

export const useDeleteCool = (coolId: number, oldItem?: CoolFormValues) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await upsertSmallGroup({
        name: oldItem?.name || "",
        description: oldItem?.description,
        id: coolId,
        deleted_at: changeTimeZone(new Date()),
      });
      if (error)
        throw new Error("Failed to delete COOL, please try again later");

      if (oldItem?.members && oldItem.members.length > 0) {
        const { error: smallGroupUserError } = await deleteSmallGroupUser(
          oldItem.members.map((member) => ({
            small_group_id: coolId,
            user_id: member.id!,
          }))
        );
        if (smallGroupUserError)
          throw new Error(
            "Failed to delete COOL member, please try again later"
          );
      }
    },
    onSuccess: () => {
      toast.success("Successfully deleted COOL");
      router.replace("/cool");
    },
    onError: (error) => {
      toast.error(error.message || String(error));
    },
  });
};
