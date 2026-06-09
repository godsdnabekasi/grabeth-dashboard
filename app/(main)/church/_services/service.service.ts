import { toast } from "sonner";

import { ServiceFormValues } from "@/components/page/church/types";
import { deleteChurchServices, upsertChurchServices } from "@/service/church";
import { upsertLocations } from "@/service/location";
import { IPayloadLocation } from "@/types/location";

const createUpdateChurchServices = async (
  churchId: number,
  payload: ServiceFormValues[]
) => {
  try {
    const serviceLocation: IPayloadLocation[] = payload.map((service) => {
      return {
        name: service.location!.name,
        address: service.location!.name,
        type: "building",
      };
    });

    const { data: locationData, error: locationError } =
      await upsertLocations(serviceLocation);
    if (locationError) throw "Failed to create church services location";

    const cleanedServices = payload.map((service, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { location, ...rest } = service;
      return {
        ...rest,
        church_id: churchId,
        location_id: locationData![index].id,
      };
    });
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
