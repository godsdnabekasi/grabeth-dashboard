"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import DeleteSection from "./delete";
import CoolSummary from "./summary";
import FormGeneral from "@/app/(main)/cool/_components/form-general";
import CoolMember from "@/app/(main)/cool/_components/member";
import {
  CoolFormValues,
  MemberFormValues,
  coolSchema,
} from "@/app/(main)/cool/_types";
import { ICoolMember } from "@/app/(main)/cool/_types/member";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [members, setMembers] = useState<MemberFormValues[]>(
    initialValues?.members || []
  );

  const { getValues, setValue, handleSubmit } = useForm<CoolFormValues>({
    resolver: zodResolver(coolSchema),
    defaultValues: initialValues,
  });

  const onPress = useMemo(
    () =>
      handleSubmit((values) => {
        onSubmit({ ...values });
      }),
    [handleSubmit, onSubmit]
  );

  const onAddMember = useCallback(
    (selectedMembers: ICoolMember[]) => {
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
      const newMembers = members?.filter((member) => !ids.includes(member.id!));

      setMembers(newMembers);
      setValue("members", newMembers);
    },
    [members, setValue]
  );

  const onChangedMember = useCallback(
    (data: ICoolMember[]) => {
      const newMembers = members?.map((member) => {
        const changed = data.find((d) => d.id === member.id);
        if (changed) {
          return {
            ...member,
            newRole: changed.newRole,
          };
        }
        return member;
      });

      setMembers(newMembers);
      setValue("members", newMembers);
    },
    [members, setValue]
  );

  const tabList = useMemo(
    () => [
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
        value: "members",
        label: "Members",
        content: (
          <CoolMember
            members={members as ICoolMember[]}
            onAdd={onAddMember}
            onRemove={onRemoveMember}
            onChanged={onChangedMember}
          />
        ),
      },
      ...(initialValues
        ? [
            {
              value: "report",
              label: "Report",
              content: <CoolSummary id={initialValues!.id!} />,
            },
          ]
        : []),
    ],
    [
      initialValues,
      isSubmitting,
      members,
      onAddMember,
      onChangedMember,
      onRemoveMember,
    ]
  );

  return (
    <section className="space-y-6">
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
