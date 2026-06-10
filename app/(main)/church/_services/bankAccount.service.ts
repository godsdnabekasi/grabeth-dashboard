import { toast } from "sonner";

import { BankAccountFormValues } from "@/components/page/church/types";
import {
  deleteChurchBankAccounts,
  upsertChurchBankAccount,
} from "@/service/church";

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
      const { error } = await upsertChurchBankAccount(updatedValues);
      if (error) throw error;
    }
    if (newValues.length > 0) {
      const { data, error } = await upsertChurchBankAccount(newValues);
      if (error) throw error;
      return data;
    }
  } catch {
    toast.error("Failed to save bank account");
  }
};
