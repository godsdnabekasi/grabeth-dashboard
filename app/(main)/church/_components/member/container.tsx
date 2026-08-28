import { useCallback, useEffect, useState } from "react";

import { CirclePlus, Users } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import MemberSettingModal from "@/app/(main)/church/_components/member/member-setting-modal";
import ChurchModalAddMember from "@/app/(main)/church/_components/member/modal-add-member";
import { useMemberDetail } from "@/app/(main)/church/_hooks/use-member-detail";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import FormSection from "@/components/ui/form/section";
import { CHURCH_USER_ROLES } from "@/config/common";
import { formatDate } from "@/lib/utils";
import { TChurchUserRole } from "@/types/church";

interface IChurchMemberContainerProps {
  onAddMember?: (members: ISelectedMember[]) => void;
  onRemoveMember?: (memberIds: string[]) => void;
  onChangeRole?: (member: ISelectedMember) => void;
}

export interface IChurchMemberContainer {
  id: string;
  name: string;
  photo?: string;
  role: TChurchUserRole;
  joined_date: string;
}

export interface ISelectedMember extends IChurchMemberContainer {
  selected?: boolean;
  newRole?: TChurchUserRole;
}

const ChurchMemberContainer = ({
  onAddMember,
  onRemoveMember,
  onChangeRole,
}: IChurchMemberContainerProps) => {
  const {
    members,
    isFetching,
    page,
    pageSize,
    totalCount,
    setSearch,
    handlePaginationChange,
  } = useMemberDetail();
  const [openModalAddMember, setOpenModalAddMember] = useState(false);
  const [newMembers, setNewMembers] = useState<ISelectedMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ISelectedMember>();

  const columns: ColumnDef<ISelectedMember>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={row.original.photo || ""}
            name={row.original.name}
            alt={row.original.name}
            className="size-10"
          />
          <p>{row.original.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          className="capitalize font-semibold"
          style={{
            backgroundColor:
              CHURCH_USER_ROLES[row.original.newRole || row.original.role]
                .color,
          }}
        >
          {CHURCH_USER_ROLES[row.original.newRole || row.original.role].label}
        </Badge>
      ),
    },
    {
      accessorKey: "joined_date",
      header: "Joined Date",
      cell: ({ row }) => <p>{formatDate(row.original.joined_date)}</p>,
    },
  ];

  const onDelete = useCallback(
    (val: IChurchMemberContainer[]) => {
      onRemoveMember?.(val.map((u) => u.id));
      const filteredMembers = members.filter(
        (member) => !val.some((u) => u.id === member.id)
      );
      setNewMembers(filteredMembers);
    },
    [onRemoveMember, members]
  );

  const handleAddMember = useCallback(
    (selectedMembers: ISelectedMember[]) => {
      const newMember = selectedMembers.map((member) => ({
        id: member.id!,
        name: member.name!,
        photo: member.photo || "",
        joined_date: formatDate(new Date()),
        role: "user",
      })) as ISelectedMember[];
      setNewMembers((prev) => [...newMember, ...prev]);
      setSelectedMemberIds((prev) => [
        ...prev,
        ...selectedMembers.map((m) => m.id!),
      ]);
      onAddMember?.([...newMember, ...newMembers]);
      setOpenModalAddMember(false);
    },
    [newMembers, onAddMember]
  );

  const handleRowClick = (row: IChurchMemberContainer) => {
    setSelectedMember(row);
    setOpenSettingModal(true);
  };

  const handleSaveChangedMember = (value: ISelectedMember) => {
    const updatedMembers = newMembers.map((member) => {
      if (member.id === value.id) {
        return value;
      }
      return member;
    });
    setNewMembers(updatedMembers);
    onChangeRole?.(value);
    setOpenSettingModal(false);
  };

  useEffect(() => {
    setNewMembers(members);
  }, [members]);

  return (
    <>
      <FormSection
        title="Members"
        description="Manage church members"
        icon={Users}
        action={
          <Button size="md" onClick={() => setOpenModalAddMember(true)}>
            <CirclePlus />
            Add Member
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={newMembers}
          loading={isFetching}
          searchKey="name"
          page={page}
          pageSize={pageSize}
          totalCount={totalCount + selectedMemberIds.length}
          showPagination
          emptyMessage="No member found."
          onRowClick={handleRowClick}
          onDeleteRow={onDelete}
          onSearch={setSearch}
          onPaginationChange={handlePaginationChange}
        />
      </FormSection>

      {openSettingModal && (
        <MemberSettingModal
          isShowModal={openSettingModal}
          member={selectedMember}
          roles={CHURCH_USER_ROLES}
          title="Member Settings"
          removeLabel="Remove from Church"
          removeDescription="They will lose access to all shared resources."
          setIsShowModal={setOpenSettingModal}
          onSave={handleSaveChangedMember}
          onRemove={(id) => {
            onDelete([
              {
                id: id,
                name: "",
                role: "user",
                joined_date: "",
              },
            ]);
            setOpenSettingModal(false);
          }}
        />
      )}

      {openModalAddMember && (
        <ChurchModalAddMember
          open={openModalAddMember}
          onOpenChange={setOpenModalAddMember}
          members={selectedMemberIds}
          onAdd={handleAddMember}
        />
      )}
    </>
  );
};

export default ChurchMemberContainer;
