"use client";

import { useState } from "react";

import { Settings } from "lucide-react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";

import QuizFormConfigurationModal from "@/app/(main)/quiz/_components/form-configuration-modal";
import QuizQuestionCard from "@/app/(main)/quiz/_components/question-card";
import { QuestionFormValues } from "@/app/(main)/quiz/_types/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmptySection from "@/components/ui/empty-section";
import FormSection from "@/components/ui/form/section";
import { cn } from "@/lib/utils";

interface IQuizFormConfigurationProps {
  initialValues?: Partial<QuestionFormValues[]>;
  isError?: boolean;
  onSubmit: (values: QuestionFormValues[]) => void;
}

const QuizFormConfiguration = ({
  initialValues,
  isError,
  onSubmit,
}: IQuizFormConfigurationProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<
    QuestionFormValues & { index: number }
  >();
  const [openQuestionModal, setOpenQuestionModal] = useState(false);
  const [questions, setQuestions] = useState<QuestionFormValues[]>(
    (initialValues as QuestionFormValues[]) || []
  );

  const handleQuestionSubmit = (question: QuestionFormValues) => {
    setQuestions((prev) => {
      const next =
        selectedQuestion !== undefined
          ? prev.map((q, i) => (i === selectedQuestion.index ? question : q))
          : [...prev, question];

      const data = next.map((q) => ({
        ...q,
        detail: {
          ...q.detail,
          options:
            q.detail?.options.map((opt) => ({
              ...opt,
              value: opt.label?.toLowerCase().trim().replace(/ /g, "_"),
            })) ?? [],
        },
      }));

      onSubmit(data);
      return data;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => {
      const newQuestions = prev.filter((_, i) => i !== index);
      onSubmit(newQuestions);
      return newQuestions;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { target } = event.operation;
    if (!target) return;

    setQuestions((prev) => {
      const reordered = move(prev as never, event) as QuestionFormValues[];
      if (reordered === prev) return prev;
      onSubmit(reordered);
      return reordered;
    });
  };

  const handleEditQuestion = (question: QuestionFormValues, index: number) => {
    setSelectedQuestion({ ...question, index });
    setOpenQuestionModal(true);
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(undefined);
    setOpenQuestionModal(true);
  };

  return (
    <FormSection
      title="Question Configure"
      description="Configure advanced quiz options"
      icon={Settings}
      action={<Button onClick={handleAddQuestion}>Add Question</Button>}
    >
      <div>
        <Card
          className={cn("border", isError && "border-destructive")}
          contentClassName="flex flex-col gap-4"
        >
          {questions.length === 0 ? (
            <EmptySection message="No questions added yet" />
          ) : (
            <DragDropProvider onDragEnd={handleDragEnd}>
              {questions.map((question, index) => (
                <QuizQuestionCard
                  key={question.id || index}
                  question={question}
                  index={index}
                  onRemove={() => handleRemoveQuestion(index)}
                  onClick={() => handleEditQuestion(question, index)}
                />
              ))}
            </DragDropProvider>
          )}
        </Card>
        {isError && (
          <p className="text-red-500 text-xs text-right mt-1">Required</p>
        )}
      </div>

      {openQuestionModal && (
        <QuizFormConfigurationModal
          initialValues={selectedQuestion}
          open={openQuestionModal}
          onOpenChange={setOpenQuestionModal}
          isSubmitting={false}
          onSubmit={handleQuestionSubmit}
        />
      )}
    </FormSection>
  );
};

export default QuizFormConfiguration;
