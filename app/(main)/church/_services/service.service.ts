import moment from "moment";
import { toast } from "sonner";

import { submitPhotoService } from "@/app/(main)/church/_services/photo.service";
import { ServiceFormValues } from "@/app/(main)/church/_types/service";
import {
  deleteChurchServiceSchedules,
  deleteChurchServices,
  upsertChurchServiceSchedules,
  upsertChurchServices,
} from "@/service/church";
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
    const { ...rest } = p;
    const formattedService = {
      ...rest,
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
    promises.push(
      createUpdateChurchServices(churchId, newServices, existingData)
    );
  if (updatedServices.length > 0)
    promises.push(
      createUpdateChurchServices(churchId, updatedServices, existingData)
    );
  if (deletedServices.length > 0)
    promises.push(removeChurchServices(deletedServices));

  await Promise.all(promises);
};

const createUpdateChurchServices = async (
  churchId: number,
  payload: ServiceFormValues[],
  existingData: ServiceFormValues[]
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
      const { photo, location, schedules, ...rest } = item;

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

    const { error: scheduleError } = await submitChurchServiceSchedule(
      payload,
      existingData
    );
    if (scheduleError)
      throw new Error("Failed to create church services schedule");

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

const submitChurchServiceSchedule = async (
  payload: ServiceFormValues[],
  existingData: ServiceFormValues[]
) => {
  try {
    const cleanedServices = payload.flatMap(
      (p) =>
        p.schedules?.map((s) => {
          return {
            ...(s.id ? { id: s.id } : {}),
            church_service_id: p.id!,
            end_time: s.end_time ? timeFormat(s.end_time, s.day!) : null,
            start_time: s.start_time ? timeFormat(s.start_time, s.day!) : null,
          };
        }) || []
    );

    const newSchedule = cleanedServices.filter((s) => !s.id);
    const updatedSchedule = cleanedServices.filter((s) => s.id);
    const deletedSchedule = existingData.flatMap(
      (p) => p.schedules?.filter((s) => !s.id).map((s) => s.id!) || []
    );

    const { data: newScheduleData, error: newScheduleError } =
      await upsertChurchServiceSchedules(newSchedule);
    if (newScheduleError) throw newScheduleError;

    const { data: updatedScheduleData, error: updatedScheduleError } =
      await upsertChurchServiceSchedules(updatedSchedule);
    if (updatedScheduleError) throw updatedScheduleError;

    const { error: deleteScheduleError } =
      await deleteChurchServiceSchedules(deletedSchedule);
    if (deleteScheduleError) throw deleteScheduleError;

    return {
      data: [...(newScheduleData || []), ...(updatedScheduleData || [])],
      error: newScheduleError || updatedScheduleError || deleteScheduleError,
    };
  } catch (error) {
    toast.error("Error fetching church services");
    return { data: [], error };
  }
};

export { createUpdateChurchServices, removeChurchServices };
