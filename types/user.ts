import { IChurch } from "@/types/church";
import { IUserContact } from "@/types/contact";
import { IFile } from "@/types/file";
import { IUserLocation } from "@/types/location";
import { ISmallGroupUser } from "@/types/small-group";

export interface IUser {
  id: string;
  name: string;
  nickname?: string;
  gender?: "male" | "female";
  birthdate?: string;
  nij?: string;
  bio?: string;
  website?: string;
  user_contact?: IUserContact[];
  user_file?: {
    user_id?: string;
    file_id?: number;
    file?: IFile;
    is_profile_photo?: boolean;
  };
  user_location?: IUserLocation[];
  church_user?: {
    church_id?: number;
    church?: IChurch;
    user_id?: string;
    user?: IUser;
    role?: "admin" | "user" | "finance";
  };

  contact?: {
    email?: string;
    phoneNumber?: string;
    emailId?: number;
    phoneId?: number;
  };

  small_group_user?: ISmallGroupUser | null;
}

export interface IUserTransform extends IUser {
  email?: string;
}

export interface IPayloadUser extends Omit<
  IUser,
  "user_file" | "church_user" | "small_group_user" | "id" | "contact"
> {
  id?: string;
}

//* USER ACTIVITY
export type UserActivityType =
  | "join date"
  | "join community"
  | "attendance"
  | "devotion"
  | "note"
  | "community";

export interface IUserActivity {
  id: string;
  type: UserActivityType;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
  user: IUser;
  file_id?: string;
  file?: IFile;
}

//* USER FILE
export interface IUserFile {
  user_id: string;
  user?: IUser;
  file_id: number;
  file?: IFile;
  is_profile_photo?: boolean;
}

export type IPayloadUserFile = Omit<IUserFile, "user" | "file">;
