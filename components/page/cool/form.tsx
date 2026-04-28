"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { CoolFormValues, coolSchema } from "@/components/page/cool/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputDay } from "@/components/ui/input-day";
import { InputImage } from "@/components/ui/input-image";
import { InputLocation } from "@/components/ui/input-location";
import { InputTime } from "@/components/ui/input-time";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onSubmit: (values: CoolFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<CoolFormValues>;
};

const CoolForm = ({
  onSubmit,
  isSubmitting,
  submitLabel,
  initialValues,
}: Props) => {
  const router = useRouter();

  const { control, handleSubmit } = useForm<CoolFormValues>({
    resolver: zodResolver(coolSchema),
    defaultValues: initialValues,
  });

  const location = useWatch({
    control,
    name: "location",
  });

  const onPress = useMemo(
    () =>
      handleSubmit((values) => {
        onSubmit({ ...values });
      }),
    [handleSubmit, onSubmit]
  );

  return (
    <section className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-2 gap-6">
          <InputImage
            label="Cover Image"
            name="coverImage"
            required
            control={control}
            recommendedSize="1080x1080px (1:1)"
            disabled={isSubmitting}
            className="aspect-square"
          />
          <Input
            label="Name"
            placeholder="Enter name"
            name="name"
            required
            control={control}
            disabled={isSubmitting}
          />
          <Textarea
            label="Description"
            name="description"
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
          <InputDay
            label="Day"
            placeholder="Select day"
            name="day"
            required
            control={control}
            disabled={isSubmitting}
          />
          <InputTime
            label="Start Time"
            placeholder="Select time"
            name="time"
            required
            control={control}
            disabled={isSubmitting}
          />

          <Input
            label="Location Name"
            placeholder="Enter location name"
            name="location.name"
            required={!!location?.address}
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
          <InputLocation
            label="Address"
            name="location"
            required={!!location?.name}
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
        </CardContent>
      </Card>

      {/* <Separator />

      <EventFormTicket
        control={control}
        setValue={setValue}
        isSubmitting={isSubmitting}
      /> */}

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button loading={isSubmitting} onClick={onPress}>
          {submitLabel}
        </Button>
      </CardFooter>
    </section>
  );
};

export default CoolForm;
