"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

// import SelectChurch from "./select-church";
import { EventFormValues, eventSchema } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { InputLocation } from "@/components/ui/input-location";
import { InputTime } from "@/components/ui/input-time";
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
    () => handleSubmit((values) => onSubmit({ ...values })),
    [handleSubmit, onSubmit]
  );

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <InputImage
            label="Cover Image"
            name="cover_image"
            required
            control={control}
            recommendedSize="1200x1600px (3:4)"
            disabled={isSubmitting}
          />
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
          />
          <InputDatePicker
            label="Date"
            placeholder="Select date"
            name="date"
            required
            control={control}
            disabled={isSubmitting}
          />
          {/* FOR SUPER ADMIN ONLY */}
          {/* <SelectChurch
          value={initialValues?.church_id}
          control={control}
          isSubmitting={isSubmitting}
          /> */}
          <InputTime
            label="Start Time"
            placeholder="Select time"
            name="start_time"
            required
            control={control}
            disabled={isSubmitting}
          />
          <InputTime
            label="End Time"
            placeholder="Select time"
            name="end_time"
            required
            control={control}
            disabled={isSubmitting}
          />
          <Textarea
            label="Description"
            placeholder="Enter description"
            name="description"
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
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
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button loading={isSubmitting} onClick={onPress}>
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventForm;
