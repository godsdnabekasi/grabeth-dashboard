import { IContact } from "@/types/contact";
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
  | "permata"
  | "qris";
export type TChurchService = "general" | "community" | "generation";

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
  church_contact?: {
    church_id: number;
    contact_id: number;
    contact: IContact;
  }[];
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
  start_time?: string | null;
  end_time?: string | null;
  open_time?: string | null;
  location_id?: number;
  location?: ILocation;
  created_at?: Date;
  type: TChurchService;
  file_id?: number | null;
  file?: IFile;

  church_service_schedule?: IChurchServiceSchedule[];
}

export type IPayloadChurchService = Omit<
  IChurchService,
  "id" | "location" | "file"
>;

//* BANK ACCOUNT

export interface IChurchBankAccount {
  id: number;
  church_id: number;
  name: string;
  account_number: number;
  bank: TChurchBankName;
  file_id?: number;
  file?: IFile;
  created_at?: string;
}

export type IPayloadChurchBankAccount = Omit<IChurchBankAccount, "id" | "file">;

export interface IChurchServiceSchedule {
  id: number;
  church_service_id: number;
  start_time: string | null;
  end_time: string | null;
}

export interface IPayloadChurchServiceSchedule extends Omit<
  IChurchServiceSchedule,
  "id"
> {
  id?: number;
}
