"use client";

import { useEffect } from "react";

import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import OptionList from "@/app/(main)/service/_components/option-list";
import {
  QuestionFormValues,
  questionSchema,
} from "@/app/(main)/service/_types/form";
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

interface IServiceFormConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuestionFormValues) => void;
  isSubmitting: boolean;
  initialValues?: Partial<QuestionFormValues>;
}

const ServiceFormConfigurationModal = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialValues,
}: IServiceFormConfigurationModalProps) => {
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
  const selectedType = watch("type");
  const selectOptions = useDebounce(watch("detail.options") ?? [], 500);
  const rangeMax = useDebounce(watch("detail.range.max") ?? 10, 500);
  const rangeMin = useDebounce(watch("detail.range.min") ?? 0, 500);
  const rangeStep = useDebounce(watch("detail.range.step") ?? 1, 500);
  const required = watch("detail.required");

  const isContent = selectedType === "content";
  const isVideoContent = selectedType === "video_content";

  const handleFormSubmit = (data: QuestionFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

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
  }, [isContent, isVideoContent, selectedType, setValue]);

  // Seed two empty options when switching to a select type with no existing options.
  useEffect(() => {
    const isSelectType =
      selectedType === "select" || selectedType === "multiple_select";

    if (isSelectType && selectOptions.length === 0) {
      setValue("detail.options", Array(2).fill({ label: "", value: "" }));
    }
  }, [selectOptions.length, selectedType, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-xl p-0 w-full max-h-[90vh] gap-0">
        <DialogHeader
          title="Add Question"
          description="Fill in the question details"
        />
        <form className="flex flex-col gap-6 p-4 overflow-y-auto">
          <Select
            label="Type"
            placeholder="Select question type"
            name="type"
            options={QUESTION_TYPE}
            control={control}
            required
          />

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
                name="detail.title"
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

          {selectedType === "select" || selectedType === "multiple_select" ? (
            <div className="col-span-2 flex-1 flex flex-col gap-4">
              <Label>Options</Label>
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

export default ServiceFormConfigurationModal;
