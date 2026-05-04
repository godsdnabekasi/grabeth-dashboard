import { IFile } from "@/types/file";
import { IUser } from "@/types/user";

export type TChurchUserRole = "admin" | "user" | "finance";

export interface IChurch {
  id: number;
  name: string;
  description?: string;
  establish_date?: string;
  created_at?: string;
  church_file?: {
    id: number;
    file_id: number;
    file: IFile;
  };
  youtube_channel_url?: string;
  // church_location?: IChurchLocation[];
  // church_user?: IChurchUser[];
}

export interface IChurchUser {
  church_id: number;
  user_id: number;
  user?: IUser;
  role: TChurchUserRole;
  created_at?: string;
}
