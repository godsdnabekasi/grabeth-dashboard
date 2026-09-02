import z from "zod";

import { LOCATION_TYPE } from "@/config/common";

const REQUIRED_MSG = "Required";

export const locationSchema = z.object({
  name: z.string(REQUIRED_MSG),
  address: z.string(REQUIRED_MSG).optional(),
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
