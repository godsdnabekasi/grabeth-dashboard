"use client";

import { memo, useCallback, useMemo } from "react";

import { CalendarIcon } from "lucide-react";
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
    const errorBorder = useMemo(() => (error ? "border-red-500" : ""), [error]);
    const disabledClass = disabled
      ? "bg-gray-200 pointer-events-none cursor-not-allowed !opacity-100"
      : "";

    const handleSelect = useCallback(
      (date?: Date) => onChange(date),
      [onChange]
    );

    const displayValue = useMemo(
      () => (value ? moment(value).format("DD MMM YYYY") : placeholder),
      [value, placeholder]
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
            <Button
              variant="outline"
              id={name as string}
              disabled={disabled}
              className={cn(
                "justify-between text-sm font-normal",
                value ? "" : "text-muted-foreground",
                errorBorder,
                disabledClass
              )}
            >
              {displayValue}
              <CalendarIcon className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="overflow-hidden p-0 w-auto" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
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
