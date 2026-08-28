"use client";

import { useCallback, useState } from "react";

import { CirclePlus, Info, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import ChurchBankAcoountContainer from "@/app/(main)/church/_components/bank-account/container";
import DeleteSection from "@/app/(main)/church/_components/delete";
import ChurchLocationCardList from "@/app/(main)/church/_components/location/card";
import ChurchLocationModal from "@/app/(main)/church/_components/location/location-modal";
import ChurchMemberContainer, {
  ISelectedMember,
} from "@/app/(main)/church/_components/member/container";
import ChurchPastoral from "@/app/(main)/church/_components/member/pastoral";
import ChurchServiceContainer from "@/app/(main)/church/_components/service/container";
import {
  BankAccountFormValues,
  ChurchFormValues,
  ChurchLocationFormValues,
  churchSchema,
} from "@/app/(main)/church/_types/types";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import { Input } from "@/components/ui/input";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputImage } from "@/components/ui/input-image";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { IChurchService } from "@/types/church";

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

  const { control, getValues, setValue, handleSubmit, watch } =
    useForm<ChurchFormValues>({
      resolver: zodResolver(churchSchema),
      defaultValues: initialValues,
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const services = watch("services");
  const bank_accounts = watch("bank_accounts");

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

  const onChangeService = useCallback(
    (service: IChurchService) => {
      const currentServices = getValues("services");
      const newService = service.id ? null : service;
      const newServices = currentServices?.map((s) => {
        if (s.id === service.id) {
          return service;
        }
        return s;
      });
      if (newService) {
        newServices?.push(newService);
      }

      setValue("services", newServices);
    },
    [getValues, setValue]
  );

  const onRemoveService = useCallback(
    (service: IChurchService) => {
      const currentServices = getValues("services");
      const newServices = currentServices?.filter((s) => s.id !== service.id);

      setValue("services", newServices);
    },
    [getValues, setValue]
  );

  const onChangeBankAccount = useCallback(
    (val: BankAccountFormValues) => {
      const currentBankAccounts = getValues("bank_accounts");
      const newBankAccount = val.id ? null : val;
      const newBankAccounts = currentBankAccounts?.map((s) => {
        if (s.id === val.id) {
          return val;
        }
        return s;
      });
      if (newBankAccount) {
        newBankAccounts?.push(newBankAccount);
      }

      setValue("bank_accounts", newBankAccounts);
    },
    [getValues, setValue]
  );

  const onRemoveBankAccount = useCallback(
    (val: BankAccountFormValues) => {
      const currentBankAccounts = getValues("bank_accounts");
      const newBankAccounts = currentBankAccounts?.filter(
        (s) => s.id !== val.id
      );

      setValue("bank_accounts", newBankAccounts);
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

      <ChurchServiceContainer
        initialValues={services}
        onChangeService={onChangeService}
        onRemoveService={onRemoveService}
      />

      <Separator />

      <ChurchBankAcoountContainer
        initialValues={bank_accounts}
        onChange={onChangeBankAccount}
        onRemove={onRemoveBankAccount}
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
