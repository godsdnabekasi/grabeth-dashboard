import { IUser } from "@/types/user";

export type IRequestType = "requested" | "accepted" | "denied" | "cancelled";

export interface IRequest {
  id?: number;
  type?: IRequestType;
  note?: string;
  created_at?: string;
  deleted_at?: string;
  user_id?: string;
  user?: IUser;
}
