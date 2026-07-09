import { IClasses } from "@/types/class";

export interface IForm {
  id: number;
  class_id: number;
  classes: IClasses;
  is_private: boolean;
}

export interface IPayloadForm extends Omit<IForm, "classes" | "id"> {
  id?: number;
}

export interface IFormUser {
  user_id: string;
  form_id: number;
}
