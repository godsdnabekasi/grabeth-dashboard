export type QuestionType =
  | "select"
  | "multiple_select"
  | "short_text"
  | "long_text"
  | "range"
  | "content"
  | "video_content"
  | "url";

export type UserAnswerDetail = {
  questionId: number;
  order: number;
  title: string;
  type: QuestionType;
  point: number | null; // points earned by user
  maxPoint: number | null; // max possible point for this question
  answer: unknown; // raw jsonb from DB
  correctAnswer: string | null;
  // parsed for display
  answerDisplay: AnswerDisplay;
  isCorrect: boolean | null; // null = not gradeable (content, url, video)
};

export type AnswerDisplay =
  | { kind: "select"; selected: string; correct: string; isCorrect: boolean }
  | { kind: "multiple_select"; selected: string[]; correct: string[] }
  | { kind: "text"; value: string; correct: string | null }
  | {
      kind: "range";
      value: number;
      min: number;
      max: number;
      step: number;
      correctCondition: RangeCondition | null;
    }
  | { kind: "info" }; // content / video_content / url — not gradeable

export type RangeCondition = {
  operator: ">=" | "<=" | "=" | "between";
  value: number;
  valueTo?: number; // for 'between'
};

export interface ClassUserResult {
  userId: string;
  userName: string;
  userNij: string;
  userNickname: string;
  durationLabel: string;
  submitDateLabel: string;
  scoreLabel: string;
  scorePercent: number;
  totalScore: number;
  totalPoint: number;
  startedAt: Date;
  finishedAt: Date;
}

export type ParticipantDetailData = {
  participant: ClassUserResult;
  answers: UserAnswerDetail[];
  // derived
  correctCount: number;
  wrongCount: number;
  infoCount: number;
};
