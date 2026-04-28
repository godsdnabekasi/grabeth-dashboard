import { PlusCircle, Ticket, Trash2 } from "lucide-react";
import { Control, UseFormSetValue, useFieldArray } from "react-hook-form";

import { EventFormValues } from "./types";
import EventFormCategory from "@/components/page/event/form-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  control: Control<EventFormValues>;
  setValue: UseFormSetValue<EventFormValues>;
  isSubmitting: boolean;
}

const EventFormTicket = ({ control, setValue, isSubmitting }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const onAdd = () => {
    append({
      title: "",
      description: "",
      publish_time: null,
      unpublish_time: null,
      categories: [
        {
          title: "",
          description: "",
          price: null,
          final_price: null,
        },
      ],
    });
  };

  return (
    <>
      {fields.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-6 duration-300">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="">
                <h2 className="text-xl font-bold">Ticket</h2>
                <p className="text-muted-foreground text-sm">
                  Add a ticket for this event, leave empty to not add a ticket
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAdd}
                disabled={isSubmitting}
              >
                <PlusCircle className="size-4" />
                Add Ticket
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="animate-in fade-in slide-in-from-top-2 p-4 space-y-2 bg-white rounded-lg border duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground flex gap-1 items-center text-xs font-semibold tracking-widest uppercase">
                      <Ticket className="size-4" /> Ticket {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      placeholder="Enter name"
                      name={`tickets.${index}.title`}
                      control={control}
                      disabled={isSubmitting}
                      containerClassName="col-span-2"
                    />
                    <Textarea
                      label="Description"
                      placeholder="Enter description"
                      name={`tickets.${index}.description`}
                      control={control}
                      disabled={isSubmitting}
                    />
                    <Textarea
                      label="Terms & Conditions"
                      placeholder="Enter terms"
                      name={`tickets.${index}.terms`}
                      control={control}
                      disabled={isSubmitting}
                    />

                    <Separator className="col-span-2" />

                    <EventFormCategory
                      control={control}
                      parentIndex={index}
                      setValue={setValue}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        onClick={onAdd}
        className={cn(
          "group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 transition-all",
          isSubmitting
            ? "cursor-not-allowed opacity-50"
            : "active:scale-[0.99] cursor-pointer hover:bg-muted/30"
        )}
      >
        <PlusCircle className="text-muted-foreground mb-3 w-6 h-6" />
        <h3 className="text-lg font-medium">Add Ticket</h3>
        <p className="text-muted-foreground max-w-xs text-sm text-center">
          Create a ticket for this event with its own capacity and details
        </p>
      </div>
    </>
  );
};

export default EventFormTicket;
