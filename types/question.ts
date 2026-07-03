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
}

export type TPayloadQuestion = Omit<IQuestion, "id">;
