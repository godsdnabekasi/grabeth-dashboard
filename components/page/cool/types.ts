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
  .nullable()
  .superRefine((data, ctx) => {
    if (!data) return;
    if (data.name && !data.address) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["address"],
      });
    }
    if (data.lat && !data.name) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["name"],
      });
    }
  });

export const coolSchema = z.object({
  id: z.number().optional(),
  coverImage: z.any().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  church_id: z.string().optional(),
  day: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  time: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  location: locationSchema,
});

export type CoolFormValues = z.infer<typeof coolSchema>;
