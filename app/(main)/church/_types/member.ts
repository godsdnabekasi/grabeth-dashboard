import z from "zod";

import { TChurchUserRole } from "@/types/church";

const CHURCH_USER_ROLE_TYPE = [
  "pastor",
  "admin",
  "finance",
  "user",
] as TChurchUserRole[];

const REQUIRED_MSG = "Required";

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
