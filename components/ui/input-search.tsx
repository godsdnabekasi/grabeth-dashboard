"use client";

import { memo, useCallback } from "react";

import { Search, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputContainer } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const InputSearch = memo(
  ({
    value,
    onChange,
    placeholder,
    className
  }: React.ComponentProps<"input">) => {
    const handleClear = useCallback(() => {
      onChange?.({
        target: { value: "" }
      } as React.ChangeEvent<HTMLInputElement>);
    }, [onChange]);

    return (
      <InputContainer
        id="input-search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        prefix={<Search className="size-4 opacity-50" />}
        postfix={
          <Button
            variant="ghost"
            size="none"
            aria-label="Clear search"
            onClick={handleClear}
            className={value ? "" : "opacity-0"}
          >
            <XCircle className="size-4 opacity-50" />
          </Button>
        }
        className={cn("max-w-sm", className)}
      />
    );
  }
);

InputSearch.displayName = "InputSearch";

export default InputSearch;
