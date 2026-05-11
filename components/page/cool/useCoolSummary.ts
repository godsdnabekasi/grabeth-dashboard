import { useMemo } from "react";

import type {
  FilterPeriod,
  MemberReport,
  PulseInfo,
  PulseStatus,
  SmallGroupReport,
} from "./types";
import { ISmallGroup, SmallGroupRole } from "@/types/small-group";

const TARGET_PER_MONTH = 3;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const PERIOD_LABELS: Record<FilterPeriod, string> = {
  1: "Bulan ini",
  3: "3 bulan terakhir",
  6: "6 bulan terakhir",
  12: "1 tahun terakhir",
};

const PULSE_MAP: Record<PulseStatus, PulseInfo> = {
  semangat: {
    key: "semangat",
    label: "Semangat",
    description: "Pertemuan aktif & kehadiran tinggi",
  },
  aktif: {
    key: "aktif",
    label: "Aktif",
    description: "Pertemuan rutin, kehadiran baik",
  },
  stabil: {
    key: "stabil",
    label: "Stabil",
    description: "Memenuhi target pertemuan minimal",
  },
  lesu: {
    key: "lesu",
    label: "Lesu",
    description: "Pertemuan di bawah target 3x/bulan",
  },
  "tidak-aktif": {
    key: "tidak-aktif",
    label: "Tidak Aktif",
    description: "Tidak ada pertemuan tercatat",
  },
};

function getFilterRange(
  filter: FilterPeriod,
  today: Date
): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (filter) {
    case 1:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 3:
      start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      break;
    case 6:
      start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      break;
    case 12:
      start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
      break;
  }

  return { start, end };
}

function getMonthsInRange(start: Date, end: Date): string[] {
  const months: string[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cur <= end) {
    months.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`
    );
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  return months;
}

function computePulse(
  avgMeetingsPerMonth: number,
  avgAttendance: number
): PulseStatus {
  if (avgMeetingsPerMonth === 0) return "tidak-aktif";
  if (avgMeetingsPerMonth < 2) return "lesu";
  if (avgAttendance >= 4) return "semangat";
  if (avgAttendance >= TARGET_PER_MONTH) return "aktif";
  return "stabil";
}

export function formatMonthKey(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]} '${year.slice(2)}`;
}

export function useSmallGroupReport(
  data: ISmallGroup,
  filter: FilterPeriod,
  today: Date = new Date()
): SmallGroupReport {
  return useMemo(() => {
    const { start, end } = getFilterRange(filter, today);
    const months = getMonthsInRange(start, end);

    // Filter attendances within range
    const filteredAttendances = data.small_group_attendance?.filter(
      ({ attendance }) => {
        const d = new Date(attendance.date);
        return d >= start && d <= end;
      }
    );

    // Group attendances by month key
    const byMonth: Record<string, typeof filteredAttendances> = {};
    months.forEach((m) => (byMonth[m] = []));
    filteredAttendances?.forEach((item) => {
      const m = item.attendance.date.slice(0, 7);
      if (byMonth[m]) byMonth[m].push(item);
    });

    // Metrics
    const totalMeetings = filteredAttendances?.length || 0;
    const totalAttendees = filteredAttendances?.reduce(
      (sum, { attendance }) => sum + (attendance.attendance_user?.length ?? 0),
      0
    );
    const avgAttendance =
      totalMeetings > 0 ? (totalAttendees ?? 0) / totalMeetings : 0;
    const monthlyMeetings = months.map((m) => byMonth[m]?.length || 0);
    const avgMeetingsPerMonth =
      months.length > 0
        ? monthlyMeetings.reduce((a, b) => a + b, 0) / months.length
        : 0;
    const metMonths = monthlyMeetings.filter(
      (c) => c >= TARGET_PER_MONTH
    ).length;

    // Pulse
    const pulseKey = computePulse(avgMeetingsPerMonth, avgAttendance);
    const pulse = PULSE_MAP[pulseKey];

    // Member stats — only members who appear in attendance or are registered
    // Filter out entries where user_id or role is missing so they're guaranteed defined below
    const members: MemberReport[] = data
      .small_group_user!.filter(
        (sgu): sgu is typeof sgu & { user_id: string; role: SmallGroupRole } =>
          sgu.user_id != null && sgu.role != null
      )
      .map((sgu) => {
        const userId = sgu.user_id;

        // Count how many meetings the member attended per month
        const monthlyAttend: Record<string, number> = {};
        months.forEach((m) => {
          monthlyAttend[m] =
            byMonth[m]?.filter(({ attendance }) =>
              attendance.attendance_user?.some((au) => au.user_id === userId)
            ).length || 0;
        });

        const totalAttend = Object.values(monthlyAttend).reduce(
          (a, b) => a + b,
          0
        );

        // Only consider months that actually had at least 1 meeting
        const activeMonths = months.filter(
          (m) => (byMonth[m]?.length || 0) > 0
        );

        // Per-month consistency: relative to how many meetings actually happened
        // konsisten = hadir semua pertemuan di bulan itu (100%)
        // cukup     = hadir ≥50% pertemuan di bulan itu
        // jarang    = hadir <50% pertemuan di bulan itu
        const monthStatus = activeMonths.map((m) => {
          const totalInMonth = byMonth[m]?.length || 0;
          const attendedInMonth = monthlyAttend[m];
          const ratio = totalInMonth > 0 ? attendedInMonth / totalInMonth : 0;

          if (ratio === 1) return "konsisten" as const;
          if (ratio >= 0.5) return "cukup" as const;
          return "jarang" as const;
        });

        // Aggregate across all active months in the period:
        // konsisten = konsisten di semua bulan aktif
        // cukup     = konsisten/cukup di ≥50% bulan aktif
        // jarang    = sisanya
        const consistency = (() => {
          if (activeMonths.length === 0) return "tidak-konsisten" as const;
          const konsistenMonths = monthStatus.filter(
            (s) => s === "konsisten"
          ).length;
          const cukupOrAbove = monthStatus.filter((s) => s !== "jarang").length;
          const ratio = cukupOrAbove / activeMonths.length;

          if (konsistenMonths === activeMonths.length)
            return "konsisten" as const;
          if (ratio >= 0.5) return "cukup" as const;
          if (ratio >= 0.1) return "jarang" as const;
          return "tidak-konsisten" as const;
        })();

        const attendancePct =
          totalMeetings > 0
            ? Math.round((totalAttend / totalMeetings) * 100)
            : 0;

        return {
          id: userId,
          name: sgu.user?.name ?? "",
          role: sgu.role,
          avatarUrl: sgu.user?.user_file?.file?.link ?? null,
          totalAttend,
          monthlyAttend,
          consistency,
          attendancePct,
          joinedAt: sgu.created_at,
        } satisfies MemberReport;
      })
      .sort((a, b) => {
        const order = {
          konsisten: 0,
          cukup: 1,
          jarang: 2,
          "tidak-konsisten": 3,
        };
        return (
          order[a.consistency] - order[b.consistency] ||
          b.totalAttend - a.totalAttend
        );
      });

    return {
      periodLabel: PERIOD_LABELS[filter],
      months,
      totalMeetings,
      avgAttendance,
      avgMeetingsPerMonth,
      targetPerMonth: TARGET_PER_MONTH,
      metMonths,
      monthlyMeetings,
      pulse,
      members,
    };
  }, [data, filter, today]);
}
