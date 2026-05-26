import { Pencil, Trash2, Users } from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import { useMemberDetail } from "@/app/(main)/church/_hooks/use-member-detail";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import FormSection from "@/components/ui/form/section";
import { formatDate } from "@/lib/utils";

export interface IChurchMemberContainer {
  id: string;
  name: string;
  photo?: string;
  role: string;
  joined_date: Date;
}

const ChurchMemberContainer = () => {
  const {
    item,
    isFetching,
    page,
    pageSize,
    totalCount,
    setSearch,
    handlePaginationChange,
  } = useMemberDetail();

  const columns: ColumnDef<IChurchMemberContainer>[] = [
    {
      accessorKey: "name",
      header: "Name",
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
          <Button variant="destructive" size="icon-sm">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <FormSection
        title="Members"
        description="Manage church members"
        icon={Users}
      >
        <DataTable
          columns={columns}
          data={item}
          loading={isFetching}
          searchKey="name"
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          showPagination
          emptyMessage="No member found."
          // onRowClick={handleRowClick}
          // onDeleteRow={onDelete}
          onSearch={setSearch}
          onPaginationChange={handlePaginationChange}
        />
      </FormSection>
    </>
  );
};

export default ChurchMemberContainer;
