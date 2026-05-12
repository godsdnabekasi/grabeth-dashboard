import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { IUser, IUserTransform } from "@/types/user";

const QUERY_USER = `
    *,
    user_file(*, file(*)),
    user_contact(*, contact(*)),
    church_user(*, church(*)),
    small_group_user(*, small_group(*))
  `;

export type TGenderOptions = "male" | "female";

export const getUser = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("user")
    .select(QUERY_USER)
    .eq("id", userId)
    .single<IUser>();

  const user = {
    ...data,
    phoneNumber: data?.user_contact?.find(
      (item) => item.contact?.type === "phone"
    )?.contact?.value,
    email: data?.user_contact?.find((item) => item.contact?.type === "email")
      ?.contact?.value,
  } as IUserTransform;

  return { data: user, error };
};

export const getUsersByChurchId = async (
  filter?: IFilterList & { church_id?: number }
) => {
  const query = supabaseClient
    .from("user")
    .select(QUERY_USER, { count: "exact" })
    .eq("church_user.church_id", filter?.church_id)
    .not("church_user", "is", null);

  if (filter) {
    const { search, page, pageSize } = filter;
    if (search) {
      query.ilike("name", `%${search}%`);
    }

    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query.range(from, to);
    }
  }

  const { data, error, count } = await query
    .returns<IUser[]>()
    .order("created_at", { ascending: false });

  const response = data?.map((d) => ({
    ...d,
    phoneNumber: d?.user_contact?.find((item) => item.contact?.type === "phone")
      ?.contact?.value,
    email: d?.user_contact?.find((item) => item.contact?.type === "email")
      ?.contact?.value,
  })) as IUserTransform[];

  return { data: response, error, count };
};

// DELETE
export const deleteUserAuth = async (id: string) => {
  const { data, error } = await supabaseClient.auth.admin.deleteUser(id);

  return { data, error };
};
