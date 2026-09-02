"use client";

import { Info } from "lucide-react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ChurchFormValues,
  churchSchema,
} from "@/app/(main)/church/_types/types";
import { Card } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isSubmitting?: boolean;
  initialValues?: Partial<ChurchFormValues>;
};

const FormGeneral = ({ isSubmitting, initialValues }: Props) => {
  const { control } = useForm<ChurchFormValues>({
    resolver: zodResolver(churchSchema),
    defaultValues: initialValues,
  });

  const commonProps = { control, disabled: isSubmitting };

  return (
    <FormSection
      title="General Information"
      description="Update church information"
      icon={Info}
    >
      <Card contentClassName="grid grid-cols-2 gap-6">
        <InputImage
          label="Photo"
          name="photo"
          recommendedSize="1080x1080px (1:1)"
          className="aspect-square max-w-xs"
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
            label="Establish date"
            placeholder="Enter establish date"
            required
            name="establish_date"
            {...commonProps}
          />
          <Input
            label="Phone"
            placeholder="628123456789"
            name="contact.0.value"
            required
            type="number"
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

        <div className="col-span-2 grid grid-cols-3 gap-6">
          <Input
            label="Instagram"
            placeholder="https://www.instagram.com/"
            name="contact.1.value"
            {...commonProps}
          />
          <Input
            label="Facebook"
            placeholder="https://www.facebook.com/"
            name="contact.2.value"
            {...commonProps}
          />
          <Input
            label="Youtube"
            placeholder="https://www.youtube.com/"
            name="contact.3.value"
            {...commonProps}
          />
        </div>
      </Card>
    </FormSection>
  );
};

export default FormGeneral;
