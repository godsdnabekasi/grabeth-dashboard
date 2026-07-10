"use client";

import { useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import AnswerList from "@/app/(main)/quiz/_components/answer-list";
import OptionList from "@/app/(main)/quiz/_components/option-list";
import {
  QuestionFormValues,
  questionSchema,
} from "@/app/(main)/quiz/_types/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPE } from "@/config/service";
import { useDebounce } from "@/hooks/use-debounce";
import { TQuestionType } from "@/types/question";

interface IQuizFormConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuestionFormValues) => void;
  isSubmitting: boolean;
  initialValues?: Partial<QuestionFormValues>;
}

const QuizFormConfigurationModal = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialValues,
}: IQuizFormConfigurationModalProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { control, watch, handleSubmit, setValue } =
    useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
      defaultValues: initialValues || {
        title: "",
        description: "",
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detail.options",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = watch("type") as TQuestionType;
  const selectOptions = useDebounce(watch("detail.options") ?? [], 500);
  const rangeMax = useDebounce(watch("detail.range.max") ?? 10, 500);
  const rangeMin = useDebounce(watch("detail.range.min") ?? 0, 500);
  const rangeStep = useDebounce(watch("detail.range.step") ?? 1, 500);
  const required = watch("detail.required");
  const correctAnswer = watch("correct_answer");

  const isContent = selectedType === "content";
  const isVideoContent = selectedType === "video_content";

  const handleFormSubmit = (data: QuestionFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  useEffect(() => {
    setShowAnswer(!!initialValues?.correct_answer);
  }, [initialValues]);

  // Reset type-specific fields whenever the question type changes.
  useEffect(() => {
    const isSelectType =
      selectedType === "select" || selectedType === "multiple_select";
    const isTextType =
      selectedType === "short_text" || selectedType === "long_text";

    if (isSelectType) {
      setValue("detail.range", undefined);
    } else if (selectedType === "range") {
      setValue("detail.range.step", 1);
      setValue("detail.options", []);
    } else if (isContent || isVideoContent || isTextType) {
      setValue("detail.options", []);
      setValue("detail.range", undefined);
    }
  }, [
    correctAnswer,
    initialValues?.correct_answer,
    isContent,
    isVideoContent,
    selectedType,
    setValue,
  ]);

  // Seed two empty options when switching to a select type with no existing options.
  useEffect(() => {
    const isSelectType =
      selectedType === "select" || selectedType === "multiple_select";

    if (isSelectType && selectOptions.length === 0) {
      setValue("detail.options", Array(2).fill({ label: "", value: "" }));
    }
  }, [selectOptions, selectedType, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-xl p-0 w-full max-h-[90vh] gap-0">
        <DialogHeader
          title="Add Question"
          description="Fill in the question details"
        />
        <form className="flex flex-col gap-6 p-4 overflow-y-auto">
          <div className="flex gap-4 justify-between">
            <Select
              label="Type"
              placeholder="Select question type"
              name="type"
              options={QUESTION_TYPE}
              control={control}
              required
              containerClassName="flex-1"
            />
            <Input
              label="Point"
              placeholder="Enter point"
              name="point"
              control={control}
              type="number"
              containerClassName="flex-1"
            />
          </div>

          {!isContent ? (
            <Textarea
              label="Question"
              placeholder="Enter question"
              name="title"
              control={control}
              required
              single
            />
          ) : (
            <>
              <Input
                label="Title"
                placeholder="Enter title"
                name="title"
                control={control}
                required
                containerClassName="col-span-2"
              />
              <Textarea
                label="Description"
                placeholder="Enter description"
                name="detail.description"
                control={control}
                required
                containerClassName="col-span-2"
              />
            </>
          )}

          {!isContent && (
            <Textarea
              label="Description"
              placeholder="Enter description"
              name="description"
              control={control}
              containerClassName="col-span-2"
            />
          )}

          <label className="flex items-center justify-between col-span-2">
            <div className="space-y-1">
              <Label>Required</Label>
              <p className="text-muted-foreground text-xs">
                Must answer this question
              </p>
            </div>
            <Switch
              name="required"
              checked={required}
              onCheckedChange={(value) => setValue("detail.required", value)}
            />
          </label>

          {selectedType === "select" || selectedType === "multiple_select" ? (
            <div className="col-span-2 flex-1 flex flex-col gap-2 bg-gray-100 px-4 py-3 rounded-md">
              <Label className="text-xs">Options</Label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <OptionList
                    key={field.id}
                    id={field.id}
                    index={index}
                    control={control}
                    showRemove={fields.length !== 2}
                    remove={() => remove(index)}
                  />
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="none"
                  className="self-start"
                  onClick={() => append({ label: "", value: "" })}
                >
                  <Plus className="size-4" />
                  Add Option
                </Button>
              </div>
            </div>
          ) : selectedType === "video_content" ? (
            <Input
              label="Video URL"
              placeholder="https://"
              name="detail.url"
              control={control}
              containerClassName="col-span-2"
            />
          ) : selectedType === "range" ? (
            <div className="p-4 bg-muted/50 rounded-lg border border-dotted border-muted space-y-4">
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <Input
                  label="Min"
                  placeholder="Enter min"
                  name="detail.range.min"
                  control={control}
                  type="number"
                  value={rangeMin}
                />
                <Input
                  label="Max"
                  placeholder="Enter max"
                  name="detail.range.max"
                  control={control}
                  type="number"
                  value={rangeMax}
                />
                <Input
                  label="Step"
                  placeholder="Enter step"
                  name="detail.range.step"
                  control={control}
                  type="number"
                  value={rangeStep}
                />
              </div>
              <Slider min={rangeMin} max={rangeMax} step={rangeStep} />
            </div>
          ) : null}

          {selectedType === "short_text" ||
          selectedType === "long_text" ||
          selectedType === "select" ||
          selectedType === "multiple_select" ? (
            <div className="col-span-2 flex-1 flex flex-col gap-2 bg-gray-100 px-4 py-3 rounded-md animate-in fade-in duration-300">
              <label className="flex items-center justify-between col-span-2">
                <div className="space-y-1">
                  <Label>Answer Correct</Label>
                  <p className="text-muted-foreground text-xs">
                    Set the correct answer for this question
                  </p>
                </div>
                <Switch
                  checked={showAnswer}
                  onCheckedChange={() => setShowAnswer((prev) => !prev)}
                />
              </label>
              {showAnswer && (
                <AnswerList
                  initialValues={initialValues?.correct_answer ?? ""}
                  type={selectedType}
                  options={selectOptions.map((so, i) => ({
                    label: so.label,
                    value: String(
                      so.value ||
                        so.label.toLowerCase().trim().replace(/ /g, "_") ||
                        i
                    ),
                  }))}
                  onChange={(answer) => setValue("correct_answer", answer)}
                />
              )}
            </div>
          ) : null}
        </form>

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizFormConfigurationModal;
