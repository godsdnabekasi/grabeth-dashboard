import { IClasses } from "@/types/class";

export type TQuestionType =
  | "content"
  | "video_content"
  | "short_text"
  | "long_text"
  | "select"
  | "multiple_select"
  | "range";

interface IQuestionOption {
  label: string;
  value: string;
}

interface IQuestionDetail {
  title?: string;
  description?: string;
  url?: string;
  range?: {
    min: number;
    max: number;
    step: number;
  };
  required?: boolean;
  options?: IQuestionOption[];
}

export interface IQuestion {
  id: number;
  class_id: number;
  classes?: IClasses;
  title: string;
  description?: string;
  type: TQuestionType;
  detail?: IQuestionDetail;
  correct_answer?: string | null;
  point?: number | null;
  order: number;

  question_answer: IQuestionAnswer;
}

export type TPayloadQuestion = Omit<
  IQuestion,
  "id" | "classes" | "question_answer"
>;

export interface IQuestionAnswer {
  question_id: number;
  type: TQuestionType;
  answer: string;
  created_at: Date;
}

export type TPayloadQuestionAnswer = Omit<IQuestionAnswer, "created_at">;
