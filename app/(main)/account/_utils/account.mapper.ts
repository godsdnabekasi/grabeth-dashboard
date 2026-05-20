import { AccountFormValues } from "@/components/page/account/types";
import { IUserTransform } from "@/types/user";

export const mapUserToForm = (data: IUserTransform): AccountFormValues => {
  return {
    id: data.id,

    name: data.name || "",

    nickname: data.nickname || "",

    contact: {
      email: data.contact?.email || "",
      phoneNumber: data.contact?.phoneNumber
        ? Number(data.contact.phoneNumber)
        : 0,
      emailId: data.contact?.emailId,
      phoneId: data.contact?.phoneId,
    },

    birthdate: data.birthdate || "",

    gender: data.gender,

    photo: data.user_file?.file?.link || "",

    fileId: data.user_file?.file_id,

    location: data.user_location?.map((loc) => ({
      id: loc.location_id,
      name: loc.location?.name || "",
      address: loc.location?.address || "",
      province: loc.location?.province?.name || "",
      city: loc.location?.city?.name || "",
      district: loc.location?.district?.name || "",
      province_id: String(loc.location?.province_id || ""),
      city_id: String(loc.location?.city_id || ""),
      district_id: String(loc.location?.district_id || ""),
      type: loc.location?.type,
      latitude: String(loc.location?.long_lat?.[1]),
      longitude: String(loc.location?.long_lat?.[0]),
    })),
  };
};
