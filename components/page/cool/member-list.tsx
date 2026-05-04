"use client";

import React, { memo, useCallback, useState } from "react";

import { EllipsisVertical, PlusCircle, Users } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import { ISelectedMember } from "@/components/page/cool/member-item";
import MemberSettingModal, {
  ISelectedChangedMember,
  ISelectedRemoveMember,
} from "@/components/page/cool/member-setting-modal";
import ModalAddMember from "@/components/page/cool/modal-add-member";
import { MemberFormValues } from "@/components/page/cool/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { SMALL_GROUP_ROLES } from "@/config/common";
import { CoolUserRole } from "@/types/small-group";

export interface IMemberListProps {
  members: MemberFormValues[];
  onAdd?: (selectedIds: ISelectedMember[]) => void;
  onRemove?: (data: string[]) => void;
  onChanged?: (data: ISelectedChangedMember[]) => void;
}

export const MemberList = memo(
  ({ members, onAdd, onRemove, onChanged }: IMemberListProps) => {
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowModalSetting, setIsShowModalSetting] = useState(false);
    const [selectedMember, setSelectedMember] = useState<
      ISelectedMember | undefined
    >();

    const [removedMembers, setRemovedMembers] = useState<string[]>([]);
    const [changedMembers, setChangedMembers] = useState<
      ISelectedChangedMember[]
    >([]);

    const handleOpenModal = useCallback(() => setIsShowModal(true), []);

    const handleOpenSettingModal = useCallback(
      (member: ISelectedMember) => {
        setSelectedMember(member);
        setIsShowModalSetting(true);
      },
      [setSelectedMember, setIsShowModalSetting]
    );

    const parentColumns: ColumnDef<MemberFormValues>[] = [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.original.image || ""}
              name={row.getValue("name")}
              className="size-12 border-2 border-transparent"
            />
            <span className="font-medium text-gray-900">
              {row.getValue("name")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = (row.original.newRole ||
            row.original.role) as CoolUserRole;
          return (
            <Badge
              className="capitalize font-semibold"
              style={{
                backgroundColor: SMALL_GROUP_ROLES[role]?.color,
              }}
            >
              {SMALL_GROUP_ROLES[role]?.label || role}
            </Badge>
          );
        },
      },
      {
        accessorKey: "joinedDate",
        header: "Joined Date",
        cell: ({ row }) => (
          <span className="text-gray-500 tabular-nums">
            {row.getValue("joinedDate")}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() =>
              handleOpenSettingModal(row.original as ISelectedMember)
            }
          >
            <EllipsisVertical className="size-4" />
          </Button>
        ),
      },
    ];

    const onAddMember = useCallback(
      (selectedMembers: ISelectedMember[]) => {
        onAdd?.(selectedMembers);
        setIsShowModal(false);
      },
      [onAdd]
    );

    const onSaveChanged = useCallback(
      (data: ISelectedChangedMember) => {
        const isExist = changedMembers.some((member) => member.id === data.id);
        const memberChanged = isExist
          ? changedMembers.map((member) =>
              member.id === data.id ? data : member
            )
          : [...changedMembers, data];
        setChangedMembers(memberChanged);
        onChanged?.(memberChanged);
        setIsShowModalSetting(false);
      },
      [changedMembers, onChanged]
    );

    const onRemoveMember = useCallback(
      (data: ISelectedRemoveMember) => {
        const newRemovedMembers = [...removedMembers, data.id];
        setRemovedMembers(newRemovedMembers);
        onRemove?.(newRemovedMembers);
        setIsShowModalSetting(false);
      },
      [removedMembers, onRemove]
    );

    return (
      <section>
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Users className="size-4 text-rose-500" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">
                COOL Members
              </CardTitle>
            </div>
            <Button size="md" onClick={handleOpenModal}>
              <PlusCircle className="size-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={members}
              columns={parentColumns}
              totalCount={members.length}
              pageSize={100}
              showPagination={false}
              enableRowSelection={false}
            />
          </CardContent>
        </Card>

        {isShowModal && (
          <Dialog open onOpenChange={setIsShowModal}>
            <ModalAddMember
              members={members as ISelectedMember[]}
              onAdd={onAddMember}
            />
          </Dialog>
        )}

        {isShowModalSetting && (
          <MemberSettingModal
            isShowModal={isShowModalSetting}
            member={selectedMember}
            setIsShowModal={setIsShowModalSetting}
            onSave={onSaveChanged}
            onRemove={onRemoveMember}
          />
        )}
      </section>
    );
  }
);

MemberList.displayName = "MemberList";
