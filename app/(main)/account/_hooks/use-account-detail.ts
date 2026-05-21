"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { submitEmail, submitPhone } from "../_services/contact.service";
import { submitPhoto } from "../_services/photo.service";
import { mapUserToForm } from "../_utils/account.mapper";
import { submitLocation } from "@/app/(main)/account/_services/location.service";
import { AccountFormValues } from "@/components/page/account/types";
import { createAuthUser } from "@/service/auth";
import { getUser, upsertUser } from "@/service/user";
import userStore from "@/store/user";
import { LocationType } from "@/types/location";

export const useAccountDetail = (mode?: "create" | "edit") => {
  const router = useRouter();
  const params = useParams();
  const userId = String(params.id);
  const { user } = useSnapshot(userStore);

  const [item, setItem] = useState<AccountFormValues>();
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      setIsFetching(true);

      const { data, error } = await getUser(userId);

      if (error) throw error;

      if (data) {
        setItem(mapUserToForm(data));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch user"
      );
    } finally {
      setIsFetching(false);
    }
  }, [userId]);

  const onSubmit = useCallback(
    async (formData: AccountFormValues) => {
      try {
        setIsSubmitting(true);

        const { photo, fileId, contact, location, ...restFormData } = formData;
        let currentUserId = mode === "create" ? restFormData.id! : userId;

        if (mode === "create") {
          const { data, error } = await createAuthUser({
            email: contact.email!,
            password: contact.password!,
            options: {
              data: {
                full_name: restFormData.name,
                name: restFormData.name,
                birthdate: String(restFormData.birthdate?.toISOString()),
                gender: String(restFormData.gender),
                church_id: user!.church_user!.church_id!,
                phone: String(contact.phoneNumber),
                nickname: restFormData.nickname,
                nij: restFormData.nij,
              },
            },
          });
          if (error) throw error;

          currentUserId = data?.user?.id || "";
        } else {
          const userPayload = {
            ...restFormData,
            birthdate: restFormData?.birthdate || undefined,
          };

          const { error } = await upsertUser(userPayload);

          if (error) throw error;
        }

        //* Upload photo
        if (photo instanceof File) {
          await submitPhoto({
            photo,
            userId: currentUserId,
            fileId,
          });
        }

        //* Submit contacts in parallel
        await Promise.all([
          contact.email
            ? submitEmail(contact, currentUserId)
            : Promise.resolve(),

          contact.phoneNumber
            ? submitPhone(contact, currentUserId)
            : Promise.resolve(),
        ]);

        //* Submit location
        const deletedLocationIds = item?.location
          ?.map((l) => l?.id)
          .filter((id) => !location?.some((l) => l?.id === id));

        const cleanLocation =
          location?.map((l) => ({
            id: l?.id,
            name: l?.name || "",
            address: l?.address || "",
            type: l?.type as LocationType,
            province_id: l?.province_id ? Number(l?.province_id) : undefined,
            city_id: l?.city_id ? Number(l?.city_id) : undefined,
            district_id: l?.district_id ? Number(l?.district_id) : undefined,
            postal_code: l?.postal_code ? Number(l?.postal_code) : undefined,
            ...(l?.longitude && l?.latitude
              ? {
                  long_lat:
                    l?.longitude && l?.latitude
                      ? [Number(l.longitude), Number(l.latitude)]
                      : null,
                }
              : {}),
          })) || [];
        await submitLocation(cleanLocation, currentUserId, deletedLocationIds);

        toast.success(
          `User ${mode === "create" ? "created" : "updated"} successfully`
        );
        if (mode === "create") router.back();
        else await fetchItem();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update user"
        );

        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchItem, item?.location, mode, router, user, userId]
  );

  useEffect(() => {
    if (mode === "edit") fetchItem();
  }, [fetchItem, mode]);

  return {
    item,
    isFetching,
    isSubmitting,
    onSubmit,
    refetch: fetchItem,
  };
};
