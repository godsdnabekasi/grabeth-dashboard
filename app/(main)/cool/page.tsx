"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, IPaginationProps } from "@/components/ui/data-table";
import { Image } from "@/components/ui/image";
import PageHeader from "@/components/ui/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate, formatTime } from "@/lib/utils";
import { deleteSmallGroup, getSmallGroups } from "@/service/small-group";
import userStore from "@/store/user";
import { ISmallGroup } from "@/types/small-group";

export interface IDataTable {
  id: number;
  name: string;
  meetTime: string;
  location?: string;
  coverImage?: string;
  memberCount?: number;
  leader?: string;
}

export const parentColumns: ColumnDef<IDataTable>[] = [
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
  const { user } = useSnapshot(userStore);
  const [items, setItems] = useState<IDataTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const transformUsers = (data: ISmallGroup[] = []): IDataTable[] =>
    data.map((d) => ({
      id: d.id,
      name: d.name,
      meetTime: d.meet_time
        ? `${formatDate(d.meet_time, "dddd")} • ${formatTime(d.meet_time)}`
        : "-",
      location: d.small_group_location?.[0]?.location?.name || "-",
      memberCount: d.small_group_user?.length || 0,
      leader:
        d.small_group_user?.filter((user) => user.role === "pastor")[0]?.user
          ?.name || "-",
      coverImage: d.small_group_file?.file?.link || "",
    }));

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = {
        page: page + 1,
        pageSize,
        church_id: user?.church_user?.church_id || 0,
      };
      const { data, error, count } = await getSmallGroups(
        debouncedSearch ? { search: debouncedSearch, ...filter } : filter
      );
      if (error) throw error;
      setItems(transformUsers(data || []));
      setTotalCount(count || 0);
    } catch {
      toast.error("Oops, something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, user?.church_user?.church_id]);

  const handleCreate = () => router.push("/cool/create");

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRowClick = (data: IDataTable) => {
    if (data.id) router.push(`/cool/${data.id}`);
  };

  const onDelete = useCallback(
    async (val: IDataTable[]) => {
      try {
        setIsLoading(true);
        const { error } = await deleteSmallGroup(val.map((u) => Number(u.id)!));
        if (error) throw error;
        toast.success(`Successfully deleted ${val.length} COOL(s)`);
        await fetchItems();
      } catch {
        toast.error("Oops, something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchItems]
  );

  return (
    <>
      <PageHeader
        title="COOL"
        action={<Button onClick={handleCreate}>Create</Button>}
      />
      <DataTable
        columns={parentColumns}
        data={items}
        loading={isLoading}
        searchKey="name"
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        showPagination
        emptyMessage="No COOL found."
        onRowClick={handleRowClick}
        onDeleteRow={onDelete}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default CoolPage;
