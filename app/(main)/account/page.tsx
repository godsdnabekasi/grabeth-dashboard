"use client";

import { useCallback, useEffect, useState } from "react";

import { EllipsisVertical, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { ColumnDef } from "@tanstack/react-table";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, IPaginationProps } from "@/components/ui/data-table";
import PageHeader from "@/components/ui/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import {
  TGenderOptions,
  deleteUserAuth,
  getUsersByChurchId,
} from "@/service/user";
import userStore from "@/store/user";
import { IUser } from "@/types/user";

export interface IDataTable {
  id: string;
  name: string;
  gender: TGenderOptions;
  birthdate: string;
  photo?: string;
  contact?: string;
  small_group?: {
    name: string;
    id: number;
  };
}

const BADGE_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-teal-100 text-teal-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-green-100 text-green-800",
];

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
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <p className="truncate w-32 xl:w-auto">{row.getValue("contact")}</p>
    ),
  },
  {
    accessorKey: "birthdate",
    header: "Birthdate",
    cell: ({ row }) => (
      <span>{formatDate(row.getValue("birthdate") as string)}</span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("gender") || "-"}</span>
    ),
  },
  {
    accessorKey: "small_group",
    header: "COOL",
    cell: ({ row }) => {
      if (row.original.small_group?.id) {
        return (
          <Badge
            className={
              BADGE_COLORS[row.original.small_group?.id % BADGE_COLORS.length]
            }
          >
            {row.original.small_group?.name}
          </Badge>
        );
      }
      return <Badge className="bg-rose-100 text-rose-800">Not Joined</Badge>;
    },
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

const AccountPage = () => {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const [items, setItems] = useState<IDataTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const transformUsers = (data: IUser[] = []): IDataTable[] =>
    data.map((d) => ({
      id: d.id,
      name: d.name,
      birthdate: d.birthdate || "",
      gender: d.gender as TGenderOptions,
      photo: d.user_file?.file?.link || "",
      contact: d.email || d.phoneNumber || "-",
      small_group: d.small_group_user
        ? {
            name: d.small_group_user?.small_group?.name || "-",
            id: Number(d.small_group_user?.small_group?.id),
          }
        : undefined,
    }));

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = {
        page: page + 1,
        pageSize,
        church_id: user?.church_user?.church_id || 0,
      };
      const { data, error, count } = await getUsersByChurchId(
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

  const handleCreate = () => router.push("/account/create");

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRowClick = (data: IDataTable) => {
    if (data.id) router.push(`/account/${data.id}`);
  };

  const onDelete = useCallback(
    async (val: IDataTable[]) => {
      try {
        setIsLoading(true);
        const [error] = await Promise.all(val.map((v) => deleteUserAuth(v.id)));
        if (error.error) throw error.error;
        toast.success(`Successfully deleted ${val.length} account(s)`);
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
        title="Account"
        action={
          <Button onClick={handleCreate}>
            <PlusCircle className="size-4" />
            Add New Account
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
        emptyMessage="No Account found."
        onRowClick={handleRowClick}
        onDeleteRow={onDelete}
        onSearch={setSearch}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default AccountPage;
