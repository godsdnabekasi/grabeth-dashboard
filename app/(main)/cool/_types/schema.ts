import z from "zod";

const REQUIRED_MSG = "Required";

const locationSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    address: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
  })
  .optional()
  .nullable();

const memberSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  joinedDate: z.string().optional(),
  image: z.string().optional().nullable(),
  selected: z.boolean().optional(),
  newRole: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const coolSchema = z.object({
  id: z.number().optional(),
  coverImage: z.any().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  church_id: z.string().optional(),
  day: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  time: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  location: locationSchema,
  members: memberSchema.array().optional(),
});

export type CoolFormValues = z.infer<typeof coolSchema>;
