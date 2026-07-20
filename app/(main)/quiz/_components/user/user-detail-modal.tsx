"use client";

import { useCallback, useEffect, useState } from "react";

import { X } from "lucide-react";

import { AnswerCard } from "./AnswerCard";
import { ScoreSummary } from "./ScoreSummary";
import {
  ClassUserResult,
  ParticipantDetailData,
} from "@/app/(main)/quiz/_components/user/participantDetail";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
];

function hashColor(str: string): string {
  let hash = 0;
  for (const ch of str) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ProfileStrip({ participant: p }: { participant: ClassUserResult }) {
  const colorClass = hashColor(p.userId);
  return (
    <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
      >
        {getInitials(p.userName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{p.userName}</p>
        <p className="text-xs text-muted-foreground">
          {[p.userNij, p.userNickname].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 gap-4 text-right">
        <div>
          <p className="text-sm font-medium tabular-nums">{p.durationLabel}</p>
          <p className="text-[11px] text-muted-foreground">Durasi</p>
        </div>
        <div>
          <p className="text-sm font-medium">{p.submitDateLabel}</p>
          <p className="text-[11px] text-muted-foreground">Submit</p>
        </div>
      </div>
    </div>
  );
}

// ── loading skeleton ──────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5">
      <Skeleton className="h-20 w-full rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ── modal ─────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  participant: ClassUserResult | null;
  // Pass a server action or fetch fn to keep service logic server-side
  fetchDetail: (
    classId: number,
    participant: ClassUserResult
  ) => Promise<ParticipantDetailData>;
};

export function ParticipantDetailModal({
  open,
  onOpenChange,
  classId,
  participant,
  fetchDetail,
}: Props) {
  const [data, setData] = useState<ParticipantDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(
    async (classId: number, participant: ClassUserResult) => {
      try {
        setLoading(true);
        const res = await fetchDetail(classId, participant);
        setData(res);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error instanceof Error ? error.message : "Terjadi kesalahan");
      }
    },
    [fetchDetail]
  );

  useEffect(() => {
    if (open && participant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetcher(classId, participant);
    }
  }, [open, participant, classId, fetcher]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* dialog header */}
        <AlertDialogHeader className="flex-row items-start justify-between border-b px-5 py-4 [&>button]:hidden">
          <div>
            <DialogTitle className="text-base font-medium">
              Detail jawaban peserta
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {participant?.userName ?? "—"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogHeader>

        {/* profile strip */}
        {participant && <ProfileStrip participant={participant} />}

        {/* content */}
        <div className="flex-1 overflow-y-auto">
          {loading && <DetailSkeleton />}

          {error && (
            <div className="flex items-center justify-center p-10 text-sm text-destructive">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* score summary */}
              <ScoreSummary data={data} />

              {/* answer list */}
              <div className="flex flex-col gap-2 p-4">
                {data.answers.map((answer, idx) => (
                  <AnswerCard
                    key={answer.questionId}
                    answer={answer}
                    // expand first two by default
                    defaultOpen={idx < 2}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* footer */}
        {data && (
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {data.correctCount}
              </span>{" "}
              benar
              {" · "}
              <span className="font-medium text-foreground">
                {data.wrongCount}
              </span>{" "}
              salah
              {" · "}
              <span className="font-medium text-foreground">
                {data.infoCount}
              </span>{" "}
              info
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
