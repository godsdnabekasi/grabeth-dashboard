"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

// import SelectChurch from "./select-church";
import { EventFormValues, eventSchema } from "../_types/schema";
import EventFormSchedule from "@/app/(main)/event/_components/form-schedule";
import EventFormTicket from "@/app/(main)/event/_components/form-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { InputLocation } from "@/components/ui/input-location";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<EventFormValues>;
};

const EventForm = ({
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  initialValues,
}: Props) => {
  const router = useRouter();

  const { control, handleSubmit } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
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
      <Card contentClassName="grid grid-cols-2 gap-6">
        <InputImage
          label="Cover Image"
          name="cover_image"
          required
          control={control}
          recommendedSize="(16:9)"
          className="aspect-video max-w-none"
          disabled={isSubmitting}
        />
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Enter name"
            name="name"
            required
            control={control}
            disabled={isSubmitting}
          />
          <Input
            label="Capacity"
            placeholder="Enter capacity"
            name="capacity"
            control={control}
            disabled={isSubmitting}
            type="number"
          />
        </div>
        {/* FOR SUPER ADMIN ONLY */}
        {/* <SelectChurch
          value={initialValues?.church_id}
          control={control}
          isSubmitting={isSubmitting}
          /> */}
        <Textarea
          label="Description"
          placeholder="Enter description"
          name="description"
          control={control}
          disabled={isSubmitting}
          containerClassName="col-span-2"
        />
        <Input
          label="Place"
          placeholder="Enter place name"
          name="location.name"
          required={!!location?.address}
          control={control}
          disabled={isSubmitting}
        />
        <Input
          label="Action Link"
          placeholder="https://"
          name="website"
          control={control}
          disabled={isSubmitting}
        />
        <InputDatePicker
          label="Publish Date"
          placeholder="Select date"
          name="publish_time"
          required
          control={control}
          disabled={isSubmitting}
        />
        <InputDatePicker
          label="Unpublish Date"
          placeholder="Select date"
          name="unpublish_time"
          control={control}
          disabled={isSubmitting}
        />
        <InputLocation
          label="Address"
          name="location"
          required={!!location?.name}
          control={control}
          disabled={isSubmitting}
          containerClassName="col-span-2"
        />
      </Card>

      <Separator />

      <EventFormSchedule control={control} isSubmitting={isSubmitting} />

      <Separator />

      <EventFormTicket control={control} isSubmitting={isSubmitting} />

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

export default EventForm;
