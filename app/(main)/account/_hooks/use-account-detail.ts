"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { toast } from "sonner";

import { submitEmail, submitPhone } from "../_services/contact.service";
import { submitPhoto } from "../_services/photo.service";
import { mapUserToForm } from "../_utils/account.mapper";
import { submitLocation } from "@/app/(main)/account/_services/location.service";
import { AccountFormValues } from "@/components/page/account/types";
import { getUser, upsertUser } from "@/service/user";
import { LocationType } from "@/types/location";

export const useAccountDetail = () => {
  const params = useParams();
  const userId = String(params.id);

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

        const { error } = await upsertUser(restFormData);

        if (error) throw error;

        //* Upload photo
        if (photo instanceof File) {
          await submitPhoto({
            photo,
            userId,
            fileId,
          });
        }

        //* Submit contacts in parallel
        await Promise.all([
          contact.email ? submitEmail(contact, userId) : Promise.resolve(),

          contact.phoneNumber
            ? submitPhone(contact, userId)
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
        await submitLocation(cleanLocation, userId, deletedLocationIds);

        toast.success("User updated successfully");

        await fetchItem();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update user"
        );

        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchItem, item?.location, userId]
  );

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    isFetching,
    isSubmitting,
    onSubmit,
    refetch: fetchItem,
  };
};
