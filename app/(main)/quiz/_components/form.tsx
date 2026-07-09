"use client";

import { useCallback } from "react";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import QuizFormConfiguration from "@/app/(main)/quiz/_components/form-configuration";
import {
  QuestionFormValues,
  ServiceFormValues,
  serviceSchema,
} from "@/app/(main)/quiz/_types/form";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import DeleteSection from "@/components/ui/form/delete";
import FormSection from "@/components/ui/form/section";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<ServiceFormValues>;
  onDelete?: () => void;
  onSubmit: (values: ServiceFormValues) => void;
};

const ServiceForm = ({
  isSubmitting = false,
  submitLabel = "Save",
  initialValues,
  onDelete,
  onSubmit,
}: Props) => {
  const router = useRouter();

  const {
    formState: { errors },
    control,
    setValue,
    handleSubmit,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
    },
  });

  const commonProps = { control, disabled: isSubmitting };

  const onQuestionConfigurationSubmit = (questions: QuestionFormValues[]) => {
    setValue("question", questions);
  };

  const handleSubmitForm = useCallback(
    () => handleSubmit((values) => onSubmit({ ...values }))(),
    [handleSubmit, onSubmit]
  );

  return (
    <>
      <FormSection
        title="Quiz Information"
        description="Update quiz information"
        icon={Info}
      >
        <Card contentClassName="grid grid-cols-2 gap-6">
          <InputImage
            label="Photo"
            name="photo"
            recommendedSize="1080x1080px (1:1)"
            className="aspect-square"
            {...commonProps}
          />
          <div className="space-y-6">
            <Input
              label="Name"
              placeholder="Enter name"
              name="name"
              required
              {...commonProps}
            />
            <InputDatePicker
              label="Published date"
              placeholder="Enter published date"
              required
              name="published_at"
              {...commonProps}
            />
            <InputDatePicker
              label="Unpublished date"
              placeholder="Enter unpublished date"
              required
              name="unpublished_at"
              {...commonProps}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Enter description"
            name="description"
            {...commonProps}
            containerClassName="col-span-2"
          />
        </Card>
      </FormSection>

      <Separator />

      <QuizFormConfiguration
        initialValues={initialValues?.question}
        isError={!!errors.question}
        onSubmit={onQuestionConfigurationSubmit}
      />

      <Separator />

      {onDelete && (
        <DeleteSection
          title="Delete Quiz"
          description="Once you delete a quiz, there is no going back. All data associated with this quiz will be permanently removed. Please be certain."
          alertTitle="Are you sure?"
          alertDescription="This action cannot be undone."
          triggerButtonText="Delete"
          onDelete={onDelete}
        />
      )}

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmitForm}>
          {submitLabel}
        </Button>
      </CardFooter>
    </>
  );
};

export default ServiceForm;
