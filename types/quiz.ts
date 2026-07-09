import { IClasses } from "@/types/class";

export interface IQuiz {
  class_id: number;
  classes: IClasses;
  is_private?: boolean;
  id: number;
}

export interface IPayloadQuiz extends Omit<IQuiz, "classes" | "id"> {
  id?: number;
}
