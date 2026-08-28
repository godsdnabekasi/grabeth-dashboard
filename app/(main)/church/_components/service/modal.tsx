import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { SERVICE_TYPE_OPTIONS } from "@/app/(main)/church/_configs/service";
import {
  ServiceFormValues,
  serviceSchema,
} from "@/app/(main)/church/_types/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputDay } from "@/components/ui/input-day";
import { InputImage } from "@/components/ui/input-image";
import { InputTime } from "@/components/ui/input-time";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ChurchServiceModalProps {
  initialValues?: ServiceFormValues;
  isShowModal: boolean;
  mode?: "create" | "edit";
  setIsShowModal: (val: boolean) => void;
  handleSave: (value: ServiceFormValues) => void;
}

const ChurchServiceModal = ({
  initialValues,
  isShowModal,
  mode = "create",
  setIsShowModal,
  handleSave,
}: ChurchServiceModalProps) => {
  const { control, handleSubmit } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialValues,
  });

  const onSubmit = (data: ServiceFormValues) => {
    handleSave(data);
    setIsShowModal(false);
  };

  return (
    <Dialog open={isShowModal} onOpenChange={setIsShowModal}>
      <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0">
        <DialogHeader
          title={
            mode === "create" ? "Add Church Service" : "Edit Church Service"
          }
          showCloseButton
          className="px-4 py-5 flex-row"
        />

        <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto">
          <InputImage
            label="Photo"
            name="photo"
            recommendedSize="(16:9)"
            className="aspect-video max-w-none"
            control={control}
          />
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              control={control}
              placeholder="e.g. Sunday Morning Service"
            />

            <Select
              label="Type"
              name="type"
              placeholder="Select type"
              control={control}
              options={SERVICE_TYPE_OPTIONS}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            control={control}
            placeholder="e.g. This service is for those who want to grow in their faith..."
            containerClassName="col-span-2"
          />
          <InputDay label="Day" name="day" control={control} />
          <InputTime label="Start Time" name="start_time" control={control} />
          <InputTime label="End Time" name="end_time" control={control} />
          <InputTime label="Open Time" name="open_time" control={control} />

          <Input
            label="Room/Location"
            name="location.name"
            control={control}
            placeholder="e.g. Main Auditorium"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button size="md" onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChurchServiceModal;
