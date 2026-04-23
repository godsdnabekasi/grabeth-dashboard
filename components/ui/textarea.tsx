"use client";

import * as React from "react";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextareaContainerProps extends React.ComponentProps<"textarea"> {
  label?: string;
  required?: boolean;
  error?: string;
  containerClassName?: string;
  rows?: number;
  single?: boolean;
}

function TextareaContainer({
  label,
  required,
  error,
  className,
  containerClassName,
  rows = 4,
  single,
  ...props
}: TextareaContainerProps) {
  const errorBorder = error ? "border-red-500" : "";
  const disabledClass = props.disabled
    ? "bg-gray-200 pointer-events-none cursor-not-allowed"
    : "";

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label htmlFor={props.name as string}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "min-h-9 flex flex-row bg-white",
          "px-3 py-2 gap-3 placeholder:text-muted-foreground dark:bg-input/30 border-input rounded-md border shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          errorBorder,
          disabledClass,
          className
        )}
      >
        <textarea
          rows={single ? 1 : rows}
          data-slot="textarea"
          className={cn(
            "flex flex-1 w-full min-w-0 resize-none",
            "focus-visible:outline-none",
            "placeholder:text-muted-foreground",
            single && "max-h-20 field-sizing-content min-h-5"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormTextareaProps<
  T extends FieldValues,
> extends React.ComponentProps<"textarea"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  containerClassName?: string;
  rows?: number;
}

function Textarea<T extends FieldValues>({
  name,
  control,
  label,
  required,
  containerClassName,
  rows = 4,
  ...props
}: FormTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextareaContainer
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
          rows={rows}
          {...props}
        />
      )}
    />
  );
}

export { Textarea, TextareaContainer };
