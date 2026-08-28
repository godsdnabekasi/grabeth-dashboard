import z from "zod";

const REQUIRED_MSG = "Required";

const questionType = [
  "content",
  "video_content",
  "short_text",
  "long_text",
  "select",
  "multiple_select",
  "range",
];

const questionDetailSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  options: z.array(
    z.object({
      label: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
      value: z.string(),
    })
  ),
  range: z
    .object({
      min: z.number(REQUIRED_MSG),
      max: z.number(REQUIRED_MSG),
      step: z.number(REQUIRED_MSG),
    })
    .optional(),
  required: z.boolean().optional(),
});

export const questionSchema = z
  .object({
    id: z.number().optional(),
    title: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
    description: z.string().optional(),
    type: z.enum(questionType, { error: REQUIRED_MSG }),
    detail: questionDetailSchema.optional(),
    answer: z.string().optional(),
    correct_answer: z.string().optional().nullable(),
    point: z.number().optional().nullable(),
    order: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "content") {
      if (!data.detail?.description?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: REQUIRED_MSG,
          path: ["detail", "description"],
        });
      }
    }
    if (data.type === "video_content") {
      if (!data.detail?.url?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: REQUIRED_MSG,
          path: ["detail", "url"],
        });
      }
    }
  });

export type QuestionFormValues = z.infer<typeof questionSchema>;

export const quizSchema = z.object({
  id: z.number().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  photo: z.any().optional(),
  published_at: z.date().optional(),
  unpublished_at: z.date().optional().nullable(),
  church_id: z.string().optional(),
  question: questionSchema.array(),
});

export type QuizFormValues = z.infer<typeof quizSchema>;
