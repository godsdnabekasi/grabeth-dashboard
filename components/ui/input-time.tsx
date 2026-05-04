"use client";

import * as React from "react";

import { Clock } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputTimeContainerProps extends Omit<
  React.ComponentProps<"input">,
  "type" | "prefix"
> {
  label?: string;
  required?: boolean;
  error?: string;
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
  containerClassName?: string;
}

function InputTimeContainer({
  label,
  required,
  error,
  prefix,
  postfix,
  className,
  containerClassName,
  ...props
}: InputTimeContainerProps) {
  const errorBorder = error ? "border-red-500" : "";
  const disabledClass = props.disabled
    ? "bg-gray-200 pointer-events-none cursor-not-allowed"
    : "";

  return (
    <div className={cn("space-y-2 relative", containerClassName)}>
      {label && (
        <Label htmlFor={props.name as string} required={required}>
          {label}
        </Label>
      )}
      <div
        className={cn(
          "flex flex-row items-center h-10 bg-white",
          "px-3 gap-3 placeholder:text-muted-foreground dark:bg-input/30 border-input rounded-md border shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          errorBorder,
          disabledClass,
          className
        )}
      >
        <Clock className="size-4 opacity-50" />
        {prefix}
        <input
          type="time"
          data-slot="input"
          className={cn(
            "flex flex-1 w-full min-w-0 h-full",
            "focus-visible:outline-none",
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            className
          )}
          {...props}
        />
        {postfix}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormInputTimeProps<T extends FieldValues> extends Omit<
  React.ComponentProps<"input">,
  "type"
> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  containerClassName?: string;
}

function InputTime<T extends FieldValues>({
  name,
  control,
  label,
  required,
  containerClassName,
  ...props
}: FormInputTimeProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <InputTimeContainer
          label={label}
          required={required}
          error={error?.message}
          className={props.className}
          name={name}
          id={name as string}
          onChange={onChange}
          onBlur={onBlur}
          value={value || ""}
          containerClassName={containerClassName}
          {...props}
        />
      )}
    />
  );
}

export { InputTime, InputTimeContainer };
