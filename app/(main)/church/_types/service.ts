import z from "zod";

import { TChurchService } from "@/types/church";

const CHURCH_SERVICE_TYPE: TChurchService[] = [
  "general",
  "community",
  "generation",
];

const REQUIRED_MSG = "Required";

export const serviceScheduleSchema = z.object({
  id: z.number().optional().nullable(),
  church_service_id: z.number().optional().nullable(),
  day: z.string(REQUIRED_MSG).optional(),
  start_time: z.string(REQUIRED_MSG).optional().nullable(),
  end_time: z.string(REQUIRED_MSG).optional().nullable(),
});
export type ServiceScheduleFormValues = z.infer<typeof serviceScheduleSchema>;

export const serviceSchema = z.object({
  id: z.number().optional(),
  church_id: z.number().optional(),
  name: z.string(REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  schedules: z.array(serviceScheduleSchema).optional(),
  location: z
    .object({
      id: z.number().optional(),
      name: z.string(REQUIRED_MSG),
      address: z.string(REQUIRED_MSG).optional(),
    })
    .optional(),
  type: z.enum(CHURCH_SERVICE_TYPE),
  photo: z.any().optional(),
  file_id: z.number().optional().nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
