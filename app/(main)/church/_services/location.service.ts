import { toast } from "sonner";

import { upsertChurchLocation } from "@/service/church";
import { deleteLocation, upsertLocation } from "@/service/location";
import { IPayloadLocation } from "@/types/location";

export const submitLocation = async (
  location: IPayloadLocation,
  church_id: number,
  deletedLocationId?: number
) => {
  try {
    if (!location.name) return;

    const { data: locationData, error: locationError } =
      await upsertLocation(location);
    if (locationError) throw locationError;

    if (!location.id) {
      const { error: userLocationError } = await upsertChurchLocation({
        location_id: locationData!.id!,
        church_id: church_id!,
      });
      if (userLocationError) throw userLocationError;
    }

    if (deletedLocationId) {
      const { error: locationError } = await deleteLocation([
        deletedLocationId,
      ]);
      if (locationError) throw locationError;
    }

    toast.success("Location updated successfully");
  } catch {
    toast.error("Failed to update location");
  }
};
