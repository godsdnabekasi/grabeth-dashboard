import { IChurch } from "@/types/church";
import { IUserContact } from "@/types/contact";
import { IFile } from "@/types/file";

export interface IUser {
  id: string;
  name: string;
  nickname?: string;
  gender?: "male" | "female";
  birthdate?: string;
  nij?: string;
  phoneNumber?: string;
  bio?: string;
  website?: string;
  user_contact?: IUserContact[];
  user_file?: {
    user_id?: string;
    file_id?: number;
    file?: IFile;
    is_profile_photo?: boolean;
  };
  church_user?: {
    church_id?: number;
    church?: IChurch;
    user_id?: string;
    user?: IUser;
    role?: "admin" | "user" | "finance";
  };
}

export interface IUserTransform extends IUser {
  email?: string;
}
