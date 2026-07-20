"use server";

import {
  ClassUserResult,
  ParticipantDetailData,
} from "@/app/(main)/quiz/_components/user/participantDetail";
import { getParticipantDetail } from "@/app/(main)/quiz/_components/user/participantDetail.service";

export async function fetchParticipantDetailAction(
  classId: number,
  participant: ClassUserResult
): Promise<ParticipantDetailData> {
  return getParticipantDetail(classId, participant);
}
