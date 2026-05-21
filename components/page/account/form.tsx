"use client";

import { useCallback } from "react";
import { useState } from "react";

import { Info, Map, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  AccountFormValues,
  AccountLocationFormValues,
  accountSchema,
} from "./types";
import ActivitiesSection from "@/components/page/account/activities";
import AccountLocationCardList from "@/components/page/account/location/card-list";
import AccountLocationModal from "@/components/page/account/location/location-modal";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { GENDER_OPTIONS } from "@/config/common";
import { LocationType } from "@/types/location";

type Props = {
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<AccountFormValues>;
  mode?: "create" | "edit";
};

const AccountForm = ({
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  initialValues,
  mode,
}: Props) => {
  const router = useRouter();
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<AccountLocationFormValues | null>(null);

  const { control, watch, setValue, handleSubmit } = useForm<AccountFormValues>(
    {
      resolver: zodResolver(accountSchema),
      defaultValues: initialValues,
    }
  );

  // Use watch so the location list re-renders when items are added/removed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const locations = watch("location") ?? [];

  const commonProps = { control, disabled: isSubmitting };

  const handleSubmitForm = useCallback(
    () => handleSubmit((values) => onSubmit({ ...values }))(),
    [handleSubmit, onSubmit]
  );

  const handleAddLocation = useCallback(
    (location: AccountLocationFormValues, mode: "create" | "edit") => {
      if (mode === "create") {
        setValue("location", [...locations, location]);
      } else {
        setValue(
          "location",
          locations.map((l) => (l?.id === location?.id ? location : l))
        );
      }
    },
    [locations, setValue]
  );

  const handleDeleteLocation = useCallback(
    (index: number) => {
      setValue(
        "location",
        locations.filter((_, i) => i !== index)
      );
    },
    [locations, setValue]
  );

  const handleEditLocation = useCallback(
    (location: AccountLocationFormValues) => {
      setSelectedLocation(location);
      setOpenLocationModal(true);
    },
    []
  );

  const handleOpenLocationModal = useCallback(() => {
    setSelectedLocation(null);
    setOpenLocationModal(true);
  }, []);

  return (
    <>
      <FormSection
        title="Account Information"
        description="Update your account information"
        icon={Info}
      >
        <Card contentClassName="grid grid-cols-2 gap-6">
          <Input
            label="Email"
            placeholder="Enter email"
            name="contact.email"
            control={control}
            disabled={mode === "edit"}
            containerClassName={mode === "edit" ? "col-span-2" : ""}
          />
          {mode === "create" && (
            <Input
              label="Password"
              placeholder="Enter password"
              name="contact.password"
              control={control}
              password
            />
          )}
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
            <Input
              label="Nickname"
              placeholder="Enter nickname"
              name="nickname"
              required
              {...commonProps}
            />
          </div>
          <Input
            label="NIJ"
            placeholder="Enter NIJ"
            name="nij"
            {...commonProps}
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            name="contact.phoneNumber"
            required
            type="number"
            {...commonProps}
          />
          <InputDatePicker
            label="Birthdate"
            placeholder="Select birthdate"
            name="birthdate"
            required
            {...commonProps}
          />
          <Select
            label="Gender"
            placeholder="Select gender"
            name="gender"
            required
            options={GENDER_OPTIONS}
            {...commonProps}
          />
          <Textarea
            label="Bio"
            placeholder="Enter bio"
            name="bio"
            containerClassName="col-span-2"
            {...commonProps}
          />
        </Card>
      </FormSection>

      <Separator />

      <FormSection
        title="Location"
        description="List of locations the user is from."
        icon={Map}
        action={
          <Button onClick={handleOpenLocationModal}>
            <PlusCircle className="size-4" />
            Add Location
          </Button>
        }
      >
        {locations.length > 0 ? (
          <div className="lg:grid-cols-3 grid grid-cols-2 gap-6">
            {locations.map((loc, idx) => (
              <AccountLocationCardList
                key={idx}
                data={{
                  name: loc?.name,
                  address: loc?.address,
                  type: loc?.type as LocationType,
                  province: loc?.province,
                  city: loc?.city,
                  district: loc?.district,
                  postal_code: loc?.postal_code,
                }}
                onDelete={() => handleDeleteLocation(idx)}
                onEdit={() =>
                  handleEditLocation(loc as AccountLocationFormValues)
                }
              />
            ))}
          </div>
        ) : (
          <Card className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">No location data</p>
          </Card>
        )}
      </FormSection>

      {mode === "edit" && (
        <>
          <Separator />
          <ActivitiesSection
            id={initialValues?.id ? String(initialValues.id) : ""}
          />
        </>
      )}

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmitForm}>
          {submitLabel}
        </Button>
      </CardFooter>

      {openLocationModal && (
        <AccountLocationModal
          open={openLocationModal}
          initialValues={selectedLocation!}
          mode={selectedLocation ? "edit" : "create"}
          onOpenChange={setOpenLocationModal}
          onAddLocation={handleAddLocation}
        />
      )}
    </>
  );
};

export default AccountForm;
