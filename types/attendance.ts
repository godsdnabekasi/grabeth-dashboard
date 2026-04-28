import { IEventBooking, IEventCategory } from "@/types/event";
import { ILocation } from "@/types/location";
import { IRegistration } from "@/types/registration";
import { ICoolAttendance } from "@/types/small-group";
import { IUser } from "@/types/user";

export interface IAttendanceList {
  id?: number;
  name: string;
  date: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  location_id?: number;
  location?: ILocation;
  attendance_user?: IAttendanceUser[];
  attendance_guest?: IAttendanceGuest[];
  small_group_attendance?: ICoolAttendance[];
}

export interface IAttendanceUser {
  attendance_id: number;
  attendance?: IAttendanceList;
  user_id: string;
  user?: IUser;
  quantity: number;
}

export interface IAttendanceGuest {
  id: number;
  attendance_id: number;
  user_id: string;
  user?: IUser;
  name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: "guest" | "newcomer";
  created_at?: string;
}

export interface IAttendanceDetail {
  id?: number;
  attendance_id?: number;
  total_attendance?: number;
  total_newcomer?: number;
  total_musician?: number;
  total_servant?: number;
  preacher?: string;
  coordinator?: string;
  total_sunday_school?: number;
  location_id?: number;
  location?: ILocation;
}

export interface IAttendanceRegistration {
  id?: number;
  user_id: string;
  user?: IUser;
  registration_id: number;
  registration?: IRegistration;
  event_category_id: number;
  event_categories?: IEventCategory;
  event_booking_id: number;
  event_bookings?: IEventBooking;
  status?: "scanned" | "not_scanned";
  created_at?: string;
}
