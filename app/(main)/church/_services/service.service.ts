import moment from "moment";
import { toast } from "sonner";

import { submitPhotoService } from "@/app/(main)/church/_services/photo.service";
import { ServiceFormValues } from "@/app/(main)/church/_types/types";
import { deleteChurchServices, upsertChurchServices } from "@/service/church";
import { upsertLocations } from "@/service/location";
import { IPayloadLocation } from "@/types/location";

const timeFormat = (time: string, day: string) => {
  const dayNumber = moment().day(day).valueOf();
  const meetingDate = moment(dayNumber).format("YYYY-MM-DD");
  return `${meetingDate} ${time}:00+07`;
};

export const submitChurchServices = async (
  churchId: number,
  payload: ServiceFormValues[],
  existingData: ServiceFormValues[]
) => {
  const newServices: ServiceFormValues[] = [];
  const updatedServices: ServiceFormValues[] = [];
  const payloadIds = new Set<number>();

  payload.forEach((p) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { day, ...rest } = p;
    const formattedService = {
      ...rest,
      end_time: p.end_time ? timeFormat(p.end_time, p.day!) : null,
      start_time: p.start_time ? timeFormat(p.start_time, p.day!) : null,
      open_time: p.open_time ? `${p.open_time}:00+07` : null,
    } as unknown as ServiceFormValues;

    if (formattedService.id) {
      updatedServices.push(formattedService);
      payloadIds.add(formattedService.id);
    } else {
      newServices.push(formattedService);
    }
  });

  const deletedServices =
    existingData
      ?.filter((s) => s.id && !payloadIds.has(s.id))
      .map((s) => s.id!) || [];

  const promises = [];

  if (newServices.length > 0)
    promises.push(createUpdateChurchServices(churchId, newServices));
  if (updatedServices.length > 0)
    promises.push(createUpdateChurchServices(churchId, updatedServices));
  if (deletedServices.length > 0)
    promises.push(removeChurchServices(deletedServices));

  await Promise.all(promises);
};

const createUpdateChurchServices = async (
  churchId: number,
  payload: ServiceFormValues[]
) => {
  try {
    const servicesWithLocation = payload.filter((p) => p.location);
    if (servicesWithLocation.length > 0) {
      const serviceLocation: IPayloadLocation[] = servicesWithLocation.map(
        (service) => ({
          id: service.location?.id,
          name: service.location!.name,
          address: service.location!.name,
          type: "building",
        })
      );

      const { data: locationData, error: locationError } =
        await upsertLocations(serviceLocation);
      if (locationError)
        throw new Error("Failed to create church services location");

      servicesWithLocation.forEach((s, i) => {
        s.location = locationData![i];
      });
    }

    const tasks = payload.map(async (item) => {
      let file_id = item.file_id;

      if (item.photo instanceof File) {
        const { data: photoData, error: photoError } = await submitPhotoService(
          {
            photo: item.photo,
            churchId: churchId,
            fileId: item.file_id,
          }
        );
        if (photoError) throw photoError;
        file_id = photoData!.id;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { photo, location, ...rest } = item;

      return {
        ...rest,
        church_id: churchId,
        location_id: location?.id,
        file_id,
      };
    });

    const cleanedServices = await Promise.all(tasks);

    const { data, error } = await upsertChurchServices(cleanedServices);
    if (error) throw error;

    return { data, error };
  } catch (error) {
    toast.error("Error fetching church services");
    return { data: [], error };
  }
};

const removeChurchServices = async (ids: number[]) => {
  try {
    const { error } = await deleteChurchServices(ids);
    if (error) throw error;
    return { error };
  } catch (error) {
    toast.error("Error removing church services");
    return { error };
  }
};

export { createUpdateChurchServices, removeChurchServices };
