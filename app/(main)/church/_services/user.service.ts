import { toast } from "sonner";

import { ISelectedMember } from "@/components/page/church/member/container";
import {
  deleteChurchUsers,
  getChurchUsers,
  upsertChurchUsers,
} from "@/service/church";
import { TChurchUserRole } from "@/types/church";

const fetchChurchUsers = async (churchId: number) => {
  try {
    const { data, error } = await getChurchUsers({
      church_id: churchId,
    });
    if (error) throw error;
    return { data, error };
  } catch (error) {
    toast.error("Error fetching church users");
    return { data: [], error };
  }
};

const onAddMemberChurch = async (
  church_id: number,
  members: ISelectedMember[]
) => {
  try {
    const { error } = await upsertChurchUsers(
      members.map((m) => ({
        church_id: church_id,
        role: m.role as TChurchUserRole,
        user_id: m.id,
      }))
    );
    if (error) throw error;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to add member"
    );
  }
};

const onRemoveMemberChurch = async (ids: string[]) => {
  try {
    const { error } = await deleteChurchUsers(ids);
    if (error) throw error;
  } catch {
    toast.error("Oops, something went wrong");
  }
};

export { fetchChurchUsers, onAddMemberChurch, onRemoveMemberChurch };
