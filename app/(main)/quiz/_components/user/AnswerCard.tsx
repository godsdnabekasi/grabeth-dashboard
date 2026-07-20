"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  InfoAnswerDisplay,
  MultipleSelectAnswerDisplay,
  RangeAnswerDisplay,
  SelectAnswerDisplay,
  TextAnswerDisplay,
} from "./AnswerDisplays";
import {
  QuestionType,
  UserAnswerDetail,
} from "@/app/(main)/quiz/_components/user/participantDetail";
import { cn } from "@/lib/utils";

// ── type badge ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<QuestionType, { label: string; className: string }> =
  {
    select: {
      label: "Select",
      className: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    multiple_select: {
      label: "Multiple select",
      className:
        "bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    },
    short_text: {
      label: "Short text",
      className:
        "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    long_text: {
      label: "Long text",
      className:
        "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    range: {
      label: "Range",
      className: "bg-pink-50 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
    },
    content: { label: "Content", className: "bg-muted text-muted-foreground" },
    video_content: {
      label: "Video",
      className:
        "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    url: {
      label: "URL",
      className:
        "bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    },
  };

// ── number indicator ──────────────────────────────────────────────────────────

function QuestionNumber({
  order,
  isCorrect,
}: {
  order: number;
  isCorrect: boolean | null;
}) {
  const cls =
    isCorrect === true
      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      : isCorrect === false
        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        : "bg-muted text-muted-foreground";
  return (
    <div
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold mt-0.5",
        cls
      )}
    >
      {order}
    </div>
  );
}

// ── point badge ───────────────────────────────────────────────────────────────

function PointBadge({
  point,
  maxPoint,
}: {
  point: number | null;
  maxPoint: number | null;
}) {
  if (maxPoint == null) {
    return (
      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        —
      </span>
    );
  }
  const isFullMark = point != null && point >= maxPoint;
  const isZero = point == null || point === 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
        isFullMark
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : isZero
            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      )}
    >
      {point ?? 0} / {maxPoint}
    </span>
  );
}

// ── card ──────────────────────────────────────────────────────────────────────

type Props = {
  answer: UserAnswerDetail;
  defaultOpen?: boolean;
};

export function AnswerCard({ answer, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const typeConfig = TYPE_CONFIG[answer.type];
  const display = answer.answerDisplay;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-2.5 bg-muted/40 px-3.5 py-2.5 text-left hover:bg-muted/60 transition-colors"
        aria-expanded={open}
      >
        <QuestionNumber order={answer.order} isCorrect={answer.isCorrect} />
        <p className="flex-1 text-sm font-medium leading-snug">
          {answer.title}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              typeConfig.className
            )}
          >
            {typeConfig.label}
          </span>
          <PointBadge point={answer.point} maxPoint={answer.maxPoint} />
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* body */}
      {open && (
        <div className="border-t border-border px-3.5 py-3">
          {display.kind === "select" && (
            <SelectAnswerDisplay display={display} />
          )}
          {display.kind === "multiple_select" && (
            <MultipleSelectAnswerDisplay display={display} />
          )}
          {display.kind === "text" && <TextAnswerDisplay display={display} />}
          {display.kind === "range" && <RangeAnswerDisplay display={display} />}
          {display.kind === "info" && <InfoAnswerDisplay />}
        </div>
      )}
    </div>
  );
}
