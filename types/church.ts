import { IFile } from "@/types/file";
import { ILocation } from "@/types/location";
import { IUser } from "@/types/user";

export type TChurchUserRole = "admin" | "user" | "finance" | "pastor";
export type TChurchBankName =
  | "bca"
  | "bni"
  | "bri"
  | "mandiri"
  | "cimb"
  | "permata";

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
  church_user?: IChurchUser & { count: number }[];
  church_service?: IChurchService[];
  church_bank_account?: IChurchBankAccount[];
}

export interface IPayloadChurch extends Omit<IChurch, "id" | "church_file"> {
  id?: number;
}

//* USER
export interface IChurchUser {
  church_id: number;
  user_id: string;
  user?: IUser;
  role: TChurchUserRole;
  created_at?: Date;
}

export type IPayloadChurchUser = Omit<IChurchUser, "user">;

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

//* SERVICE
export interface IChurchService {
  id: number;
  church_id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  open_time: string;
  location_id?: number;
  location?: ILocation;
  created_at?: Date;
}

export type IPayloadChurchService = Omit<IChurchService, "id" | "location">;

//* BANK ACCOUNT

export interface IChurchBankAccount {
  id: number;
  church_id: number;
  name: string;
  account_number: number;
  bank: TChurchBankName;
  created_at?: string;
}

export type IPayloadChurchBankAccount = Omit<IChurchBankAccount, "id">;
