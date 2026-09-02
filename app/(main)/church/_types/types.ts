import z from "zod";

import { bankAccountSchema } from "@/app/(main)/church/_types/bank";
import { locationSchema } from "@/app/(main)/church/_types/location";
import { memberSchema } from "@/app/(main)/church/_types/member";
import { serviceSchema } from "@/app/(main)/church/_types/service";
import { ContactType } from "@/types/contact";

const CHURCH_CONTACT_TYPE: ContactType[] = [
  "phone",
  "email",
  "instagram",
  "facebook",
  "youtube",
];

export const REQUIRED_MSG = "Required";

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
