import z from "zod";

import { LOCATION_TYPE } from "@/config/common";
import {
  TChurchBankName,
  TChurchService,
  TChurchUserRole,
} from "@/types/church";
import { ContactType } from "@/types/contact";

const CHURCH_USER_ROLE_TYPE = [
  "pastor",
  "admin",
  "finance",
  "user",
] as TChurchUserRole[];

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

const CHURCH_CONTACT_TYPE: ContactType[] = [
  "phone",
  "email",
  "instagram",
  "facebook",
  "youtube",
];

const CHURCH_SERVICE_TYPE: TChurchService[] = [
  "general",
  "community",
  "generation",
];

const REQUIRED_MSG = "Required";

export const locationSchema = z.object({
  name: z.string(REQUIRED_MSG),
  address: z.string(REQUIRED_MSG),
  type: z.enum(LOCATION_TYPE, { error: REQUIRED_MSG }),
  coordinate: z
    .object({
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
    })
    .optional(),
  id: z.number().optional(),
  province: z.string().optional(),
  province_id: z.string().optional(),
  district: z.string().optional(),
  district_id: z.string().optional(),
  city: z.string().optional(),
  city_id: z.string().optional(),
  postal_code: z.number().optional().nullable(),
});
export type ChurchLocationFormValues = z.infer<typeof locationSchema>;

export const memberSchema = z.object({
  id: z.string(REQUIRED_MSG),
  name: z.string(REQUIRED_MSG),
  photo: z.string().optional(),
  joined_date: z.string(REQUIRED_MSG),
  role: z.enum(CHURCH_USER_ROLE_TYPE, { error: REQUIRED_MSG }),
  newRole: z.enum(CHURCH_USER_ROLE_TYPE, { error: REQUIRED_MSG }).optional(),
  selected: z.boolean().optional(),
});
export type MemberFormValues = z.infer<typeof memberSchema>;

export const serviceSchema = z.object({
  id: z.number().optional(),
  church_id: z.number().optional(),
  name: z.string(REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  start_time: z.string(REQUIRED_MSG).optional().nullable(),
  end_time: z.string(REQUIRED_MSG).optional().nullable(),
  open_time: z.string(REQUIRED_MSG).optional().nullable(),
  location: z
    .object({
      id: z.number().optional(),
      name: z.string(REQUIRED_MSG),
      address: z.string(REQUIRED_MSG).optional(),
    })
    .optional(),
  type: z.enum(CHURCH_SERVICE_TYPE),
  day: z.string(REQUIRED_MSG).optional(),
  photo: z.any().optional(),
  file_id: z.number().optional().nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

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

const contactSchema = z.object({
  type: z.enum(CHURCH_CONTACT_TYPE).optional(),
  value: z.string(REQUIRED_MSG).optional().or(z.literal("")),
  id: z.number().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const churchSchema = z.object({
  id: z.number().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  photo: z.any().optional(),
  file_id: z.number().optional(),
  establish_date: z
    .date(REQUIRED_MSG)
    .min(1, REQUIRED_MSG)
    .nullable()
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({
          code: "custom",
          message: REQUIRED_MSG,
          path: ["establish_date"],
        });
      }
    }),
  location: locationSchema.optional(),
  members: memberSchema.array().optional(),
  services: serviceSchema.array().optional(),
  bank_accounts: bankAccountSchema.array().optional(),
  contact: contactSchema.array().optional(),
});

export type ChurchFormValues = z.infer<typeof churchSchema>;
