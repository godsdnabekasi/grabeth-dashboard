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

const dateSchema = z
  .date(REQUIRED_MSG)
  .min(1, REQUIRED_MSG)
  .nullable()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["date"],
      });
    }
  });

const publishTimeSchema = z
  .date(REQUIRED_MSG)
  .min(1, REQUIRED_MSG)
  .nullable()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["publish_time"],
      });
    }
  });

const unpublishTimeSchema = z
  .date(REQUIRED_MSG)
  .min(1, REQUIRED_MSG)
  .nullable()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["unpublish_time"],
      });
    }
  });

export const eventSchema = z.object({
  id: z.number().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  date: dateSchema,
  church_id: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  start_time: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  end_time: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  capacity: z.number(REQUIRED_MSG).nullable().optional(),
  publish_time: publishTimeSchema,
  unpublish_time: unpublishTimeSchema,
  cover_image: z.any().optional(),
  location: locationSchema.optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
