"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { CalendarIcon, X } from "lucide-react";
import moment from "moment";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
};

const DatePickerInputComponent = <T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder = "Select date",
  disabled,
  containerClassName,
}: DatePickerInputProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <DatePickerContent
        name={name}
        value={value}
        onChange={onChange}
        error={error}
        label={label}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        containerClassName={containerClassName}
      />
    )}
  />
);

type DatePickerContentProps<T extends FieldValues> = {
  name: Path<T>;
  value?: Date;
  onChange: (date?: Date) => void;
  error?: { message?: string };
  label?: string;
  required?: boolean;
  placeholder: string;
  disabled?: boolean;
  containerClassName?: string;
};

const DatePickerContent = memo(
  <T extends FieldValues>({
    name,
    value,
    onChange,
    error,
    label,
    required,
    placeholder,
    disabled,
    containerClassName,
  }: DatePickerContentProps<T>) => {
    const [currentValue, setCurrentValue] = useState(value);
    const errorBorder = useMemo(() => (error ? "border-red-500" : ""), [error]);
    const disabledClass = disabled
      ? "bg-gray-200 pointer-events-none cursor-not-allowed !opacity-100"
      : "";

    const handleSelect = useCallback(
      (date?: Date) => {
        onChange(date);
        setCurrentValue(date);
      },
      [onChange]
    );

    const displayValue = useMemo(
      () =>
        currentValue ? moment(currentValue).format("DD MMM YYYY") : placeholder,
      [currentValue, placeholder]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onChange(undefined);
        setCurrentValue(undefined);
      },
      [onChange]
    );

    return (
      <div className={cn("flex flex-col space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={name} required={required}>
            {label}
          </Label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <div
              id={name as string}
              className={cn(
                "flex h-10 flex-row items-center bg-white cursor-pointer",
                "gap-3 rounded-md border border-input px-3 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
                currentValue ? "" : "text-muted-foreground",
                errorBorder,
                disabledClass
              )}
            >
              <CalendarIcon className="size-4 opacity-50" />
              <p className="flex-1">{displayValue}</p>
              {currentValue && (
                <Button variant="ghost" size="none" onClick={handleClear}>
                  <X className="size-4 opacity-50" />
                </Button>
              )}
            </div>
          </PopoverTrigger>

          <PopoverContent className="overflow-hidden p-0 w-auto" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              weekStartsOn={1}
              defaultMonth={value}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
        {error && <p className="text-xs text-red-500">{error.message}</p>}
      </div>
    );
  }
);

DatePickerContent.displayName = "DatePickerContent";

export const InputDatePicker = memo(
  DatePickerInputComponent
) as typeof DatePickerInputComponent;
