"use client";

import { memo, useCallback, useState } from "react";

import { Control, Controller, FieldValues, Path } from "react-hook-form";

import * as SelectPrimitive from "@radix-ui/react-select";

import { InputContainer } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as SelectContainer,
  SelectContent,
  SelectItem,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-container";
import { cn } from "@/lib/utils";

const DISABLED_STYLES =
  "bg-gray-200 pointer-events-none cursor-not-allowed !opacity-100";

export const SelectComp = memo(function SelectComp<T extends FieldValues>({
  name,
  value,
  label,
  required,
  options,
  placeholder,
  error,
  size = "default",
  searchable,
  className,
  contentClassName,
  itemClassName,
  onSearch,
  onChange,
  disabled,
  ...rootProps
}: {
  name: Path<T>;
  value: string;
  label?: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "default";
  searchable?: boolean;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  onSearch?: (val: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
} & Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "value" | "onValueChange"
>) {
  const [search, setSearch] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const triggerClassName = cn(
    "flex flex-1 bg-white",
    disabled && DISABLED_STYLES,
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex flex-1">
        <SelectContainer
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          {...rootProps}
        >
          <SelectTrigger
            size={size}
            className={triggerClassName}
            aria-invalid={!!error}
            id={name}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            className={contentClassName}
            position="popper"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {searchable && (
              <InputContainer
                placeholder="Search…"
                value={search}
                containerClassName="mb-4"
                onKeyDown={(e) => e.stopPropagation()}
                onChange={handleSearchChange}
              />
            )}
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={itemClassName}
              >
                {opt.icon}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectContainer>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export function Select<T extends FieldValues>({
  name,
  control,
  label,
  required,
  options,
  placeholder,
  size = "default",
  searchable,
  className,
  contentClassName,
  itemClassName,
  onSearch,
  ...rootProps
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "default";
  searchable?: boolean;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  onSearch?: (val: string) => void;
} & Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "value" | "onValueChange"
>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <SelectComp
          name={name}
          value={value}
          label={label}
          required={required}
          options={options}
          placeholder={placeholder}
          error={error?.message}
          size={size}
          searchable={searchable}
          className={className}
          contentClassName={contentClassName}
          itemClassName={itemClassName}
          onSearch={onSearch}
          onChange={onChange}
          {...rootProps}
        />
      )}
    />
  );
}
