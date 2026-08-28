import { CalendarCheck2, CalendarSync } from "lucide-react";

import { FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CardScheduleTypeProps {
  onValueChange: (value: string) => void;
}

const configs = [
  { value: "one_time", label: "One Time", icon: CalendarCheck2 },
  { value: "repeat", label: "Repeat", icon: CalendarSync },
];

const CardScheduleType = ({ onValueChange }: CardScheduleTypeProps) => {
  return (
    <RadioGroup
      defaultValue="one_time"
      onValueChange={onValueChange}
      className="grid grid-cols-2 col-span-2 gap-6"
    >
      {configs.map((config) => (
        <FieldLabel
          key={config.value}
          className="has-data-checked:bg-gray-100 gap-2 items-center p-4 w-full rounded-md border cursor-pointer"
        >
          <RadioGroupItem value={config.value} />
          <div className="bg-accent/50 p-2 rounded-full border">
            <config.icon size={20} className="text-accent-foreground" />
          </div>
          <p className="text-lg font-medium">{config.label}</p>
        </FieldLabel>
      ))}
    </RadioGroup>
  );
};

export default CardScheduleType;
