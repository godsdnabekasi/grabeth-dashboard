import type {
  AnswerDisplay,
  ParticipantDetailData,
  QuestionType,
  RangeCondition,
  UserAnswerDetail,
} from "@/app/(main)/quiz/_components/user/participantDetail";
import type { ClassUserResult } from "@/app/(main)/quiz/_components/user/participantDetail";
import { supabaseClient } from "@/lib/supabase/client";

// ── raw DB types ──────────────────────────────────────────────────────────────

type RawAnswer = {
  question_id: number;
  answer: unknown;
  point: number | null;
  started_at: string | null;
  finished_at: string | null;
  question: {
    id: number;
    order: number;
    title: string;
    type: QuestionType;
    detail: Record<string, unknown> | null;
    correct_answer: string | null;
    point: number | null;
  } | null;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function parseRangeCondition(raw: string | null): RangeCondition | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RangeCondition;
  } catch {
    return null;
  }
}

function checkRangeCorrect(
  value: number,
  condition: RangeCondition | null
): boolean | null {
  if (!condition) return null;
  switch (condition.operator) {
    case ">=":
      return value >= condition.value;
    case "<=":
      return value <= condition.value;
    case "=":
      return value === condition.value;
    case "between":
      return condition.valueTo != null
        ? value >= condition.value && value <= condition.valueTo
        : null;
    default:
      return null;
  }
}

function parseAnswerDisplay(
  type: QuestionType,
  answer: unknown,
  detail: Record<string, unknown> | null,
  correctAnswer: string | null
): { display: AnswerDisplay; isCorrect: boolean | null } {
  switch (type) {
    case "select": {
      const selected = String(answer ?? "");
      const correct = correctAnswer ?? "";
      const isCorrect =
        selected.toLowerCase().trim() === correct.toLowerCase().trim();
      return {
        display: { kind: "select", selected, correct, isCorrect },
        isCorrect,
      };
    }

    case "multiple_select": {
      const selected: string[] = Array.isArray(answer)
        ? answer.map(String)
        : [];
      const correct: string[] = correctAnswer
        ? correctAnswer.split(",").map((s) => s.trim())
        : [];
      const isCorrect =
        selected.length === correct.length &&
        correct.every((c) =>
          selected.some((s) => s.toLowerCase() === c.toLowerCase())
        );
      return {
        display: { kind: "multiple_select", selected, correct },
        isCorrect,
      };
    }

    case "short_text":
    case "long_text": {
      const value = String(answer ?? "");
      const correct = correctAnswer ?? null;
      const isCorrect = correct
        ? value.toLowerCase().trim() === correct.toLowerCase().trim()
        : null;
      return { display: { kind: "text", value, correct }, isCorrect };
    }

    case "range": {
      const value = Number(answer ?? 0);
      const min = Number(detail?.min ?? 0);
      const max = Number(detail?.max ?? 100);
      const step = Number(detail?.step ?? 1);
      const condition = parseRangeCondition(correctAnswer);
      const isCorrect = checkRangeCorrect(value, condition);
      return {
        display: {
          kind: "range",
          value,
          min,
          max,
          step,
          correctCondition: condition,
        },
        isCorrect,
      };
    }

    case "content":
    case "video_content":
    case "url":
    default:
      return { display: { kind: "info" }, isCorrect: null };
  }
}

function mapRawAnswer(raw: RawAnswer): UserAnswerDetail {
  const q = raw.question;
  if (!q)
    throw new Error(`Missing question for question_id ${raw.question_id}`);

  const { display, isCorrect } = parseAnswerDisplay(
    q.type,
    raw.answer,
    q.detail,
    q.correct_answer
  );

  return {
    questionId: q.id,
    order: q.order,
    title: q.title,
    type: q.type,
    point: raw.point,
    maxPoint: q.point,
    answer: raw.answer,
    correctAnswer: q.correct_answer,
    answerDisplay: display,
    isCorrect,
  };
}

// ── main query ─────────────────────────────────────────────────────────────────

export async function getParticipantDetail(
  classId: number,
  participant: ClassUserResult
): Promise<ParticipantDetailData> {
  const { data, error } = await supabaseClient
    .from("class_user_answer")
    .select(
      `
      question_id,
      answer,
      point,
      started_at,
      finished_at,
      question (
        id,
        order,
        title,
        type,
        detail,
        correct_answer,
        point
      )
    `
    )
    .eq("class_id", classId)
    .eq("user_id", participant.userId)
    .order("question_id", { ascending: true })
    .returns<RawAnswer[]>();

  if (error) throw new Error(error.message);

  const answers = (data ?? [])
    .map(mapRawAnswer)
    .sort((a, b) => a.order - b.order);

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const wrongCount = answers.filter((a) => a.isCorrect === false).length;
  const infoCount = answers.filter((a) => a.isCorrect === null).length;

  return { participant, answers, correctCount, wrongCount, infoCount };
}
