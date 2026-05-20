import { IUser } from "@/types/user";

type ContactType =
  | "email"
  | "phone"
  | "whatsapp"
  | "facebook"
  | "twitter"
  | "thread"
  | "instagram"
  | "tiktok"
  | "telegram"
  | "line"
  | "website"
  | "gmail";

export interface IContact {
  id: number;
  type: ContactType;
  value: string;
  created_at: string;
  deleted_at?: string;
}

export interface IPayloadContact extends Omit<IContact, "id" | "created_at"> {
  id?: number;
}

export interface IUserContact {
  id?: number;
  user_id?: string;
  user?: IUser;
  contact_id?: number;
  contact?: {
    id: number;
    type?: string;
    value?: string;
    created_at?: string;
  };
}
