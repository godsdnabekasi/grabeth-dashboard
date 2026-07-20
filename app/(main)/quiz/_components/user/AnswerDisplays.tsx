import { Check, X } from "lucide-react";

import {
  AnswerDisplay,
  RangeCondition,
} from "@/app/(main)/quiz/_components/user/participantDetail";
import { cn } from "@/lib/utils";

// ── Select ────────────────────────────────────────────────────────────────────

export function SelectAnswerDisplay({
  display,
}: {
  display: Extract<AnswerDisplay, { kind: "select" }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <AnswerSection label="Jawaban peserta">
        <AnswerChip correct={display.isCorrect}>
          {display.selected || "—"}
        </AnswerChip>
      </AnswerSection>
      <CorrectAnswerRow>{display.correct}</CorrectAnswerRow>
    </div>
  );
}

// ── Multiple select ───────────────────────────────────────────────────────────

export function MultipleSelectAnswerDisplay({
  display,
}: {
  display: Extract<AnswerDisplay, { kind: "multiple_select" }>;
}) {
  const { selected, correct } = display;

  return (
    <div className="flex flex-col gap-2">
      <AnswerSection label="Jawaban peserta">
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Tidak ada jawaban
            </span>
          ) : (
            selected.map((s) => {
              const isCorrect = correct.some(
                (c) => c.toLowerCase() === s.toLowerCase()
              );
              return (
                <AnswerChip key={s} correct={isCorrect}>
                  {s}
                </AnswerChip>
              );
            })
          )}
        </div>
      </AnswerSection>
      <CorrectAnswerRow>{correct.join(", ")}</CorrectAnswerRow>
    </div>
  );
}

// ── Text (short / long) ───────────────────────────────────────────────────────

export function TextAnswerDisplay({
  display,
}: {
  display: Extract<AnswerDisplay, { kind: "text" }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <AnswerSection label="Jawaban peserta">
        <p className="text-sm leading-relaxed">
          {display.value || <EmptyAnswer />}
        </p>
      </AnswerSection>
      {display.correct && (
        <CorrectAnswerRow>{display.correct}</CorrectAnswerRow>
      )}
    </div>
  );
}

// ── Range ─────────────────────────────────────────────────────────────────────

export function RangeAnswerDisplay({
  display,
}: {
  display: Extract<AnswerDisplay, { kind: "range" }>;
}) {
  const { value, min, max, step, correctCondition } = display;
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const conditionLabel = formatConditionLabel(correctCondition);
  const isCorrect = checkCondition(value, correctCondition);
  const conditionPercent = correctCondition
    ? ((correctCondition.value - min) / (max - min)) * 100
    : null;

  return (
    <div className="flex flex-col gap-2">
      <AnswerSection label="Jawaban peserta">
        <div className="flex items-center gap-3 pr-2">
          <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">
            {min}
          </span>
          <div className="relative h-1.5 flex-1 overflow-visible rounded-full bg-border">
            {/* fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-violet-400"
              style={{ width: `${percent}%` }}
            />
            {/* correct threshold marker */}
            {conditionPercent != null && (
              <div
                className="absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green-500 shadow"
                style={{ left: `${conditionPercent}%` }}
                title={conditionLabel ?? ""}
              />
            )}
            {/* user thumb */}
            <div
              className={cn(
                "absolute top-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow",
                isCorrect === true
                  ? "border-green-500"
                  : isCorrect === false
                    ? "border-red-500"
                    : "border-violet-500"
              )}
              style={{ left: `${percent}%` }}
            />
          </div>
          <span className="w-5 text-xs tabular-nums text-muted-foreground">
            {max}
          </span>
          <span
            className={cn(
              "min-w-8 text-right text-sm font-semibold tabular-nums",
              isCorrect === true
                ? "text-green-600"
                : isCorrect === false
                  ? "text-red-600"
                  : "text-violet-600"
            )}
          >
            {value}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Min: {min} · Max: {max} · Step: {step}
        </p>
      </AnswerSection>
      {conditionLabel && (
        <CorrectAnswerRow>
          {conditionLabel} · Jawaban: <strong>{value}</strong>
        </CorrectAnswerRow>
      )}
    </div>
  );
}

function formatConditionLabel(c: RangeCondition | null): string | null {
  if (!c) return null;
  if (c.operator === "between" && c.valueTo != null)
    return `Benar jika antara ${c.value} – ${c.valueTo}`;
  const opLabel: Record<string, string> = {
    ">=": "≥",
    "<=": "≤",
    "=": "=",
  };
  return `Benar jika ${opLabel[c.operator] ?? c.operator} ${c.value}`;
}

function checkCondition(
  value: number,
  c: RangeCondition | null
): boolean | null {
  if (!c) return null;
  switch (c.operator) {
    case ">=":
      return value >= c.value;
    case "<=":
      return value <= c.value;
    case "=":
      return value === c.value;
    case "between":
      return c.valueTo != null ? value >= c.value && value <= c.valueTo : null;
    default:
      return null;
  }
}

// ── Info / Content ────────────────────────────────────────────────────────────

export function InfoAnswerDisplay() {
  return (
    <p className="text-xs italic text-muted-foreground">
      Ini adalah blok informasi, bukan pertanyaan. Tidak ada jawaban atau poin.
    </p>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function AnswerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function AnswerChip({
  correct,
  children,
}: {
  correct: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        correct
          ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          : "border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      )}
    >
      {correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {children}
    </span>
  );
}

function CorrectAnswerRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 rounded-md bg-green-50 px-2.5 py-2 text-xs text-green-800 dark:bg-green-950 dark:text-green-300">
      <Check className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>Jawaban benar: {children}</span>
    </div>
  );
}

function EmptyAnswer() {
  return (
    <span className="text-muted-foreground italic">Tidak ada jawaban</span>
  );
}
