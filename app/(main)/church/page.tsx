"use client";

import { useCallback, useEffect, useState } from "react";

import { EllipsisVertical, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ColumnDef } from "@tanstack/react-table";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, IPaginationProps } from "@/components/ui/data-table";
import PageHeader from "@/components/ui/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import { deleteChurchs, getChurches } from "@/service/church";
import userStore from "@/store/user";
import { IChurch } from "@/types/church";

export interface IDataTable {
  id: number;
  name: string;
  photo?: string;
  establish_date?: string;
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
        <Avatar
          src={row.original.photo || ""}
          name={row.getValue("name")}
          alt={row.getValue("name") || "Event cover"}
        />
        <p className="truncate w-32 xl:w-auto">{row.getValue("name")}</p>
      </span>
    ),
  },
  {
    accessorKey: "establish_date",
    header: "Established Date",
  },
  {
    accessorKey: "action",
    header: "",
    cell: () => {
      return (
        <Button variant="outline" size="icon-sm">
          <EllipsisVertical className="size-4" />
        </Button>
      );
    },
  },
];

const ChurchPage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [items, setItems] = useState<IDataTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const transformItems = (data: IChurch[] = []): IDataTable[] =>
    data.map((d) => ({
      id: d.id,
      name: d.name,
      photo: d.church_file?.file.link,
      establish_date: d.establish_date
        ? formatDate(String(d.establish_date))
        : "-",
    }));

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = {
        page: page + 1,
        pageSize,
        church_id: user?.church_user?.church_id || 0,
      };
      const { data, error, count } = await getChurches(
        debouncedSearch ? { search: debouncedSearch, ...filter } : filter
      );
      if (error) throw error;

      setItems(transformItems(data || []));
      setTotalCount(count || 0);
    } catch {
      toast.error("Oops, something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, user?.church_user?.church_id]);

  const handleCreate = () => router.push("/church/create");

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRowClick = (data: IDataTable) => {
    if (data.id) router.push(`/church/${data.id}`);
  };

  const onDelete = useCallback(
    async (val: IDataTable[]) => {
      try {
        setIsLoading(true);
        const { error } = await deleteChurchs(val.map((u) => u.id));
        if (error) throw error;
        toast.success(`Successfully deleted ${val.length} church(s)`);
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
        title="Church"
        action={
          <Button onClick={handleCreate}>
            <PlusCircle className="size-4" />
            Add New Church
          </Button>
        }
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
        emptyMessage="No Church found."
        onRowClick={handleRowClick}
        onDeleteRow={onDelete}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default ChurchPage;
