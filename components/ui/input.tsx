"use client";

import * as React from "react";

import { Eye, EyeOff } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";

export interface InputContainerProps extends Omit<
  React.ComponentProps<"input">,
  "prefix"
> {
  label?: string;
  required?: boolean;
  password?: boolean;
  error?: string;
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
  containerClassName?: string;
}

function InputContainer({
  label,
  required,
  password,
  error,
  prefix,
  postfix,
  className,
  containerClassName,
  ...props
}: InputContainerProps) {
  const [showPassword, setPassword] = React.useState(false);
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
          "flex h-10 flex-row items-center bg-white",
          "gap-3 rounded-md border border-input px-3 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
          errorBorder,
          disabledClass,
          className
        )}
      >
        {prefix}
        <input
          type={
            password
              ? !showPassword
                ? "password"
                : "text"
              : props.type === "currency"
                ? "text"
                : props.type
          }
          inputMode={
            props.type === "number" || props.type === "currency"
              ? "numeric"
              : props.inputMode
          }
          data-slot="input"
          className={cn(
            "flex h-full w-full min-w-0 flex-1",
            "focus-visible:outline-none",
            className
          )}
          onWheel={(e) => props.type === "number" && e.currentTarget.blur()}
          {...props}
        />
        {password ? (
          <button type="button" onClick={() => setPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff className="size-4 opacity-50" />
            ) : (
              <Eye className="size-4 opacity-50" />
            )}
          </button>
        ) : (
          postfix
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormInputProps<
  T extends FieldValues,
> extends React.ComponentProps<"input"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  password?: boolean;
  loading?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  containerClassName?: string;
}

function Input<T extends FieldValues>({
  name,
  control,
  label,
  required,
  password,
  containerClassName,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <InputContainer
          label={label}
          required={required}
          password={password}
          error={error?.message}
          className={props.className}
          name={name}
          id={name as string}
          onChange={(e) => {
            if (props.type === "number" || props.type === "currency") {
              const val = e.target.value;
              const numericValue = val.replace(/[^0-9]/g, "");
              onChange(numericValue === "" ? null : Number(numericValue));
            } else {
              onChange(e);
            }
          }}
          onBlur={onBlur}
          value={props.type === "currency" ? formatCurrency(value) : value}
          containerClassName={containerClassName}
          {...props}
        />
      )}
    />
  );
}

export { Input, InputContainer };
