import { supabaseClient } from "@/lib/supabase/client";
import { IUser, IUserTransform } from "@/types/user";

const QUERY_USER = `
    *,
    user_file(*, file(*)),
    user_contact(*, contact(*)),
    church_user(*, church(*))
  `;

export const getUser = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("user")
    .select(QUERY_USER)
    .eq("id", userId)
    .single<IUser>();

  const user = {
    ...data,
    email: data?.user_contact?.find((item) => item.contact?.type === "email")
      ?.contact?.value,
  } as IUserTransform;

  return { data: user, error };
};
