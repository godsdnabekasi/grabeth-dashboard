import { supabaseClient } from "@/lib/supabase/client";
import userStore from "@/store/user";

export const signOut = async () => {
  const { error } = await supabaseClient.auth.signOut();
  userStore.user = null;
  return { error };
};
