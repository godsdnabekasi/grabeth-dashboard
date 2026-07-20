import { IChurch } from "@/types/church";
import { IFile } from "@/types/file";
import { IForm } from "@/types/form";
import { IQuestion } from "@/types/question";
import { IUser } from "@/types/user";

export interface IClasses {
  id: number;
  file_id?: number;
  file?: IFile;
  title: string;
  description?: string;
  published_at: Date;
  unpublished_at: Date;
  created_at: Date;
  grade?: string;
  church_id?: number;
  church?: IChurch;

  forms?: IForm;
  question?: IQuestion[];
  class_user_answer: IClassUserAnswer[];
  class_user_answer_summary: IClassUserAnswerSummary[];
}

export interface IClassUserAnswer {
  class_id: number;
  user_id: string;
  user: IUser;
  question_id: number;
  answer: string;
  point?: number;
  started_at?: Date;
  finished_at?: Date;
  created_at: Date;
}

export interface IClassUserAnswerSummary {
  class_id: number;
  user_id: string;
  user: IUser;
  total_score: number;
  total_point: number;
  total_questions: number;
  answered_questions: number;
  started_at?: Date;
  finished_at?: Date;
  duration_seconds: number;
}
