import { supabaseClient } from "@/lib/supabase/client";
import { ILocation, IPayloadLocation } from "@/types/location";

export const upsertLocation = async (payload: IPayloadLocation) => {
  const { data, error } = await supabaseClient
    .from("location")
    .upsert(payload)
    .select("*")
    .single<ILocation>();

  return { data, error };
};
