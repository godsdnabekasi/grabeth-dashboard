import { SmallGroupRole } from "@/types/small-group";

export interface ICoolMember {
  id: string;
  name: string;
  role: SmallGroupRole;
  newRole?: SmallGroupRole;
  image?: string | null;
  joinedDate?: string;
  selected?: boolean;
}
