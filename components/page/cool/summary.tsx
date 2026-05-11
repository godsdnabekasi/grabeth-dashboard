"use client";

import { useMemo, useState } from "react";

import { TrendingUp } from "lucide-react";

import type { FilterPeriod, PulseStatus } from "./types";
import { formatMonthKey, useSmallGroupReport } from "./useCoolSummary";
import { ISelectedMember } from "@/components/page/cool/member-item";
import { ISelectedChangedMember } from "@/components/page/cool/member-setting-modal";
import CoolSection from "@/components/page/cool/section";
import CoolSummaryChart from "@/components/page/cool/summary/chart";
import CoolSummaryFilter from "@/components/page/cool/summary/filter";
import CoolSummaryMember from "@/components/page/cool/summary/member";
import { Card } from "@/components/ui/card";
import { ISmallGroup } from "@/types/small-group";

interface SmallGroupReportProps {
  data: ISmallGroup;
  today?: Date;
  onChangePeriod?: (period: FilterPeriod) => void;
  onRemoveMember?: (data: string[]) => void;
  onChangedMember?: (data: ISelectedChangedMember[]) => void;
  onAddMember?: (data: ISelectedMember[]) => void;
}

const PULSE_STYLES: Record<
  PulseStatus,
  { badge: string; dot: string; text: string }
> = {
  semangat: {
    badge: "bg-green-50 text-green-800",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  aktif: {
    badge: "bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },
  stabil: {
    badge: "bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  lesu: {
    badge: "bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  "tidak-aktif": {
    badge: "bg-red-50 text-red-800",
    dot: "bg-red-500",
    text: "text-red-700",
  },
};

export default function CoolSummary({
  data,
  today = new Date(),
  onChangePeriod,
  onChangedMember,
  onRemoveMember,
  onAddMember,
}: SmallGroupReportProps) {
  const [filter, setFilter] = useState<FilterPeriod>(1);
  const report = useSmallGroupReport(data, filter, today);
  const pulseStyle = PULSE_STYLES[report.pulse.key];

  const chartData = report.months.map((m, i) => ({
    label: formatMonthKey(m),
    count: report.monthlyMeetings[i],
    met: report.monthlyMeetings[i] >= report.targetPerMonth,
  }));

  const handleFilterChange = (value: FilterPeriod) => {
    setFilter(value);
    onChangePeriod?.(value);
  };

  const metricsCards = useMemo(() => {
    return [
      {
        title: "Rata-rata kehadiran",
        value: report.avgAttendance.toFixed(1),
        unit: `Target: ${report.months.length * report.targetPerMonth}x`,
      },
      {
        title: "Total pertemuan",
        value: report.totalMeetings,
        unit: `Target: ${report.months.length * report.targetPerMonth}x`,
      },
      {
        title: "COOL Pulse",
        value: (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-2 ${pulseStyle.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${pulseStyle.dot}`} />
            {report.pulse.label}
          </span>
        ),
        unit: `Rata-rata/bulan: ${report.avgMeetingsPerMonth.toFixed(1)}x`,
      },
      {
        title: "Consistency",
        value: `${report.metMonths}/${report.months.length}`,
        unit: `${
          report.months.length > 0
            ? Math.round((report.metMonths / report.months.length) * 100)
            : 0
        }
            % dari total bulan`,
      },
    ];
  }, [pulseStyle, report]);

  return (
    <CoolSection
      title="Group Health & Activity"
      description="Monitor engagement and attendance trends."
      icon={TrendingUp}
      action={<CoolSummaryFilter onChangePeriod={handleFilterChange} />}
    >
      <div className="space-y-5 p-1">
        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metricsCards.map((card) => (
            <Card
              key={card.title}
              className="py-4"
              contentClassName="space-y-1 px-4"
            >
              <p className="text-xs text-gray-400">{card.title}</p>
              <p className="text-2xl font-medium text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400">{card.unit}</p>
            </Card>
          ))}
        </div>

        {/* Chart card */}
        <CoolSummaryChart
          chartData={chartData}
          targetPerMonth={report.targetPerMonth}
        />

        {/* Member consistency */}
        <CoolSummaryMember
          members={report.members}
          report={report}
          onRemove={onRemoveMember}
          onChanged={onChangedMember}
          onAdd={onAddMember}
        />
      </div>
    </CoolSection>
  );
}
