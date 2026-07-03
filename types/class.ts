import { IChurch } from "@/types/church";
import { IFile } from "@/types/file";
import { IQuestion } from "@/types/question";

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

  question?: IQuestion[];
}
