import { toast } from "sonner";

import {
  deleteLocation,
  upsertLocations,
  upsertUserLocation,
} from "@/service/location";
import { IPayloadLocation, IPayloadUserLocation } from "@/types/location";

export const submitLocation = async (
  location: IPayloadLocation[],
  user_id: string,
  deletedLocationIds: (number | undefined)[] | undefined
) => {
  try {
    const existingLocation = location.filter((l) => l.id);
    const newLocation = location.filter((l) => !l.id);

    if (existingLocation.length > 0) {
      const { error: locationError } = await upsertLocations(existingLocation);
      if (locationError) throw locationError;
    }

    if (newLocation.length > 0) {
      const { data: locationData, error: locationError } =
        await upsertLocations(newLocation);
      if (locationError) throw locationError;

      const userLocation = locationData!.map((l) => ({
        location_id: l.id!,
        user_id: user_id!,
      })) as IPayloadUserLocation[];
      const { error: userLocationError } =
        await upsertUserLocation(userLocation);
      if (userLocationError) throw userLocationError;
    }

    if (deletedLocationIds && deletedLocationIds?.length > 0) {
      const { error: locationError } = await deleteLocation(
        deletedLocationIds.map((id) => id!)
      );
      if (locationError) throw locationError;
    }

    toast.success("Location updated successfully");
  } catch {
    toast.error("Failed to update location");
  }
};
