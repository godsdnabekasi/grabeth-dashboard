"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import InputSearch from "@/components/ui/input-search";
import { SelectComp } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_SIZE_OPTIONS } from "@/config/common";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  searchKey?: string;
  searchPlaceholder?: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  showPagination?: boolean;
  emptyMessage?: string;
  onDeleteRow?: (val: TData[]) => void | Promise<void>;
  onSearch?: (val?: string) => void;
  onPaginationChange?: (pagination: IPaginationProps) => void;
}

export interface IPaginationProps {
  page: number;
  pageSize: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  onRowClick,
  searchKey,
  searchPlaceholder = "Search...",
  page = 0,
  pageSize = 10,
  totalCount = 0,
  showPagination = true,
  emptyMessage = "No results.",
  onDeleteRow,
  onSearch,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: pageSize,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
  });

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;
  const canPrevious = page >= 1;
  const canNext = (page + 1) * pagination.pageSize < totalCount;
  const [searchTerm, setSearchTerm] = useState(
    (table.getColumn(searchKey!)?.getFilterValue() as string) ?? undefined
  );

  const onDelete = () => {
    onDeleteRow?.(table.getSelectedRowModel().rows.map((r) => r.original));
    table.toggleAllPageRowsSelected(false);
  };

  const onClickPagination = useCallback(
    (direction: "next" | "previous" | "", pagesize?: number) => {
      if (direction === "next") {
        setPagination({
          pageIndex: page + 1,
          pageSize: pagesize || pagination.pageSize,
        });
        onPaginationChange?.({
          page: page + 1,
          pageSize: pagesize || pagination.pageSize,
        });
      } else if (direction === "previous") {
        setPagination({
          pageIndex: page - 1,
          pageSize: pagesize || pagination.pageSize,
        });
        onPaginationChange?.({
          page: page - 1,
          pageSize: pagesize || pagination.pageSize,
        });
      } else {
        onPaginationChange?.({
          page: page,
          pageSize: pagesize || pagination.pageSize,
        });
        setPagination({
          pageIndex: pagination.pageIndex,
          pageSize: pagesize || pagination.pageSize,
        });
      }
    },
    [page, pagination.pageSize, pagination.pageIndex, onPaginationChange]
  );

  useEffect(() => {
    if (!onSearch) return;
    const handler = setTimeout(() => {
      onSearch?.(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchKey, table, onSearch]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-4">
        {searchKey && (
          <div className="flex items-center">
            <InputSearch
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              className="max-w-sm"
            />
          </div>
        )}
        {Object.entries(rowSelection).length > 0 && (
          <Alert
            title="Are you sure?"
            description="This action cannot be undone."
            trigger={
              <Button variant="destructive">
                Delete {Object.entries(rowSelection).length} selected
              </Button>
            }
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => table.toggleAllPageRowsSelected(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  loading={loading}
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </>
            }
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="relative h-24">
                  <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </TableCell>
              </TableRow>
            ) : hasRows ? (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    `${idx % 2 === 0 ? "bg-white" : "bg-gray-100"}`,
                    onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="relative">
                      <a
                        onClick={() => onRowClick?.(row.original)}
                        className="flex absolute top-0 right-0 bottom-0 left-0 flex-1"
                      />
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground flex gap-4 items-center text-sm">
            {(() => {
              const totalPages = Math.ceil(totalCount / pagination.pageSize);
              const rowsCount = table.getRowModel().rows.length;
              return (
                <>
                  Page {page + 1} of {totalPages} | Showing{" "}
                  {rowsCount.toLocaleString()} of {totalCount}
                </>
              );
            })()}
            <SelectComp
              name="pageSize"
              value={String(pagination.pageSize)}
              defaultValue="10"
              options={PAGE_SIZE_OPTIONS}
              onChange={(value) => {
                onClickPagination?.("", Number(value));
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              disabled={!canPrevious}
              onClick={() => onClickPagination("previous")}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!canNext}
              onClick={() => onClickPagination("next")}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
