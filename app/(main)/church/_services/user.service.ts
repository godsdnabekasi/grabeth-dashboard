import { toast } from "sonner";

import { getChurchUsers } from "@/service/church";

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

export { fetchChurchUsers };
