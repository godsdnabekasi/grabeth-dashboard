import z from "zod";

import { TChurchBankName } from "@/types/church";

const CHURCH_BANK_TYPE = [
  "bca",
  "bni",
  "bri",
  "mandiri",
  "cimb",
  "permata",
  "danamon",
  "qris",
] as TChurchBankName[];

const REQUIRED_MSG = "Required";

export const bankAccountSchema = z.object({
  id: z.number().optional(),
  church_id: z.number(),
  name: z.string(REQUIRED_MSG),
  account_number: z.number(REQUIRED_MSG),
  bank: z.enum(CHURCH_BANK_TYPE, { error: REQUIRED_MSG }),
  qris: z.any().optional(),
  qris_id: z.number().optional().nullable(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
