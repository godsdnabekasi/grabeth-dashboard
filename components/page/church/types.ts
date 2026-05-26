import z from "zod";

import { LOCATION_TYPE } from "@/config/common";

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
});

export type ChurchFormValues = z.infer<typeof churchSchema>;
