"use client";

import { useCallback, useState } from "react";

import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import {
  ICoolDataTable,
  useCoolList,
  useDeleteCoolList,
} from "@/app/(main)/cool/_hooks/useCoolList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, IPaginationProps } from "@/components/ui/data-table";
import { Image } from "@/components/ui/image";
import PageHeader from "@/components/ui/page-header";
import { useDebounce } from "@/hooks/use-debounce";

export const parentColumns: ColumnDef<ICoolDataTable>[] = [
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
    header: "Nama",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <Image
          src={row.original.coverImage}
          alt={row.getValue("name") || "Event cover"}
          width={48}
          height={48}
          className="rounded-sm object-cover w-12 h-12"
        />
        <div className="flex flex-col">
          {row.getValue("name")}
          <p className="text-xs text-muted-foreground">
            {row.original.memberCount || 0} members
          </p>
        </div>
      </span>
    ),
  },
  {
    accessorKey: "meetTime",
    header: "Meet Time",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "leader",
    header: "Leader",
  },
];

const CoolPage = () => {
  const router = useRouter();

  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useCoolList(page, pageSize, debouncedSearch);
  const deleteMutation = useDeleteCoolList();

  const handleCreate = useCallback(() => {
    router.push("/cool/create");
  }, [router]);

  const handlePaginationChange = useCallback(
    ({ page: newPage, pageSize: newPageSize }: IPaginationProps) => {
      setPageSize(newPageSize);
      setPage(newPage);
    },
    []
  );

  const handleRowClick = useCallback(
    (rowData: ICoolDataTable) => {
      if (rowData.id) router.push(`/cool/${rowData.id}`);
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    (rows: unknown[]) => {
      deleteMutation.mutate(rows as ICoolDataTable[]);
    },
    [deleteMutation]
  );

  return (
    <>
      <PageHeader
        title="COOL"
        action={
          <Button onClick={handleCreate}>
            <PlusCircle className="size-4" />
            Add New COOL
          </Button>
        }
      />
      <DataTable
        columns={parentColumns}
        data={data?.data || []}
        loading={isLoading || deleteMutation.isPending}
        searchKey="name"
        page={page}
        pageSize={pageSize}
        totalCount={data?.count || 0}
        showPagination
        emptyMessage="No COOL found."
        onRowClick={handleRowClick}
        onDeleteRow={handleDeleteRow}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default CoolPage;
