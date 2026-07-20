import { ParticipantDetailData } from "@/app/(main)/quiz/_components/user/participantDetail";
import { cn } from "@/lib/utils";

type Props = {
  data: ParticipantDetailData;
};

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return (
    date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB"
  );
}

function scoreColor(percent: number | null) {
  if (percent == null)
    return {
      ring: "border-border",
      bg: "bg-muted",
      text: "text-muted-foreground",
      bar: "bg-muted-foreground",
    };
  if (percent >= 75)
    return {
      ring: "border-green-500",
      bg: "bg-green-50 dark:bg-green-950",
      text: "text-green-700 dark:text-green-300",
      bar: "bg-green-500",
    };
  if (percent >= 50)
    return {
      ring: "border-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950",
      text: "text-amber-700 dark:text-amber-300",
      bar: "bg-amber-500",
    };
  return {
    ring: "border-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
  };
}

export function ScoreSummary({ data }: Props) {
  const { participant: p, answers } = data;
  const colors = scoreColor(p.scorePercent);
  const answerableCount = answers.filter((a) => a.isCorrect !== null).length;

  return (
    <div className="flex items-center gap-4 border-b px-5 py-4">
      {/* circle */}
      <div
        className={cn(
          "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-[3px]",
          colors.ring,
          colors.bg
        )}
      >
        <span className="text-base font-semibold leading-none">
          {p.totalScore ?? "—"}
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">
          / {p.totalPoint ?? "—"}
        </span>
      </div>

      {/* progress rows */}
      <div className="flex flex-1 flex-col gap-1.5">
        <ProgressRow
          label="Persentase skor"
          value={`${p.scorePercent ?? 0}%`}
          percent={p.scorePercent ?? 0}
          barClass={colors.bar}
          valueClass={colors.text}
        />
        <ProgressRow
          label="Jawaban benar"
          value={`${data.correctCount} / ${answerableCount} soal`}
          percent={
            answerableCount > 0
              ? (data.correctCount / answerableCount) * 100
              : 0
          }
          barClass="bg-green-500"
        />
        <ProgressRow
          label="Poin didapat"
          value={p.scoreLabel}
          percent={p.scorePercent ?? 0}
          barClass="bg-blue-400"
        />
      </div>

      {/* time */}
      <div className="flex shrink-0 flex-col gap-1.5">
        <TimeRow icon="ti-player-play" label={formatTime(p.startedAt)} />
        <TimeRow icon="ti-player-stop" label={formatTime(p.finishedAt)} />
        <div className="mt-0.5 text-center text-xs text-muted-foreground">
          {p.durationLabel}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  percent,
  barClass,
  valueClass,
}: {
  label: string;
  value: string;
  percent: number;
  barClass: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            barClass
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span
        className={cn(
          "w-20 text-right font-medium tabular-nums",
          valueClass ?? "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function TimeRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <i className={cn("ti", icon)} aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </div>
  );
}
