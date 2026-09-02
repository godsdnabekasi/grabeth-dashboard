import { SmallGroupRole } from "@/types/small-group";

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
