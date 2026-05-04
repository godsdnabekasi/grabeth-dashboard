import { SelectOption } from "@/components/ui/select-container";
import { CoolUserRole } from "@/types/small-group";

export const PAGE_SIZE_OPTIONS: SelectOption[] = [
  {
    label: "10",
    value: "10",
  },
  {
    label: "20",
    value: "20",
  },
  {
    label: "30",
    value: "30",
  },
  {
    label: "40",
    value: "40",
  },
  {
    label: "50",
    value: "50",
  },
];

export const SMALL_GROUP_ROLES: Record<
  CoolUserRole,
  { label: string; description?: string; color: string }
> = {
  pastor: {
    label: "Pastor",
    description:
      "The pastor is responsible for the spiritual leadership and pastoral care of the small group.",
    color: "#2563EB",
  },
  support: {
    label: "Support",
    description:
      "The support person is responsible for assisting the pastor in the spiritual leadership and pastoral care of the small group.",
    color: "#10B981",
  },
  member: {
    label: "Member",
    description:
      "The member is a member of the small group and is responsible for the spiritual growth and development of small group.",
    color: "#6B7280",
  },
  mvp: {
    label: "MVP",
    description:
      "The MVP is a member of the small group who has shown exceptional leadership potential.",
    color: "#F59E0B",
  },
  grower: {
    label: "Grower",
    description:
      "The grower is a member of the small group who has shown potential for spiritual growth and development.",
    color: "#84CC16",
  },
};
