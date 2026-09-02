"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitPhoto } from "../_services/photo.service";
import { upsertBankAccount } from "@/app/(main)/church/_services/bankAccount.service";
import { submitPhone } from "@/app/(main)/church/_services/contact.service";
import { submitLocation } from "@/app/(main)/church/_services/location.service";
import { submitChurchServices } from "@/app/(main)/church/_services/service.service";
import {
  onAddMemberChurch,
  onRemoveMemberChurch,
} from "@/app/(main)/church/_services/user.service";
import { ChurchFormValues } from "@/app/(main)/church/_types/types";
import { formatDate, formatTime } from "@/lib/utils";
import { deleteChurchs, getChurchById, upsertChurch } from "@/service/church";
import { IChurch } from "@/types/church";
import { ContactType } from "@/types/contact";
import { LocationType } from "@/types/location";

const CONTACT_ORDER: ContactType[] = [
  "phone",
  "instagram",
  "facebook",
  "youtube",
];

export const useChurchDetail = (mode?: "create" | "edit") => {
  const router = useRouter();
  const params = useParams();
  const churchId = Number(params.id);

  const [church, setChurch] = useState<IChurch>();
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
        setChurch(data);
        setItem({
          ...data,
          contact: data.church_contact
            ? data.church_contact
                .map((cc) => ({
                  id: cc.contact_id,
                  type: cc.contact?.type as ContactType,
                  value: cc.contact?.value || "",
                }))
                .sort((a, b) => {
                  const indexA = CONTACT_ORDER.indexOf(a.type);
                  const indexB = CONTACT_ORDER.indexOf(b.type);
                  return (
                    (indexA === -1 ? 999 : indexA) -
                    (indexB === -1 ? 999 : indexB)
                  );
                })
            : undefined,
          description: data.description || "",
          establish_date: data.establish_date
            ? new Date(data.establish_date)
            : null,
          photo: data.church_file?.file?.link || undefined,
          services: data.church_service?.map((cs) => ({
            ...cs,
            photo: cs.file?.link,
            description: cs.description || "",
            schedules:
              cs.church_service_schedule &&
              cs.church_service_schedule.length > 0
                ? cs.church_service_schedule?.map((css) => {
                    return {
                      ...css,
                      day: css.start_time
                        ? formatDate(String(css.start_time), "dddd")
                        : "",
                      start_time: css.start_time
                        ? formatTime(css.start_time)
                        : "",
                      end_time: css.end_time ? formatTime(css.end_time) : "",
                    };
                  })
                : [
                    {
                      day: "",
                      start_time: "",
                      end_time: "",
                    },
                  ],
            location: {
              name: cs.location?.name || "",
              address: cs.location?.address || "",
              id: cs.location?.id || undefined,
            },
          })),
          bank_accounts: data.church_bank_account?.map((bank) => ({
            ...bank,
            qris: bank.file?.link,
            qris_id: bank.file_id,
          })),
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
      console.log(formData);

      try {
        setIsSubmitting(true);
        const {
          photo,
          contact,
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

        //* CONTACT
        if (contact && contact.length > 0) {
          function formatPhoneNumber(phone: string): string {
            if (phone.startsWith("8")) {
              return "628" + phone.slice(1);
            }

            return phone;
          }
          await submitPhone(
            contact
              .filter((c) => c.value)
              .map((c, i) => {
                return {
                  ...c,
                  type: CONTACT_ORDER[i],
                  value:
                    CONTACT_ORDER[i] === "phone"
                      ? formatPhoneNumber(String(c.value))
                      : c.value || "",
                };
              }),
            church?.church_contact?.map((cc) => {
              return {
                id: cc?.contact_id,
                type: cc?.contact?.type as ContactType,
                value: cc?.contact?.value || "",
              };
            }) || [],
            church_id
          );
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
      church?.church_contact,
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
