"use client";

import { useCallback, useEffect, useState } from "react";

import { PlusCircle } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { deleteClasses } from "@/service/class";
import { getForms } from "@/service/form";
import userStore from "@/store/user";
import { IForm } from "@/types/form";

export interface IDataTable {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  published_date?: string;
  unpublished_date?: string;
  publishing_window?: string;
  created_date?: string;
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
          src={row.original.photo || ""}
          alt={row.getValue("name") || "Service cover"}
          width={48}
          height={48}
          className="rounded-sm object-cover w-12 h-12"
        />
        <p className="truncate w-32 xl:w-auto">{row.getValue("name")}</p>
      </span>
    ),
  },
  {
    accessorKey: "publishing_window",
    header: "Publishing Window",
  },
  {
    accessorKey: "created_date",
    header: "Date Created",
  },
];

const ServicePage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [items, setItems] = useState<IDataTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const transformItems = (data: IForm[] = []): IDataTable[] =>
    data.map((d) => ({
      id: d.class_id,
      name: d.classes.title,
      description: d.classes.description || "-",
      photo: d.classes.file?.link,
      publishing_window: `${formatDate(d.classes.published_at)} - ${formatDate(d.classes.unpublished_at)}`,
      created_date: d.classes.created_at
        ? formatDate(d.classes.created_at)
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
      const { data, error, count } = await getForms(
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

  const handleCreate = () => router.push("/service/create");

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRowClick = (data: IDataTable) => {
    if (data.id) router.push(`/service/${data.id}`);
  };

  const onDelete = useCallback(
    async (val: IDataTable[]) => {
      try {
        setIsLoading(true);
        const { error } = await deleteClasses(val.map((u) => u.id));
        if (error) throw error;
        toast.success(`Successfully deleted ${val.length} class(es)`);
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
        title="Service"
        action={
          <Button onClick={handleCreate}>
            <PlusCircle className="size-4" />
            Add New Service
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
        emptyMessage="No Service found."
        onRowClick={handleRowClick}
        onDeleteRow={onDelete}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default ServicePage;
