import React from "react";

import {
  Check,
  CheckCheck,
  FileText,
  FileVideo,
  GripVertical,
  List,
  SlidersHorizontal,
  TextAlignStart,
  TextCursor,
  Trash2,
} from "lucide-react";

import { useSortable } from "@dnd-kit/react/sortable";

import { QuestionFormValues } from "../_types/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { QUESTION_DETAIL_TYPE } from "@/config/service";
import { cn } from "@/lib/utils";

interface IQuizQuestionCardProps {
  question: QuestionFormValues;
  index: number;
  onRemove: (index: number) => void;
  onClick: (question: QuestionFormValues) => void;
}

const QuizQuestionCard = ({
  question,
  index,
  onRemove,
  onClick,
}: IQuizQuestionCardProps) => {
  const { ref, handleRef } = useSortable({
    id: question.id || index,
    index: index,
  });

  const questionConfig = {
    select: {
      icon: List,
      color: "text-sky-600",
      bg: "bg-sky-500/20",
    },
    multiple_select: {
      icon: List,
      color: "text-purple-600",
      bg: "bg-purple-500/20",
    },
    range: {
      icon: SlidersHorizontal,
      color: "text-orange-600",
      bg: "bg-orange-500/20",
    },
    content: {
      icon: FileText,
      color: "text-cyan-600",
      bg: "bg-cyan-500/20",
    },
    video_content: {
      icon: FileVideo,
      color: "text-red-600",
      bg: "bg-red-500/20",
    },
    short_text: {
      icon: TextCursor,
      color: "text-emerald-600",
      bg: "bg-emerald-500/20",
    },
    long_text: {
      icon: TextAlignStart,
      color: "text-emerald-600",
      bg: "bg-emerald-500/20",
    },
  };

  const Icon =
    questionConfig[question.type as keyof typeof questionConfig].icon;

  return (
    <div
      ref={ref}
      className={cn(
        "bg-gray-100 p-3 rounded-md flex items-center gap-4",
        "cursor-pointer transition-all duration-200 px-4 hover:opacity-90 active:scale-[0.99]"
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick(question);
      }}
    >
      <GripVertical
        ref={handleRef}
        className="size-4 text-gray-500 cursor-grab"
      />
      <div className="flex flex-1 flex-col space-y-1">
        <h2 className="font-semibold">{question.title}</h2>
        <span className="space-x-1">
          <Badge
            className={cn(
              questionConfig[question.type as keyof typeof questionConfig].bg,
              questionConfig[question.type as keyof typeof questionConfig].color
            )}
          >
            <Icon className="size-4" />
            {
              QUESTION_DETAIL_TYPE[
                question.type as keyof typeof QUESTION_DETAIL_TYPE
              ].label
            }
          </Badge>
          {question.correct_answer && (
            <Badge className="bg-emerald-500/20 text-emerald-600">
              <Check className="size-4 text-emerald-600" />
              {question.type === "multiple_select"
                ? `${question.correct_answer.split(",").length} jawaban benar`
                : `Jawaban: ${question.correct_answer.replace("_", " ")}`}
            </Badge>
          )}
          {question.point && (
            <Badge className="bg-sky-500/20 text-sky-600">
              <CheckCheck className="size-4 text-sky-600" />
              Poin: {question.point}
            </Badge>
          )}
        </span>

        {question.detail && (
          <>
            {question.detail.options?.length > 0 && (
              <ul className="pl-3 list-disc space-y-0.5">
                {question.detail.options.map((option, index) => {
                  const isCorrect = question.correct_answer
                    ?.split(",")
                    .find((val) => val === option.value);

                  return (
                    <li
                      key={index}
                      className={cn(
                        "text-xs text-muted-foreground",
                        isCorrect && "font-semibold text-emerald-600"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {option.label}
                        {isCorrect && (
                          <Check className="size-3 text-emerald-600" />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {question.detail.range && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Min: {question.detail.range.min} &bull; Max:{" "}
                  {question.detail.range.max} &bull; Step:{" "}
                  {question.detail.range.step}
                </p>
                <Slider
                  min={question.detail.range.min}
                  max={question.detail.range.max}
                  step={question.detail.range.step}
                  value={[Math.round(question.detail.range.max / 2)]}
                  disabled
                />
              </div>
            )}
            {question.detail.description && (
              <p className="text-xs text-muted-foreground">
                {question.detail.description}
              </p>
            )}
            {question.detail.url && (
              <p className="text-xs text-muted-foreground underline">
                {question.detail.url}
              </p>
            )}
            {question.detail.required && (
              <p className="text-xs text-red-500 italic">*Required</p>
            )}
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(index);
        }}
      >
        <Trash2 className="size-4 text-gray-500" />
      </Button>
    </div>
  );
};

export default QuizQuestionCard;
