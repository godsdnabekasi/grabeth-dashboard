import { SelectOption } from "@/components/ui/select-container";
import { TChurchUserRole } from "@/types/church";
import { LocationType } from "@/types/location";
import { SmallGroupRole } from "@/types/small-group";

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
  SmallGroupRole,
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

export const CHURCH_USER_ROLES: Record<
  TChurchUserRole,
  { label: string; description?: string; color: string }
> = {
  pastor: {
    label: "Pastor",
    description:
      "The pastor is responsible for the spiritual leadership and pastoral care of the small group.",
    color: "#2563EB",
  },
  admin: {
    label: "Admin",
    description:
      "The admin is responsible for the overall management and administration of the church.",
    color: "#10B981",
  },
  finance: {
    label: "Finance",
    description:
      "The finance person is responsible for the financial management and administration of the church.",
    color: "#10B981",
  },
  user: {
    label: "User",
    description:
      "The user is a member of the church and is responsible for the spiritual growth and development of small group.",
    color: "#6B7280",
  },
};

export const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as SelectOption[];

export const LOCATION_OPTIONS = [
  { label: "Apartment", value: "apartment" },
  { label: "Building", value: "building" },
  { label: "Home", value: "home" },
  { label: "Hospital", value: "hospital" },
  { label: "Mall", value: "mall" },
  { label: "Office", value: "office" },
  { label: "Open Space", value: "open space" },
  { label: "Other", value: "other" },
  { label: "Park", value: "park" },
  { label: "Parking Area", value: "parking area" },
  { label: "Playground", value: "playground" },
  { label: "Public Facility", value: "public facility" },
  { label: "Recidential", value: "residential" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Toilet", value: "toilet" },
] as {
  label: string;
  value: LocationType;
}[];

export const LOCATION_TYPE = [
  "apartment",
  "building",
  "home",
  "hospital",
  "mall",
  "office",
  "open space",
  "other",
  "park",
  "parking area",
  "playground",
  "public facility",
  "residential",
  "restaurant",
  "toilet",
] as LocationType[];
