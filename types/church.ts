import { IFile } from "@/types/file";
import { ILocation } from "@/types/location";
import { IUser } from "@/types/user";

export type TChurchUserRole = "admin" | "user" | "finance";

export interface IChurch {
  id: number;
  name: string;
  description?: string;
  establish_date?: Date;
  created_at?: string;
  church_file?: {
    id: number;
    file_id: number;
    file: IFile;
  };
  youtube_channel_url?: string;
  church_location?: IChurchLocation[];
  // church_user?: IChurchUser[];
}

export interface IPayloadChurch extends Omit<IChurch, "id" | "church_file"> {
  id?: number;
}

export interface IChurchUser {
  church_id: number;
  user_id: string;
  user?: IUser;
  role: TChurchUserRole;
  created_at?: Date;
}

//* LOCATION
export interface IChurchLocation {
  church_id: number;
  location_id: number;
  location?: ILocation;
}

export type IPayloadChurchLocation = Omit<IChurchLocation, "location">;

//* FILE
export interface IChurchFile {
  church_id: number;
  file_id: number;
  file?: IFile;
  priority?: number;
}

export type IPayloadChurchFile = Omit<IChurchFile, "file">;
