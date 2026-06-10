import { supabaseClient } from "@/lib/supabase/client";
import { IFilterList } from "@/types";
import {
  IChurch,
  IChurchBankAccount,
  IChurchFile,
  IChurchLocation,
  IChurchService,
  IChurchUser,
  IPayloadChurch,
  IPayloadChurchBankAccount,
  IPayloadChurchFile,
  IPayloadChurchLocation,
  IPayloadChurchService,
  IPayloadChurchUser,
  TChurchUserRole,
} from "@/types/church";
import { QUERY_LOCATION } from "@/types/location";

export const getChurches = async (filter?: IFilterList & { id?: number }) => {
  const query = supabaseClient.from("church").select(
    `
      *,
      church_location(${QUERY_LOCATION}),
      church_file(file(link)),
      church_user(count)
    `,
    {
      count: "exact",
    }
  );

  if (filter) {
    const { search, id } = filter;
    if (search && !id) {
      query.ilike("name", `%${search}%`);
    } else if (id) {
      query.or(`name.ilike.%${search}%,id.eq.${id}`);
    }
  }

  const { data, error, count } = await query.returns<IChurch[]>();

  return { data, error, count };
};

export const getChurchById = async (id: number) => {
  const query = supabaseClient.from("church").select(`
        *,
        church_file(file(link)),
        church_location(*, ${QUERY_LOCATION}),
        church_service(*, ${QUERY_LOCATION}),
        church_bank_account(*)
      `);

  const { data, error } = await query.eq("id", id).single<IChurch>();

  return { data, error };
};

export const getChurchUsers = async (
  filter?: IFilterList & {
    church_id?: number;
    not_role?: TChurchUserRole;
    role?: TChurchUserRole;
  }
) => {
  const query = supabaseClient
    .from("church_user")
    .select(
      `
        *,
        user(*,
          small_group_user(*),
          user_file(*, file(*)),
          user_contact(*, contact(*))
        )
      `,
      {
        count: "exact",
      }
    )
    .eq("church_id", filter?.church_id)
    .not("user", "is", null);

  if (filter) {
    const { search, page, pageSize, role, not_role } = filter;
    if (search) {
      query.ilike("user.name", `%${search}%`);
    }

    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query.range(from, to);
    }

    if (role) {
      query.eq("role", role);
    }

    if (not_role) {
      query.not("role", "eq", not_role);
    }
  }

  const { data, error, count } = await query
    .returns<IChurchUser[]>()
    .order("created_at", { ascending: false });

  return { data, error, count };
};

//* INSERT
export const upsertChurch = async (payload: IPayloadChurch) => {
  const { data, error } = await supabaseClient
    .from("church")
    .upsert(payload)
    .select("*")
    .single<IChurch>();

  return { data, error };
};

export const upsertChurchUsers = async (payload: IPayloadChurchUser[]) => {
  const { data, error } = await supabaseClient
    .from("church_user")
    .upsert(payload)
    .select("*")
    .returns<IChurch[]>();

  return { data, error };
};

export const upsertChurchFile = async (payload: IPayloadChurchFile) => {
  const { data, error } = await supabaseClient
    .from("church_file")
    .upsert(payload)
    .select("*, file(link)")
    .single<IChurchFile>();

  return { data, error };
};

export const upsertChurchLocation = async (payload: IPayloadChurchLocation) => {
  const { data, error } = await supabaseClient
    .from("church_location")
    .upsert(payload)
    .select("*")
    .single<IChurchLocation>();

  return { data, error };
};

//* DELETE
export const deleteChurchs = async (ids: number[]) => {
  const query = supabaseClient.from("church").delete().in("id", ids);

  const { error } = await query.returns<IChurch[]>();
  return { error };
};

export const deleteChurchUsers = async (user_id: string[]) => {
  const query = supabaseClient
    .from("church_user")
    .delete()
    .in("user_id", user_id);

  const { error } = await query.returns<IChurchUser[]>();
  return { error };
};

//* SERVICE
export const getChurchServices = async (church_id: number) => {
  const query = supabaseClient
    .from("church_service")
    .select(`*, ${QUERY_LOCATION}`, {
      count: "exact",
    });

  const { data, error, count } = await query
    .eq("church_id", church_id)
    .order("created_at", { ascending: false })
    .returns<IChurchService[]>();

  return { data, error, count };
};

export const upsertChurchServices = async (
  payload: IPayloadChurchService[]
) => {
  const query = supabaseClient
    .from("church_service")
    .upsert(payload)
    .select(`*`);

  const { data, error } = await query.returns<IChurchService[]>();

  return { data, error };
};

export const deleteChurchServices = async (ids: number[]) => {
  const query = supabaseClient.from("church_service").delete().in("id", ids);

  const { error } = await query.returns<IChurchService[]>();

  return { error };
};

//* BANK ACCOUNT

export const getChurchBankAccounts = async (church_id: number) => {
  const query = supabaseClient.from("church_bank_account").select(`*`);

  const { data, error } = await query
    .eq("church_id", church_id)
    .order("created_at", { ascending: false })
    .returns<IChurchBankAccount[]>();

  return { data, error };
};

export const upsertChurchBankAccount = async (
  payload: IPayloadChurchBankAccount[]
) => {
  const query = supabaseClient
    .from("church_bank_account")
    .upsert(payload)
    .select(`*`);

  const { data, error } = await query.returns<IChurchBankAccount[]>();

  return { data, error };
};

export const deleteChurchBankAccounts = async (ids: number[]) => {
  const query = supabaseClient
    .from("church_bank_account")
    .delete()
    .in("id", ids);

  const { error } = await query.returns<IChurchBankAccount[]>();

  return { error };
};
