import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSnapshot } from "valtio";

import { formatDate, formatTime } from "@/lib/utils";
import { deleteSmallGroup, getSmallGroups } from "@/service/small-group";
import userStore from "@/store/user";
import { ISmallGroup } from "@/types/small-group";

export interface ICoolDataTable {
  id: number;
  name: string;
  meetTime: string;
  location?: string;
  coverImage?: string;
  memberCount?: number;
  leader?: string;
}

const transformUsers = (data: ISmallGroup[] = []): ICoolDataTable[] =>
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

export const useCoolList = (page: number, pageSize: number, search?: string) => {
  const { user } = useSnapshot(userStore);
  const churchId = user?.church_user?.church_id || 0;

  return useQuery({
    queryKey: ["cool-list", page, pageSize, search, churchId],
    queryFn: async () => {
      const filter = {
        page: page + 1,
        pageSize,
        church_id: churchId,
      };

      const { data, error, count } = await getSmallGroups(
        search ? { search, ...filter } : filter
      );

      if (error) {
        throw new Error("Oops, something went wrong");
      }

      return {
        data: transformUsers(data || []),
        count: count || 0,
      };
    },
  });
};

export const useDeleteCoolList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (val: ICoolDataTable[]) => {
      const { error } = await deleteSmallGroup(val.map((u) => Number(u.id)!));
      if (error) throw new Error("Oops, something went wrong");
      return val.length;
    },
    onSuccess: (count) => {
      toast.success(`Successfully deleted ${count} COOL(s)`);
      queryClient.invalidateQueries({ queryKey: ["cool-list"] });
    },
    onError: (error) => {
      toast.error(error.message || String(error));
    },
  });
};
