"use client";

import { useState } from "react";

import { Eye } from "lucide-react";

import { fetchParticipantDetailAction } from "./actions";
import { ClassUserResult } from "@/app/(main)/quiz/_components/user/participantDetail";
import { ParticipantDetailModal } from "@/app/(main)/quiz/_components/user/user-detail-modal";
import { Button } from "@/components/ui/button";

type Props = {
  classId: number;
  participants: ClassUserResult[];
};

export function ParticipantList({ classId, participants }: Props) {
  const [selected, setSelected] = useState<ClassUserResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openDetail(participant: ClassUserResult) {
    setSelected(participant);
    setModalOpen(true);
  }

  return (
    <>
      {/* your existing table — just add the eye button per row */}
      <div className="divide-y rounded-lg border">
        {participants.map((p) => (
          <div key={p.userId} className="flex items-center gap-3 px-4 py-3">
            <p className="flex-1 text-sm font-medium">{p.userName}</p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {p.scoreLabel}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openDetail(p)}
              aria-label={`Lihat detail jawaban ${p.userName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* modal */}
      <ParticipantDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        classId={classId}
        participant={selected}
        fetchDetail={fetchParticipantDetailAction}
      />
    </>
  );
}
