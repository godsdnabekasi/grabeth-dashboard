import { PlusCircle, Trash2 } from "lucide-react";
import { Control, UseFormSetValue, useFieldArray } from "react-hook-form";

import { EventFormValues } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  control: Control<EventFormValues>;
  isSubmitting: boolean;
  parentIndex: number;
  setValue: UseFormSetValue<EventFormValues>;
}

const EventFormCategory = ({ control, parentIndex, isSubmitting }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `tickets.${parentIndex}.categories`,
  });

  const onAddCategory = () => {
    append({
      title: "",
      description: "",
      price: null,
      final_price: null,
    });
  };

  return (
    <div className="col-span-2 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase">
            Ticket Category
          </h2>
          <p className="text-muted-foreground text-xs">
            Add ticket categories for this ticket. (e.g. VIP, Regular, etc.)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddCategory}
          disabled={isSubmitting}
        >
          <PlusCircle className="size-4" /> Add Category
        </Button>
      </div>

      {fields?.map((field, categoryIndex) => (
        <div
          key={field.id}
          className={cn(
            "animate-in fade-in slide-in-from-top-2 gap-4 duration-300 space-y-2 border border-border rounded-lg p-4 bg-gray-50",
            categoryIndex !== 0 && "border-t pt-4 border-t-gray-200"
          )}
        >
          {fields.length > 1 && (
            <div className="animate-in fade-in flex justify-between items-center duration-300">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Category {categoryIndex + 1}
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(categoryIndex)}
                disabled={isSubmitting}
              >
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          )}

          <div className="border-primary/50 grid grid-cols-2 gap-4 pl-6 border-l-4">
            <Input
              label="Name"
              placeholder="Enter name"
              name={`tickets.${parentIndex}.categories.${categoryIndex}.title`}
              control={control}
              disabled={isSubmitting}
            />
            <Input
              label="Description"
              placeholder="Enter description"
              name={`tickets.${parentIndex}.categories.${categoryIndex}.description`}
              control={control}
              disabled={isSubmitting}
            />
            <Input
              label="Price"
              placeholder="Enter price"
              name={`tickets.${parentIndex}.categories.${categoryIndex}.price`}
              control={control}
              disabled={isSubmitting}
              type="currency"
            />
            <Input
              label="Discount Price"
              placeholder="Enter discount price"
              name={`tickets.${parentIndex}.categories.${categoryIndex}.final_price`}
              control={control}
              disabled={isSubmitting}
              type="currency"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventFormCategory;
