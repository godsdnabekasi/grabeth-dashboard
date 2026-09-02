import { Info } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import CoolSection from "./section";
import { CoolFormValues, coolSchema } from "@/app/(main)/cool/_types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputDay } from "@/components/ui/input-day";
import { InputImage } from "@/components/ui/input-image";
import { InputLocation } from "@/components/ui/input-location";
import { InputTime } from "@/components/ui/input-time";
import { Textarea } from "@/components/ui/textarea";

interface IFormGeneralProps {
  initialValues?: Partial<CoolFormValues>;
  isSubmitting?: boolean;
}

const FormGeneral = ({ initialValues, isSubmitting }: IFormGeneralProps) => {
  const { control } = useForm<CoolFormValues>({
    resolver: zodResolver(coolSchema),
    defaultValues: initialValues,
  });

  const location = useWatch({
    control,
    name: "location",
  });

  return (
    <CoolSection
      title="General"
      description="General information is the information that is displayed on the main page of the COOL."
      icon={Info}
    >
      <Card>
        <div className="grid grid-cols-2 gap-6">
          <InputImage
            label="Cover Image"
            name="coverImage"
            required
            control={control}
            recommendedSize="1080x1080px (1:1)"
            disabled={isSubmitting}
            className="aspect-square max-w-xs"
          />
          <Input
            label="Name"
            placeholder="Enter name"
            name="name"
            required
            control={control}
            disabled={isSubmitting}
          />
          <Textarea
            label="Description"
            name="description"
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
          <InputDay
            label="Meeting Day"
            placeholder="Select day"
            name="day"
            required
            control={control}
            disabled={isSubmitting}
          />
          <InputTime
            label="Time"
            placeholder="Select time"
            name="time"
            required
            control={control}
            disabled={isSubmitting}
          />

          <Input
            label="Location Name"
            placeholder="Enter location name"
            name="location.name"
            required={!!location?.address}
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
          <InputLocation
            label="Address"
            name="location"
            required={!!location?.name}
            control={control}
            disabled={isSubmitting}
            containerClassName="col-span-2"
          />
        </div>
      </Card>
    </CoolSection>
  );
};

export default FormGeneral;
