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
import { deleteEvent, getEvents } from "@/service/event";
import userStore from "@/store/user";
import { IEvent } from "@/types/event";

export interface IDataTable {
  id?: number;
  name?: string;
  date?: string;
  time?: string;
  published_at?: string;
  unpublished_at?: string;
  cover_image?: string;
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
          src={row.original.cover_image}
          alt={row.getValue("name") || "Event cover"}
          width={48}
          height={48}
          className="rounded-sm object-cover w-12 h-12"
        />
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <p>{row.getValue("date") || "-"}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.time || "-"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "published_at",
    header: "Published At",
  },
  {
    accessorKey: "unpublished_at",
    header: "Unpublished At",
  },
];

const EventPage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [items, setItems] = useState<IDataTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const transformUsers = (data: IEvent[] = []): IDataTable[] =>
    data.map((d) => ({
      id: d.id,
      name: d.name,
      date: d.start_time ? formatDate(d.start_time, "DD MMM YYYY") : "",
      time: d.start_time
        ? `${formatTime(d.start_time)} - ${formatTime(d.end_time)}`
        : "",
      published_at: d.publish_time ? formatDate(d.publish_time) : "",
      unpublished_at: d.unpublish_time ? formatDate(d.unpublish_time) : "",
      cover_image: d.event_file?.file?.link || "",
    }));

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = {
        page: page + 1,
        pageSize,
        church_id: user?.church_user?.church_id || 0,
      };
      const { data, error, count } = await getEvents(
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

  const handleCreate = () => router.push("/event/create");

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRowClick = (data: IDataTable) => {
    if (data.id) router.push(`/event/${data.id}`);
  };

  const onDelete = useCallback(
    async (val: IDataTable[]) => {
      try {
        setIsLoading(true);
        const { error } = await deleteEvent(val.map((u) => Number(u.id)!));
        if (error) throw error;
        toast.success(`Successfully deleted ${val.length} event(s)`);
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
        title="Events"
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
        emptyMessage="No event found."
        onRowClick={handleRowClick}
        onDeleteRow={onDelete}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default EventPage;
