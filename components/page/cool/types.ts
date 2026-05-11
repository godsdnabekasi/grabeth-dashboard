import z from "zod";

import { SmallGroupRole } from "@/types/small-group";

const REQUIRED_MSG = "Required";

const locationSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    address: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
  })
  .optional()
  .nullable()
  .superRefine((data, ctx) => {
    if (!data) return;
    if (data.name && !data.address) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["address"],
      });
    }
    if (data.lat && !data.name) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_MSG,
        path: ["name"],
      });
    }
  });

const memberSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  joinedDate: z.string().optional(),
  image: z.string().optional().nullable(),
  selected: z.boolean().optional(),
  newRole: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const coolSchema = z.object({
  id: z.number().optional(),
  coverImage: z.any().optional(),
  name: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  description: z.string(REQUIRED_MSG).optional(),
  church_id: z.string().optional(),
  day: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  time: z.string(REQUIRED_MSG).min(1, REQUIRED_MSG),
  location: locationSchema,
  members: memberSchema.array().optional(),
});

export type CoolFormValues = z.infer<typeof coolSchema>;

export type FilterPeriod = 1 | 3 | 6 | 12;

export type ConsistencyStatus =
  | "konsisten"
  | "cukup"
  | "jarang"
  | "tidak-konsisten";

export type PulseStatus =
  | "semangat"
  | "aktif"
  | "stabil"
  | "lesu"
  | "tidak-aktif";

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

export interface MonthlyAttendance {
  [monthKey: string]: number;
}

export interface MemberReport {
  id: string;
  name: string;
  role: SmallGroupRole;
  newRole?: SmallGroupRole;
  avatarUrl?: string | null;
  joinedAt?: string;
  totalAttend?: number;
  monthlyAttend?: MonthlyAttendance;
  consistency?: ConsistencyStatus;
  attendancePct?: number;
}

export interface PulseInfo {
  key: PulseStatus;
  label: string;
  description: string;
}

export interface SmallGroupReport {
  periodLabel: string;
  months: string[];
  totalMeetings: number;
  avgAttendance: number;
  avgMeetingsPerMonth: number;
  targetPerMonth: number;
  metMonths: number;
  monthlyMeetings: number[];
  pulse: PulseInfo;
  members: MemberReport[];
}
