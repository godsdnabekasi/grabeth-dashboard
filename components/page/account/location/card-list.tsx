import {
  Briefcase,
  Building,
  Building2,
  ChefHat,
  CircleParking,
  Home,
  Hospital,
  LucideIcon,
  Pencil,
  Store,
  Toilet,
  Trash2,
  Trees,
} from "lucide-react";

import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LocationType } from "@/types/location";

interface AccountLocationCardListProps {
  data: {
    name?: string;
    address?: string;
    type: LocationType;
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

const AccountLocationCardList = ({
  data,
  onEdit,
  onDelete,
}: AccountLocationCardListProps) => {
  const IconMap: Record<LocationType, LucideIcon> = {
    apartment: Building,
    home: Home,
    building: Building2,
    hospital: Hospital,
    mall: Store,
    office: Briefcase,
    residential: Building2,
    "open space": Store,
    "parking area": CircleParking,
    "public facility": Building2,
    park: Trees,
    restaurant: ChefHat,
    toilet: Toilet,
    playground: Trees,
    other: Building,
  };

  const Icon = IconMap[data.type] ?? Building;

  return (
    <>
      <Card
        className="py-4"
        contentClassName="px-4 justify-between flex flex-col flex-1 space-y-4"
      >
        <div className="flex flex-1 gap-3 items-start">
          <div className={cn("bg-slate-200 text-slate-700 p-2 rounded-full")}>
            <Icon className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">{data?.name}</p>
            <p className="text-muted-foreground text-xs">
              {data?.address}
              {data?.province && `, ${data.province}`}
              {data?.city && `, ${data.city}`}
              {data?.district && `, ${data.district}`}
              {data?.postal_code && ` - ${data.postal_code}`}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="icon-sm" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Alert
            title="Delete Location"
            description="Please make sure you want to delete this location. Once you delete this, there is no going back"
            trigger={
              <Button variant="outline" size="icon-sm">
                <Trash2 className="size-4" />
              </Button>
            }
            footer={
              <div className="flex gap-4 justify-between">
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>

                <Button variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              </div>
            }
          />
        </div>
      </Card>
    </>
  );
};

export default AccountLocationCardList;
