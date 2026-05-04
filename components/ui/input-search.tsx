"use client";

import { memo } from "react";

import { Search } from "lucide-react";

import { InputContainer, InputContainerProps } from "@/components/ui/input";

const InputSearch = memo(
  ({ value, onChange, placeholder, ...props }: InputContainerProps) => {
    return (
      <InputContainer
        {...props}
        id="input-search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        prefix={<Search className="size-4 opacity-50" />}
        type="search"
      />
    );
  }
);

InputSearch.displayName = "InputSearch";

export default InputSearch;
