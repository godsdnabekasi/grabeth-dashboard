import { IUser } from "@/types/user";

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
