import { toast } from "sonner";

import { submitPhotoQRIS } from "@/app/(main)/church/_services/photo.service";
import { BankAccountFormValues } from "@/app/(main)/church/_types/types";
import {
  deleteChurchBankAccounts,
  upsertChurchBankAccount,
} from "@/service/church";

const uploadQrisPhotos = async (
  accounts: BankAccountFormValues[]
): Promise<BankAccountFormValues[]> => {
  const accountsWithFile = accounts.filter((v) => v.qris instanceof File);
  if (accountsWithFile.length === 0) return [];

  const uploadResults = await submitPhotoQRIS(
    accountsWithFile.map((account) => ({
      photo: account.qris!,
      churchId: account.church_id,
    }))
  );

  return accountsWithFile.map((account, i) => ({
    ...account,
    qris_id: uploadResults[i]?.data?.id || undefined,
  }));
};

const stripQrisFields = (bankAccount: BankAccountFormValues) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { qris, qris_id, ...rest } = bankAccount;
  return { rest, qris_id };
};

const buildPayload = (
  accounts: BankAccountFormValues[],
  uploaded: BankAccountFormValues[],
  matchById: boolean
) => {
  const qrisById = matchById
    ? new Map(uploaded.map((up) => [up.id, up.qris_id]))
    : null;
  const firstQrisId = matchById
    ? undefined
    : uploaded.find((up) => up.qris_id)?.qris_id;

  return accounts.map((bankAccount) => {
    const { rest, qris_id } = stripQrisFields(bankAccount);
    const fallback = matchById ? qrisById!.get(bankAccount.id) : firstQrisId;

    return {
      ...rest,
      file_id: fallback || qris_id || undefined,
    };
  });
};

export const upsertBankAccount = async (
  data: BankAccountFormValues[],
  existingData: BankAccountFormValues[]
) => {
  const newValues = data?.filter((s) => !s.id);
  const updatedValues = data?.filter((s) => s.id);
  const deletedValues = existingData
    ?.filter((s) => !data?.some((service) => service.id === s.id))
    .map((s) => s.id!);

  try {
    if (deletedValues.length > 0) {
      await deleteChurchBankAccounts(deletedValues);
    }

    if (updatedValues.length > 0) {
      const uploaded = await uploadQrisPhotos(updatedValues);
      const payload = buildPayload(updatedValues, uploaded, true);

      const { error } = await upsertChurchBankAccount(payload);
      if (error) throw error;
    }

    if (newValues.length > 0) {
      const uploaded = await uploadQrisPhotos(newValues);
      const payload = buildPayload(newValues, uploaded, false);

      const { error } = await upsertChurchBankAccount(payload);
      if (error) throw error;
    }
  } catch {
    toast.error("Failed to save bank account");
  }
};
