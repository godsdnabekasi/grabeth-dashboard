import { IAttendanceDetail, IAttendanceList } from "@/types/attendance";
import { IChurch } from "@/types/church";
import { IFile } from "@/types/file";
import { ILocation } from "@/types/location";
import { IRequest } from "@/types/request";
import { IUser } from "@/types/user";

export type CoolUserRole = "mvp" | "member" | "support" | "pastor" | "grower";

export interface ISmallGroup {
  id: number;
  church_id?: number;
  church?: IChurch;
  name: string;
  description?: string;
  meet_time?: Date;
  created_at?: string;
  deleted_at?: string;
  small_group_file?: ISmallGroupFile;
  small_group_user?: ISmallGroupUser[];
  small_group_attendance?: ICoolAttendance[];
  small_group_location?: ISmallGroupLocation[];
}

export interface IPayloadSmallGroup extends Omit<
  ISmallGroup,
  "id" | "location"
> {
  id?: number;
}

export interface ISmallGroupFile {
  small_group_id: number;
  small_group?: ISmallGroup;
  file_id: number;
  file?: IFile;
}

export interface IPayloadSmallGroupFile {
  small_group_id: number;
  file_id: number;
}

//* LOCATION
export interface ISmallGroupLocation {
  small_group_id: number;
  small_group?: ISmallGroup;
  location_id: number;
  location?: ILocation;
}

export interface IPayloadSmallGroupLocation {
  small_group_id: number;
  location_id: number;
}

export interface ISmallGroupUser {
  user_id?: string;
  user?: IUser;
  small_group_id?: number;
  small_group?: ISmallGroup;
  role?: CoolUserRole;
  created_at?: string;
  deleted_at?: string;
}

export interface IListCool {
  id?: number;
  church_id?: number;
  name?: string;
  photo?: string;
  description?: string;
  meet_time?: string;
  location?: {
    id?: number;
    name?: string;
    address?: string;
    long_lat?: number[];
  };
  created_at?: string;
  deleted_at?: string;
  leader?: ICoolUser;
  member?: ICoolUser[];
  // church?: IChurch;
  user_details?: ICoolUser[];
}

export interface ICoolUser {
  id?: string;
  photo?: string;
  name?: string;
  role?: string;
  coolName?: string;
  phone?: string;
  address?: string;
}

export interface IListCoolUser {
  small_group_id?: number;
  small_group?: IListCool;
  user_id?: string;
  user?: IUser;
  role?: string;
  created_at?: string;
  deleted_at?: string;
}

export interface ICoolAttendance {
  small_group_id: number;
  small_group: ISmallGroup;
  attendance_id: number;
  attendance: IAttendanceList;
  attendance_detail_id: number;
  attendance_detail: IAttendanceDetail;
}

export interface ICoolRequest {
  request_id: number;
  request?: IRequest;
  small_group_id: number;
  small_group?: IListCool;
}
