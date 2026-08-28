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

const unpublishTimeSchema = z.date().optional().nullable();

const categoriesSchema = z.object({
  id: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  final_price: z.number().optional().nullable(),
});

const scheduleSchema = z.object({
  id: z.number().optional(),
  event_id: z.number().nullable(),
  date: dateSchema,
  start_time: z.string(REQUIRED_MSG).nullable(),
  end_time: z.string(REQUIRED_MSG).optional().nullable(),
  // capacity: z.number(REQUIRED_MSG).optional().nullable(),
});

const ticketSchema = z.object({
  id: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  publish_time: z.date(REQUIRED_MSG).nullable().optional(),
  unpublish_time: z.date(REQUIRED_MSG).nullable().optional(),
  categories: z.array(categoriesSchema).optional(),
});

export const eventSchema = z.object({
  id: z.number().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  church_id: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  capacity: z.number(REQUIRED_MSG).nullable().optional(),
  publish_time: publishTimeSchema,
  unpublish_time: unpublishTimeSchema,
  cover_image: z.any().optional(),
  location: locationSchema.optional(),
  schedules: z.array(scheduleSchema).optional(),
  tickets: z.array(ticketSchema).optional(),
  website: z.string().optional().nullable(),
});

export type CategoryFormValues = z.infer<typeof categoriesSchema>;
export type TicketFormValues = z.infer<typeof ticketSchema>;
export type EventFormValues = z.infer<typeof eventSchema>;
