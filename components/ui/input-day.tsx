"use client";

import { Control, FieldValues, Path } from "react-hook-form";

import { Select } from "@/components/ui/select";

const DAYS = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

export interface InputDayProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputDay<T extends FieldValues>({
  name,
  control,
  label,
  required,
  placeholder = "Select day",
  disabled,
  className,
}: InputDayProps<T>) {
  return (
    <Select
      control={control}
      name={name}
      label={label}
      required={required}
      options={DAYS}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
