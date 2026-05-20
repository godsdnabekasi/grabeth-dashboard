import { supabaseClient } from "@/lib/supabase/client";
import { IContact, IPayloadContact, IUserContact } from "@/types/contact";

export const upsertContact = async (payload: IPayloadContact) => {
  const { data, error } = await supabaseClient
    .from("contact")
    .upsert(payload)
    .select("*")
    .single<IContact>();
  return { data, error };
};

export const upsertUserContact = async (payload: IUserContact) => {
  const { data, error } = await supabaseClient
    .from("user_contact")
    .upsert(payload)
    .select("*")
    .single<IUserContact>();
  return { data, error };
};
