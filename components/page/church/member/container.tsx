import { useCallback, useEffect, useState } from "react";

import { CirclePlus, Pencil, Users } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import { useMemberDetail } from "@/app/(main)/church/_hooks/use-member-detail";
import ChurchModalAddMember from "@/components/page/church/member/modal-add-member";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import FormSection from "@/components/ui/form/section";
import { formatDate } from "@/lib/utils";

interface IChurchMemberContainerProps {
  onAddMember?: (members: ISelectedMember[]) => void;
  onRemoveMember?: (memberIds: string[]) => void;
}

export interface IChurchMemberContainer {
  id: string;
  name: string;
  photo?: string;
  role: string;
  joined_date: string;
}

export interface ISelectedMember extends IChurchMemberContainer {
  selected?: boolean;
}

const ChurchMemberContainer = ({
  onAddMember,
  onRemoveMember,
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
    },
    {
      accessorKey: "joined_date",
      header: "Joined Date",
      cell: ({ row }) => <p>{formatDate(row.original.joined_date)}</p>,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="outline" size="icon-sm">
          <Pencil className="size-4" />
        </Button>
      ),
    },
  ];

  const onDelete = useCallback(
    (val: IChurchMemberContainer[]) => {
      onRemoveMember?.(val.map((u) => u.id));
      const filteredMembers = members.filter(
        (member) => !val.some((u) => u.id === member.id)
      );
      console.log(filteredMembers);

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
      setNewMembers((prev) => [...newMember, ...prev, ...members]);
      setSelectedMemberIds((prev) => [
        ...prev,
        ...selectedMembers.map((m) => m.id!),
      ]);
      onAddMember?.([...newMember, ...newMembers]);
      setOpenModalAddMember(false);
    },
    [members, newMembers, onAddMember]
  );

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
          // onRowClick={handleRowClick}
          onDeleteRow={onDelete}
          onSearch={setSearch}
          onPaginationChange={handlePaginationChange}
        />
      </FormSection>

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
