"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import ChurchBankAcoountContainer from "@/app/(main)/church/_components/bank-account/container";
import DeleteSection from "@/app/(main)/church/_components/delete";
import FormGeneral from "@/app/(main)/church/_components/form-general";
import ChurchLocationCardList from "@/app/(main)/church/_components/location/card";
import ChurchLocationModal from "@/app/(main)/church/_components/location/location-modal";
import ChurchMemberContainer, {
  ISelectedMember,
} from "@/app/(main)/church/_components/member/container";
import ChurchPastoral from "@/app/(main)/church/_components/member/pastoral";
import ChurchServiceContainer from "@/app/(main)/church/_components/service/container";
import { BankAccountFormValues } from "@/app/(main)/church/_types/bank";
import { ChurchLocationFormValues } from "@/app/(main)/church/_types/location";
import {
  ChurchFormValues,
  churchSchema,
} from "@/app/(main)/church/_types/types";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const { getValues, setValue, handleSubmit, watch } =
    useForm<ChurchFormValues>({
      resolver: zodResolver(churchSchema),
      defaultValues: initialValues,
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const services = watch("services");
  const bank_accounts = watch("bank_accounts");

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

  const tabList = [
    {
      value: "general",
      label: "General",
      content: (
        <FormGeneral
          initialValues={initialValues}
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      value: "pastoral",
      label: "Pastoral",
      content: (
        <ChurchPastoral
          onAddPastor={onAdd}
          onChangeRole={onChangeRole}
          onRemovePastor={onRemove}
        />
      ),
    },
    {
      value: "location",
      label: "Location",
      content: (
        <ChurchLocationCardList
          data={getValues("location")}
          initialValues={initialValues as ChurchFormValues}
          setOpenLocationModal={setOpenLocationModal}
          onEdit={() => setOpenLocationModal(true)}
        />
      ),
    },
    {
      value: "member",
      label: "Member",
      content: (
        <ChurchMemberContainer
          onAddMember={onAdd}
          onChangeRole={onChangeRole}
          onRemoveMember={onRemove}
        />
      ),
    },
    {
      value: "service",
      label: "Service",
      content: (
        <ChurchServiceContainer
          initialValues={services}
          onChangeService={onChangeService}
          onRemoveService={onRemoveService}
        />
      ),
    },
    {
      value: "bank_accounts",
      label: "Bank Accounts",
      content: (
        <ChurchBankAcoountContainer
          initialValues={bank_accounts}
          onChange={onChangeBankAccount}
          onRemove={onRemoveBankAccount}
        />
      ),
    },
  ];

  return (
    <>
      <Tabs defaultValue="general">
        <TabsList variant="line">
          {tabList.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabList.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

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
