import { useMemo, useState } from "react";

import { CirclePlus, Clock } from "lucide-react";

import ServiceCard from "@/app/(main)/church/_components/service/card";
import ChurchServiceModal from "@/app/(main)/church/_components/service/modal";
import { ServiceFormValues } from "@/app/(main)/church/_types/service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmptySection from "@/components/ui/empty-section";
import FormSection from "@/components/ui/form/section";
import { IChurchService } from "@/types/church";

interface IChurchServiceContainerProps {
  initialValues?: ServiceFormValues[];
  onRemoveService?: (service: IChurchService) => void;
  onChangeService: (service: IChurchService) => void;
}

const ChurchServiceContainer = ({
  initialValues = [],
  onRemoveService,
  onChangeService,
}: IChurchServiceContainerProps) => {
  const [selectedService, setSelectedService] = useState<
    ServiceFormValues | undefined
  >(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [values, setValues] = useState<ServiceFormValues[]>(initialValues);

  const orderedServices = useMemo(() => {
    const order: Record<string, number> = {
      general: 1,
      generation: 2,
      community: 3,
    };
    return [...values].sort(
      (a, b) => (order[a.type] || 99) - (order[b.type] || 99)
    );
  }, [values]);

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
    console.log(val.photo);

    const newValues = [...values];
    const index = newValues.findIndex((item) => item.id === val.id);
    if (index !== -1) {
      newValues[index] = val;
    } else {
      newValues.push(val);
    }
    setValues(newValues);
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
      {orderedServices.length === 0 ? (
        <Card>
          <EmptySection message="No services found" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orderedServices.map((item, i) => (
            <ServiceCard
              key={i}
              item={item}
              onRemoveService={onRemoveService}
              handleEditService={handleEditService}
            />
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
