import { useState } from "react";

import { PlusCircle } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";

import CardScheduleType from "@/app/(main)/event/_components/card-schedule-type";
import { EventFormValues } from "@/app/(main)/event/_types/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputDatePicker } from "@/components/ui/input-date-picker";
import { InputTime } from "@/components/ui/input-time";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  control: Control<EventFormValues>;
  isSubmitting: boolean;
}

const EventFormSchedule = ({ control, isSubmitting }: Props) => {
  const [scheduleType, setScheduleType] = useState("single_date");

  const {
    fields: schedules,
    append: appendSchedule,
    remove: removeSchedule,
    update,
  } = useFieldArray({
    control,
    name: "schedules",
  });

  const onAddSchedule = () => {
    appendSchedule({
      date: null,
      event_id: null,
      start_time: null,
      end_time: null,
    });
  };

  // const onUpdateScheduleType = (index: number, value: string) => {
  //   update(index, {
  //     ...schedules[index],
  //     type: value,
  //   });
  // };

  return schedules.length > 0 ? (
    <Card contentClassName="p-0 space-y-4">
      <CardHeader>
        <CardTitle>Event Schedule</CardTitle>
        <CardDescription>
          Add event schedule for this event. (e.g. Day 1, Day 2, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {schedules?.map((schedule, index) => (
          <div
            key={schedule.id || index}
            className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 duration-300"
          >
            {index !== 0 && <Separator />}

            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <CardScheduleType onValueChange={setScheduleType} />

              <div className="grid grid-cols-3 col-span-2 gap-6">
                <InputDatePicker
                  label="Date"
                  placeholder="Select date"
                  name={`schedules.${index}.date`}
                  required
                  control={control}
                  disabled={isSubmitting}
                />
                <InputTime
                  label="Start Time"
                  placeholder="Select time"
                  name={`schedules.${index}.start_time`}
                  required
                  control={control}
                  disabled={isSubmitting}
                />
                <InputTime
                  label="End Time"
                  placeholder="Select time"
                  name={`schedules.${index}.end_time`}
                  required
                  control={control}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => removeSchedule(schedule.id || index)}
                type="button"
                disabled={isSubmitting}
                className="col-span-2"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => onAddSchedule()}
          disabled={isSubmitting}
        >
          Add Schedule
        </Button>
      </CardContent>
    </Card>
  ) : (
    <div
      onClick={onAddSchedule}
      className={cn(
        "group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 transition-all",
        isSubmitting
          ? "cursor-not-allowed opacity-50"
          : "active:scale-[0.99] cursor-pointer hover:bg-muted/30"
      )}
    >
      <PlusCircle className="text-muted-foreground mb-3 w-6 h-6" />
      <h3 className="text-lg font-medium">Add Schedule</h3>
      <p className="text-muted-foreground max-w-xs text-sm text-center">
        Create a schedule for this event
      </p>
    </div>
  );
};

export default EventFormSchedule;
