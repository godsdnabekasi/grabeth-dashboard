import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import { QUERY_LOCATION } from "@/types/location";
import {
  IPayloadUser,
  IPayloadUserFile,
  IUser,
  IUserActivity,
  IUserFile,
  IUserTransform,
} from "@/types/user";

const QUERY_USER = `
    *,
    user_file(*, file(*)),
    user_contact(*, contact(*)),
    church_user(*, church(*)),
    small_group_user(*, small_group(*)),
    user_location(*, ${QUERY_LOCATION})
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
    contact: {
      phoneNumber: data?.user_contact?.find(
        (item) => item.contact?.type === "phone"
      )?.contact?.value,
      phoneId: data?.user_contact?.find(
        (item) => item.contact?.type === "phone"
      )?.contact_id,
      email: data?.user_contact?.find(
        (item) =>
          item.contact?.type === "gmail" || item.contact?.type === "email"
      )?.contact?.value,
      emailId: data?.user_contact?.find(
        (item) =>
          item.contact?.type === "gmail" || item.contact?.type === "email"
      )?.contact_id,
    },
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
    contact: {
      phoneNumber: d?.user_contact?.find(
        (item) => item.contact?.type === "phone"
      )?.contact?.value,
      phoneId: d?.user_contact?.find((item) => item.contact?.type === "phone")
        ?.contact_id,
      email: d?.user_contact?.find(
        (item) =>
          item.contact?.type === "gmail" || item.contact?.type === "email"
      )?.contact?.value,
      emailId: d?.user_contact?.find(
        (item) =>
          item.contact?.type === "gmail" || item.contact?.type === "email"
      )?.contact_id,
    },
  })) as IUserTransform[];

  return { data: response, error, count };
};

//* CREATE
export const createUser = async (payload: IPayloadUser) => {
  const { data, error } = await supabaseClient
    .from("user")
    .insert(payload)
    .select("*")
    .single<IUser>();

  return { data, error };
};

export const upsertUser = async (payload: IPayloadUser) => {
  const { data, error } = await supabaseClient
    .from("user")
    .upsert(payload)
    .select("*")
    .single<IUser>();

  return { data, error };
};

//* USER ACTIVITY
export const getUserActivities = async (
  user_id: string,
  filter?: IFilterList
) => {
  const query = supabaseClient
    .from("user_activities")
    .select("*", { count: "exact" })
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (filter?.pageSize && filter?.page) {
    const from = (filter.page - 1) * filter.pageSize;
    const to = from + filter.pageSize - 1;
    query.range(from, to);
  }

  const { data, error, count } = await query.returns<IUserActivity[]>();

  return { data, error, count };
};

//* USER FILE
export const insertUserFile = async (payload: IPayloadUserFile) => {
  const { data, error } = await supabaseClient
    .from("user_file")
    .insert(payload)
    .select("*")
    .single<IUserFile>();

  return { data, error };
};

//* DELETE
export const deleteUserAuth = async (id: string) => {
  const { data, error } = await supabaseClient.auth.admin.deleteUser(id);

  return { data, error };
};
