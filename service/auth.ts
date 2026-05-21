import { supabaseClient } from "@/lib/supabase/client";
import userStore from "@/store/user";
import { IAuthUserPayload } from "@/types/auth";

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();
  userStore.user = null;
  return { error };
};

export const createAuthUser = async (payload: IAuthUserPayload) => {
  const { data, error } = await supabaseClient.auth.signUp(payload);

  return { data, error };
};
