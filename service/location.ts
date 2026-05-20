import { supabaseClient } from "@/lib/supabase/client";
import {
  ICity,
  IDistrict,
  ILocation,
  IPayloadLocation,
  IPayloadUserLocation,
  IProvince,
  IUserLocation,
} from "@/types/location";

//* LOCATION
export const upsertLocation = async (payload: IPayloadLocation[]) => {
  const { data, error } = await supabaseClient
    .from("location")
    .upsert(payload)
    .select("*")
    .returns<ILocation[]>();

  return { data, error };
};

export const deleteLocation = async (ids: number[]) => {
  const { data, error } = await supabaseClient
    .from("location")
    .delete()
    .in("id", ids)
    .select();

  return { data, error };
};

//* USER LOCATION
export const upsertUserLocation = async (payload: IPayloadUserLocation[]) => {
  const { data, error } = await supabaseClient
    .from("user_location")
    .upsert(payload)
    .select("*")
    .returns<IUserLocation[]>();

  return { data, error };
};

//* PROVINCE
export const getProvince = async () => {
  const { data, error } = await supabaseClient
    .from("province")
    .select("*")
    .returns<IProvince[]>();

  return { data, error };
};

//* CITY
export const getCity = async (province_id?: number) => {
  const { data, error } = await supabaseClient
    .from("city")
    .select("*")
    .eq("province_id", province_id)
    .returns<ICity[]>();

  return { data, error };
};

//* DISTRICT
export const getDistrict = async (city_id?: number) => {
  const { data, error } = await supabaseClient
    .from("district")
    .select("*")
    .eq("city_id", city_id)
    .returns<IDistrict[]>();

  return { data, error };
};
