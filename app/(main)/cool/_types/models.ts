import { SmallGroupRole } from "@/types/small-group";

export interface UserFile {
  file: {
    link: string;
  };
}

export interface SmallGroupUser {
  id: string;
  bio: string | null;
  nij: string | null;
  name: string;
  gender: string | null;
  website: string | null;
  nickname: string;
  birthdate: string | null;
  user_file: UserFile | null;
  created_at: string;
  relationship_status: string | null;
}

export interface SmallGroupMember {
  role: SmallGroupRole;
  user: SmallGroupUser;
  user_id: string;
  created_at: string;
  deleted_at: string | null;
  small_group_id: number;
}

export interface AttendanceUser {
  user_id: string;
  quantity: number;
  attendance_id: number;
}

export interface Attendance {
  id: number;
  date: string;
  name: string;
  end_time: string;
  created_at: string;
  start_time: string;
  location_id: number;
  attendance_user: AttendanceUser[];
}

export interface SmallGroupAttendance {
  attendance: Attendance;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  address: string;
  city_id: number | null;
  is_open: boolean;
  capacity: number | null;
  long_lat: [number, number];
  age_group: string;
  created_at: string;
  is_private: boolean;
  description: string | null;
  district_id: number | null;
  postal_code: string | null;
  province_id: number | null;
}

export interface SmallGroupLocation {
  location: Location;
}

export interface SmallGroupFile {
  file: {
    link: string;
  };
}

export interface SmallGroupData {
  id: number;
  church_id: number;
  name: string;
  description: string;
  meet_time: string;
  created_at: string;
  deleted_at: string | null;
  location_id: number;
  small_group_attendance: SmallGroupAttendance[];
  small_group_location: SmallGroupLocation[];
  small_group_user: SmallGroupMember[];
  small_group_file: SmallGroupFile | null;
}
