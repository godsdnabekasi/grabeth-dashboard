"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitPhoto } from "../_services/photo.service";
import { upsertBankAccount } from "@/app/(main)/church/_services/bankAccount.service";
import { submitLocation } from "@/app/(main)/church/_services/location.service";
import { submitChurchServices } from "@/app/(main)/church/_services/service.service";
import {
  onAddMemberChurch,
  onRemoveMemberChurch,
} from "@/app/(main)/church/_services/user.service";
import { ChurchFormValues } from "@/components/page/church/types";
import { formatTimeString } from "@/lib/utils";
import { deleteChurchs, getChurchById, upsertChurch } from "@/service/church";
import { LocationType } from "@/types/location";

export const useChurchDetail = (mode?: "create" | "edit") => {
  const router = useRouter();
  const params = useParams();
  const churchId = Number(params.id);

  const [item, setItem] = useState<ChurchFormValues>();
  const [deletedMember, setDeletedMember] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!churchId) return;

    try {
      setIsFetching(true);

      const { data, error } = await getChurchById(churchId);

      if (error) throw error;

      if (data) {
        setItem({
          ...data,
          description: data.description || "",
          establish_date: data.establish_date
            ? new Date(data.establish_date)
            : null,
          photo: data.church_file?.file?.link || undefined,
          services: data.church_service?.map((cs) => ({
            ...cs,
            description: cs.description || "",
            start_time: cs.start_time ? formatTimeString(cs.start_time) : "",
            end_time: cs.end_time ? formatTimeString(cs.end_time) : "",
            open_time: cs.open_time ? formatTimeString(cs.open_time) : "",
            location: {
              name: cs.location?.name || "",
              address: cs.location?.address || "",
              id: cs.location?.id || undefined,
            },
          })),
          bank_accounts: data.church_bank_account,
          location: data.church_location?.[0] && {
            id: data.church_location?.[0].location_id,
            name: data.church_location?.[0].location?.name || "",
            address: data.church_location?.[0].location?.address || "",
            province: data.church_location?.[0].location?.province?.name || "",
            city: data.church_location?.[0].location?.city?.name || "",
            district: data.church_location?.[0].location?.district?.name || "",
            province_id: String(
              data.church_location?.[0].location?.province_id || ""
            ),
            city_id: String(data.church_location?.[0].location?.city_id || ""),
            district_id: String(
              data.church_location?.[0].location?.district_id || ""
            ),
            type: data.church_location?.[0].location?.type as LocationType,
            coordinate: {
              lng: Number(data.church_location?.[0].location?.long_lat?.[0]),
              lat: Number(data.church_location?.[0].location?.long_lat?.[1]),
            },
            postal_code: data.church_location?.[0].location?.postal_code,
          },
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch church"
      );
    } finally {
      setIsFetching(false);
    }
  }, [churchId]);

  const onSubmit = useCallback(
    async (formData: ChurchFormValues) => {
      try {
        setIsSubmitting(true);
        const {
          photo,
          file_id,
          location,
          members,
          services,
          bank_accounts,
          ...restFormData
        } = formData;
        const { data, error } = await upsertChurch({
          ...restFormData,
          establish_date: restFormData.establish_date
            ? new Date(restFormData.establish_date)
            : undefined,
        });
        if (error) throw error;
        const church_id = churchId || data!.id;

        //* Upload photo
        if (photo instanceof File) {
          await submitPhoto({
            photo,
            churchId: church_id,
            fileId: file_id,
          });
        }

        //* LOCATION
        const deletedLocationId = !location ? item?.location?.id : undefined;

        const cleanLocation = {
          id: location?.id,
          name: location?.name || "",
          address: location?.address || "",
          type: location?.type as LocationType,
          province_id: location?.province_id
            ? Number(location?.province_id)
            : undefined,
          city_id: location?.city_id ? Number(location?.city_id) : undefined,
          district_id: location?.district_id
            ? Number(location?.district_id)
            : undefined,
          postal_code: location?.postal_code
            ? Number(location?.postal_code)
            : undefined,
          long_lat: location?.coordinate
            ? [Number(location.coordinate.lng), Number(location.coordinate.lat)]
            : null,
        };
        await submitLocation(cleanLocation, church_id, deletedLocationId);

        //* USER
        if (deletedMember?.length) {
          await onRemoveMemberChurch(deletedMember);
        }

        if (members?.length) {
          await onAddMemberChurch(church_id, members);
        }

        //* SERVICES
        await submitChurchServices(
          churchId,
          services || [],
          item?.services || []
        );

        //* BANK ACCOUNT
        await upsertBankAccount(bank_accounts || [], item?.bank_accounts || []);

        toast.success(
          `Church ${mode === "create" ? "created" : "updated"} successfully`
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
    [
      churchId,
      deletedMember,
      fetchItem,
      item?.bank_accounts,
      item?.location?.id,
      item?.services,
      mode,
      router,
    ]
  );

  const handleDelete = async () => {
    try {
      setIsFetching(true);
      await deleteChurchs([churchId]);
      toast.success("Church deleted successfully");
      router.back();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete church user"
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (mode === "edit") fetchItem();
  }, [fetchItem, mode]);

  return {
    item,
    isFetching,
    isSubmitting,

    setDeletedMember,

    onSubmit,
    handleDelete,
    refetch: fetchItem,
  };
};
