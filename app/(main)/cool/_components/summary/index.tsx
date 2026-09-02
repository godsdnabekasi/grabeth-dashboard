"use client";

import { useCallback, useMemo, useState } from "react";

import { TrendingUp } from "lucide-react";
import moment from "moment";

import { useQuery } from "@tanstack/react-query";

import {
  formatMonthKey,
  useSmallGroupReport,
} from "../../_hooks/useCoolSummary";
import type { FilterPeriod, PulseStatus } from "../../_types";
import CoolSection from "../section";
import CoolSummaryChart from "./chart";
import CoolSummaryFilter from "./filter";
import CoolSummaryMember from "./member";
import { fetchSmallGroupById } from "@/app/(main)/cool/_hooks/useCoolDetail";
import { Card } from "@/components/ui/card";
import LoadingSection from "@/components/ui/loading-section";
import { ISmallGroup } from "@/types/small-group";

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

export default function CoolSummary({ id }: { id: number }) {
  const [filter, setFilter] = useState<FilterPeriod>(1);
  const [period, setPeriod] = useState(() => ({
    start_date: moment().startOf("month").format("DD MMM YYYY"),
    end_date: moment().endOf("month").format("DD MMM YYYY"),
  }));

  const { data: smallGroupData, isLoading } = useQuery({
    queryKey: ["cool-detail", id, period.start_date, period.end_date],
    queryFn: async () => {
      const { smallGroupData } = await fetchSmallGroupById(
        id,
        period.start_date,
        period.end_date
      );
      return smallGroupData;
    },
    enabled: !!id,
  });

  const report = useSmallGroupReport(smallGroupData as ISmallGroup, filter);

  const pulseStyle = PULSE_STYLES[report?.pulse?.key || "tidak-aktif"];

  const chartData = useMemo(() => {
    if (!report) return [];
    return report.months.map((m, i) => ({
      label: formatMonthKey(m),
      count: report.monthlyMeetings[i],
      met: report.monthlyMeetings[i] >= report.targetPerMonth,
    }));
  }, [report]);

  const onChangePeriod = useCallback((newPeriod: FilterPeriod) => {
    const periodMonth = moment().subtract(
      newPeriod === 1 ? 0 : newPeriod,
      "month"
    );

    setPeriod({
      start_date: periodMonth.startOf("month").format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
    });
    setFilter(newPeriod);
  }, []);

  const metricsCards = useMemo(() => {
    if (!report) return [];
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

  if (isLoading || !report) {
    return (
      <CoolSection
        title="Group Health & Activity"
        description="Monitor engagement and attendance trends."
        icon={TrendingUp}
      >
        <LoadingSection />
      </CoolSection>
    );
  }

  return (
    <CoolSection
      title="Group Health & Activity"
      description="Monitor engagement and attendance trends."
      icon={TrendingUp}
      action={<CoolSummaryFilter onChangePeriod={onChangePeriod} />}
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
        <CoolSummaryMember members={report.members} report={report} />
      </div>
    </CoolSection>
  );
}
