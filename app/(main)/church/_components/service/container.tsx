import { useState } from "react";

import {
  Calendar,
  CirclePlus,
  Clock,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import ChurchServiceModal from "@/app/(main)/church/_components/service/modal";
import { SERVICE_TYPE_OPTIONS } from "@/app/(main)/church/_configs/service";
import { ServiceFormValues } from "@/app/(main)/church/_types/types";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import EmptySection from "@/components/ui/empty-section";
import FormSection from "@/components/ui/form/section";
import { IChurchService } from "@/types/church";

interface IChurchServiceContainerProps {
  initialValues?: ServiceFormValues[];
  onRemoveService?: (service: IChurchService) => void;
  onChangeService: (service: IChurchService) => void;
}

const ChurchServiceContainer = ({
  initialValues,
  onRemoveService,
  onChangeService,
}: IChurchServiceContainerProps) => {
  const [selectedService, setSelectedService] = useState<
    ServiceFormValues | undefined
  >(undefined);
  const [openModal, setOpenModal] = useState(false);

  const handleEditService = (service: ServiceFormValues) => {
    setSelectedService(service);
    setOpenModal(true);
  };

  const handleAddService = () => {
    setSelectedService(undefined);
    setOpenModal(true);
  };

  const handleSave = (val: ServiceFormValues) => {
    onChangeService(val as IChurchService);
    setOpenModal(false);
  };

  return (
    <FormSection
      title="Service Schedule"
      description="Manage service schedule"
      icon={Clock}
      action={
        <Button size="md" onClick={handleAddService}>
          <CirclePlus />
          Add Service
        </Button>
      }
    >
      {initialValues?.length === 0 ? (
        <Card>
          <EmptySection message="No services found" />
        </Card>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {initialValues?.map((item, i) => (
            <Card
              key={i}
              contentClassName="p-0 flex-1"
              className="p-0"
              footerClassName="p-4 justify-end gap-2"
              footer={
                <>
                  <Alert
                    title="Are you sure?"
                    description="This action cannot be undone."
                    trigger={
                      <Button variant="destructiveOutline" size="icon">
                        <Trash2 className="size-4" />
                      </Button>
                    }
                    footer={
                      <>
                        <AlertDialogCancel asChild>
                          <Button variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            onRemoveService!(item as IChurchService)
                          }
                        >
                          Delete
                        </Button>
                      </>
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditService(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </>
              }
            >
              <CardHeader className="p-4 border-b border-b-border">
                <span className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-semibold">{item.day}</span>
                </span>
                {item.start_time && item.end_time && (
                  <span className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {item.start_time} - {item.end_time}
                    </span>
                  </span>
                )}
              </CardHeader>

              <div className="flex-1 flex flex-col p-4 gap-1">
                <Badge>
                  {
                    SERVICE_TYPE_OPTIONS.find((i) => i.value === item.type)
                      ?.label
                  }
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
          ))}
        </div>
      )}

      {openModal && (
        <ChurchServiceModal
          initialValues={selectedService}
          isShowModal={openModal}
          setIsShowModal={setOpenModal}
          handleSave={handleSave}
          mode={selectedService ? "edit" : "create"}
        />
      )}
    </FormSection>
  );
};

export default ChurchServiceContainer;
