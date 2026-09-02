"use client";

import { useState } from "react";

import type { FilterPeriod } from "../../_types";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { label: string; value: FilterPeriod }[] = [
  { label: "Bulan ini", value: 1 },
  { label: "3 bulan", value: 3 },
  { label: "6 bulan", value: 6 },
  { label: "1 tahun", value: 12 },
];

interface IProps {
  onChangePeriod?: (period: FilterPeriod) => void;
}

const CoolSummaryFilter = ({ onChangePeriod }: IProps) => {
  const [active, setActive] = useState<FilterPeriod>(1);

  const handleChange = (value: FilterPeriod) => {
    setActive(value);
    onChangePeriod?.(value);
  };

  return (
    <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
      {FILTER_OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          className={cn(
            "px-4 py-2 text-sm font-semibold transition-all rounded-lg whitespace-nowrap",
            active === value
              ? "bg-white text-[#FF4D6D] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default CoolSummaryFilter;
