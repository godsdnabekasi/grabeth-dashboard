import {
  formatMonthKey,
  useSmallGroupReport,
} from "../../_hooks/useCoolSummary";
import { MemberReport } from "../../_types";
import MemberRow from "@/app/(main)/cool/_components/member/member-row";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface IProps {
  members: MemberReport[];
  report: ReturnType<typeof useSmallGroupReport>;
}

const CONSISTENCY_STYLES = {
  konsisten: {
    bar: "bg-green-600",
    label: "text-green-600",
    text: "Konsisten",
  },
  cukup: { bar: "bg-violet-600", label: "text-violet-600", text: "Cukup" },
  jarang: { bar: "bg-amber-600", label: "text-amber-600", text: "Jarang" },
  "tidak-konsisten": {
    bar: "bg-red-600",
    label: "text-red-600",
    text: "Perlu peningkatan",
  },
};

const CoolSummaryMember = ({ members, report }: IProps) => {
  const metCount = members.filter((m) => m.consistency === "konsisten").length;
  const cukupCount = members.filter((m) => m.consistency === "cukup").length;
  const jarangCount = members.filter((m) => m.consistency === "jarang").length;
  const tidakCount = members.filter(
    (m) => m.consistency === "tidak-konsisten"
  ).length;

  const membersData = report.members;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Members
          </p>
          <div className="flex gap-3 text-xs text-gray-400">
            {!!metCount && (
              <Badge className="bg-green-100 text-green-600">
                {metCount} konsisten
              </Badge>
            )}
            {!!cukupCount && (
              <Badge className="bg-violet-100 text-violet-600">
                {cukupCount} cukup
              </Badge>
            )}
            {!!jarangCount && (
              <Badge className="bg-amber-100 text-amber-600">
                {jarangCount} jarang
              </Badge>
            )}
            {!!tidakCount && (
              <Badge className="bg-red-100 text-red-600">
                {tidakCount} perlu peningkatan
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        {membersData.length > 0 ? (
          membersData.map((member) => {
            const consistency =
              CONSISTENCY_STYLES[member.consistency || "tidak-konsisten"];
            return (
              <MemberRow
                key={member.id}
                member={member}
                action={
                  <div>
                    {/* Dot attendance per month (only if multi-month) */}
                    {report.months.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {report.months.map((mo) => {
                          const met = (member.monthlyAttend?.[mo] ?? 0) >= 3;
                          const met3 = (member.monthlyAttend?.[mo] ?? 0) >= 1;
                          return (
                            <span
                              key={mo}
                              title={`${formatMonthKey(mo)}: ${member.monthlyAttend?.[mo] ?? 0}x`}
                              className={`w-2.5 h-2.5 rounded-full ${met ? "bg-green-500" : met3 ? "bg-amber-500" : "bg-gray-300"}`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Consistency bar + label */}
                    <div className="w-42 shrink-0">
                      <p
                        className={`text-xs mb-1 font-medium ${consistency.label}`}
                      >
                        {consistency.text} • ({member.totalAttend}x hadir)
                      </p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${consistency.bar}`}
                          style={{ width: `${member.attendancePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada data member
          </p>
        )}
      </div>
      {report.months.length > 1 && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dot per bulan:</p>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Hadir ≥3x
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
            Kurang dari 3x
          </span>
        </div>
      )}
    </Card>
  );
};

export default CoolSummaryMember;
