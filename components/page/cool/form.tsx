"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import DeleteSection from "@/components/page/cool/delete";
import { ISelectedMember } from "@/components/page/cool/member-item";
import { MemberList } from "@/components/page/cool/member-list";
import { ISelectedChangedMember } from "@/components/page/cool/member-setting-modal";
import { CoolFormValues, coolSchema } from "@/components/page/cool/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputDay } from "@/components/ui/input-day";
import { InputImage } from "@/components/ui/input-image";
import { InputLocation } from "@/components/ui/input-location";
import { InputTime } from "@/components/ui/input-time";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  mode: "create" | "edit";
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<CoolFormValues>;
  onSubmit: (values: CoolFormValues) => void | Promise<void>;
  onDelete?: () => void;
};

const CoolForm = ({
  mode,
  isSubmitting,
  submitLabel,
  initialValues,
  onSubmit,
  onDelete,
}: Props) => {
  const router = useRouter();
  const [members, setMembers] = useState<Omit<ISelectedMember, "selected">[]>(
    initialValues?.members || []
  );

  const { control, getValues, setValue, handleSubmit } =
    useForm<CoolFormValues>({
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

  const onAddMember = useCallback(
    (selectedMembers: ISelectedMember[]) => {
      const members = selectedMembers.filter((m) => m.selected);
      const currentMembers = getValues("members") || [];

      const newMembers = members.filter(
        (member) =>
          !currentMembers.some((existing) => existing.id === member.id)
      );
      const allMembers = [...currentMembers, ...newMembers];

      setMembers(allMembers);
      setValue("members", allMembers);
    },
    [getValues, setValue]
  );

  const onRemoveMember = useCallback(
    (ids: string[]) => {
      const newMembers = members.filter((member) => !ids.includes(member.id!));
      setMembers(newMembers);
      setValue("members", newMembers);
    },
    [members, setValue]
  );

  const onChangedMember = useCallback(
    (data: ISelectedChangedMember[]) => {
      const newMembers = members.map((member) => {
        const changed = data.find((d) => d.id === member.id);
        if (changed) {
          return changed;
        }
        return member;
      });
      setMembers(newMembers);
      setValue("members", newMembers);
    },
    [members, setValue]
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
            label="Meeting Day"
            placeholder="Select day"
            name="day"
            required
            control={control}
            disabled={isSubmitting}
          />
          <InputTime
            label="Time"
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

      <Separator />

      <MemberList
        members={members || []}
        onAdd={onAddMember}
        onRemove={onRemoveMember}
        onChanged={onChangedMember}
      />

      {mode === "edit" && (
        <>
          <Separator />
          <DeleteSection onDelete={() => onDelete?.()} />
        </>
      )}

      <CardFooter className="justify-between mt-20">
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
