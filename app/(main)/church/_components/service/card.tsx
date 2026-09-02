import { MapPin, Pencil, Trash2 } from "lucide-react";

import { SERVICE_TYPE_OPTIONS } from "@/app/(main)/church/_configs/service";
import { ServiceFormValues } from "@/app/(main)/church/_types/service";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { IChurchService } from "@/types/church";

const SERVICE_TYPE_CONFIG: Record<string, { color: string }> = {
  general: {
    color: "#ff9129",
  },
  community: {
    color: "#0b8457",
  },
  generation: {
    color: "#1a0088",
  },
};

interface IServiceCardProps {
  item: ServiceFormValues;
  onRemoveService?: (service: IChurchService) => void;
  handleEditService: (service: ServiceFormValues) => void;
}

const ServiceCard = ({
  item,
  onRemoveService,
  handleEditService,
}: IServiceCardProps) => {
  const typeOption = SERVICE_TYPE_OPTIONS.find((i) => i.value === item.type);
  const typeConfig =
    SERVICE_TYPE_CONFIG[item.type] || SERVICE_TYPE_CONFIG.general;

  return (
    <Card
      contentClassName="p-0 flex-1"
      className="p-0"
      footerClassName="p-4 justify-center gap-2"
      footer={
        <>
          <Alert
            title="Are you sure?"
            description="This action cannot be undone."
            trigger={
              <Button variant="destructive">
                <Trash2 className="size-4" /> Delete
              </Button>
            }
            footer={
              <>
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => onRemoveService?.(item as IChurchService)}
                >
                  Delete
                </Button>
              </>
            }
          />
          <Button className="flex-1" onClick={() => handleEditService(item)}>
            <Pencil className="size-4" /> Edit
          </Button>
        </>
      }
    >
      <div className="w-full aspect-video relative">
        <Image
          src={
            typeof item.photo === "object"
              ? URL.createObjectURL(item.photo as File) || ""
              : item.photo || ""
          }
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col p-4 gap-1">
        <Badge
          style={{
            backgroundColor: typeConfig.color,
          }}
        >
          {typeOption?.label || item.type}
        </Badge>
        <h3 className="font-semibold text-sm">{item.name}</h3>
        {item.location?.name && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground truncate">
            <span>
              <MapPin className="size-4" />
            </span>
            {item.location?.name}
          </span>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;
