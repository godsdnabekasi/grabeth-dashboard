"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { toast } from "sonner";

import { IChurchMemberContainer } from "@/components/page/church/member/container";
import { IPaginationProps } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import { getChurchUsers } from "@/service/church";
import { TChurchUserRole } from "@/types/church";

export const useMemberDetail = () => {
  const params = useParams();
  const churchId = Number(params.id);

  const [members, setMembers] = useState<IChurchMemberContainer[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMemberChurch = useCallback(async () => {
    if (!churchId) return;

    try {
      setIsFetching(true);
      const filter = {
        page: page + 1,
        pageSize,
        church_id: churchId,
        role: "user" as TChurchUserRole,
      };

      const { data, error, count } = await getChurchUsers(
        debouncedSearch ? { search: debouncedSearch, ...filter } : filter
      );
      if (error) throw error;

      if (data) {
        setMembers(
          data.map((d) => ({
            id: d.user!.id!,
            name: d.user!.name!,
            role: d.role,
            joined_date: formatDate(d.created_at!),
          }))
        );
        setTotalCount(count || 0);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch church"
      );
    } finally {
      setIsFetching(false);
    }
  }, [churchId, debouncedSearch, page, pageSize]);

  const handlePaginationChange = ({ page, pageSize }: IPaginationProps) => {
    setPageSize(pageSize);
    setPage(page);
  };

  useEffect(() => {
    fetchMemberChurch();
  }, [fetchMemberChurch]);

  return {
    members,
    setMembers,
    isFetching,
    page,
    pageSize,
    totalCount,
    setSearch,
    handlePaginationChange,
    refetch: fetchMemberChurch,
  };
};
