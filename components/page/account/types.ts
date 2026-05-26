import z from "zod";

import { LOCATION_TYPE } from "@/config/common";

const REQUIRED_MSG = "Required";

const contactSchema = z.object({
  email: z.string(REQUIRED_MSG).optional(),
  password: z
    .string(REQUIRED_MSG)
    .min(6, "Password must be at least 6 characters"),
  phoneNumber: z.number(REQUIRED_MSG).min(10, REQUIRED_MSG),
  phoneId: z.number().optional(),
  emailId: z.number().optional(),
});

const birthdateSchema = z
  .date(REQUIRED_MSG)
  .min(1, REQUIRED_MSG)
  .nullable()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["birthdate"],
      });
    }
  });

export const locationSchema = z.object({
  name: z.string(REQUIRED_MSG),
  address: z.string(REQUIRED_MSG),
  type: z.enum(LOCATION_TYPE, { error: REQUIRED_MSG }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  id: z.number().optional(),
  province: z.string().optional(),
  province_id: z.string().optional(),
  district: z.string().optional(),
  district_id: z.string().optional(),
  city: z.string().optional(),
  city_id: z.string().optional(),
  postal_code: z.string().optional(),
});
export type AccountLocationFormValues = z.infer<typeof locationSchema>;

export const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  nickname: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  photo: z.any().optional(),
  fileId: z.number().optional(),
  contact: contactSchema,
  nij: z.string().optional(),
  bio: z.string().optional(),
  birthdate: birthdateSchema,
  gender: z.enum(["male", "female"], { error: REQUIRED_MSG }).optional(),
  location: z.array(locationSchema.optional()).optional(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
