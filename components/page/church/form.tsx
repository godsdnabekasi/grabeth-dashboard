"use client";

import { useCallback, useState } from "react";

import { CirclePlus, Info, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import DeleteSection from "@/components/page/church/delete";
import ChurchLocationCardList from "@/components/page/church/location/card";
import ChurchLocationModal from "@/components/page/church/location/location-modal";
import ChurchMemberContainer, {
  ISelectedMember,
} from "@/components/page/church/member/container";
import ChurchPastoral from "@/components/page/church/member/pastoral";
import {
  ChurchFormValues,
  ChurchLocationFormValues,
  churchSchema,
} from "@/components/page/church/types";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<ChurchFormValues>;
  onDelete?: () => void;
  onRemoveMember?: (ids: string[]) => void;
  onSubmit: (values: ChurchFormValues) => void;
};

const ChurchForm = ({
  isSubmitting = false,
  submitLabel = "Save",
  initialValues,
  onDelete,
  onRemoveMember,
  onSubmit,
}: Props) => {
  const router = useRouter();
  const [openLocationModal, setOpenLocationModal] = useState(false);

  const { control, getValues, setValue, handleSubmit } =
    useForm<ChurchFormValues>({
      resolver: zodResolver(churchSchema),
      defaultValues: initialValues,
    });

  const commonProps = { control, disabled: isSubmitting };

  const handleSubmitForm = useCallback(
    () => handleSubmit((values) => onSubmit({ ...values }))(),
    [handleSubmit, onSubmit]
  );

  const handleAddLocation = useCallback(
    (location: ChurchLocationFormValues) => {
      setValue("location", location);
    },
    [setValue]
  );

  const onAdd = useCallback(
    (member: ISelectedMember[]) => {
      const currentPastors = getValues("members");
      const newPastors = [...(currentPastors || []), ...member];
      setValue("members", newPastors);
    },
    [getValues, setValue]
  );

  const onRemove = useCallback(
    (member: string[]) => {
      const currentPastors = getValues("members");
      const newPastors = currentPastors?.filter((p) => !member.includes(p.id));
      setValue("members", newPastors);
      onRemoveMember?.(member);
    },
    [getValues, setValue, onRemoveMember]
  );

  const onChangeRole = useCallback(
    (member: ISelectedMember) => {
      const currentPastor = getValues("members");
      const newPastor = currentPastor?.map((p) => {
        if (p.id === member.id) {
          return member;
        }
        return p;
      }) || [member];
      setValue("members", newPastor);
    },
    [getValues, setValue]
  );

  return (
    <>
      <FormSection
        title="Church Information"
        description="Update church information"
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
              label="Establish date"
              placeholder="Enter establish date"
              required
              name="establish_date"
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

      <FormSection
        title="Locations"
        description="Manage church locations"
        icon={Map}
        action={
          !getValues("location") && (
            <Button size="md" onClick={() => setOpenLocationModal(true)}>
              <CirclePlus />
              Add Location
            </Button>
          )
        }
      >
        <ChurchLocationCardList
          data={getValues("location")}
          onEdit={() => setOpenLocationModal(true)}
        />
      </FormSection>

      <Separator />

      <ChurchPastoral
        onAddPastor={onAdd}
        onChangeRole={onChangeRole}
        onRemovePastor={onRemove}
      />

      <Separator />

      <ChurchMemberContainer
        onAddMember={onAdd}
        onChangeRole={onChangeRole}
        onRemoveMember={onRemove}
      />

      <Separator />

      {onDelete && <DeleteSection onDelete={onDelete} />}

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmitForm}>
          {submitLabel}
        </Button>
      </CardFooter>

      {openLocationModal && (
        <ChurchLocationModal
          open={openLocationModal}
          initialValues={getValues("location")}
          mode={"create"}
          onOpenChange={setOpenLocationModal}
          onAddLocation={handleAddLocation}
        />
      )}
    </>
  );
};

export default ChurchForm;
