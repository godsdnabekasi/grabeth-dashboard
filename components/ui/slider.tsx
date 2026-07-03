"use client";

import { useEffect, useMemo, useState } from "react";

import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  const [currentValues, setCurrentValues] = useState<number[]>(_values);

  useEffect(() => {
    setCurrentValues(_values);
  }, [_values]);

  return (
    <div className="flex flex-1 space-x-2 items-center">
      <p className="text-sm text-muted-foreground">{min}</p>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
          className
        )}
        onValueChange={(vals) => {
          setCurrentValues(vals);
          props.onValueChange?.(vals);
        }}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-gray-300 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="pointer-events-none absolute -bottom-9 left-1/2 mb-2 -translate-x-1/2">
              <span className="block h-0 w-0 mx-auto border-x-4 border-b-4 border-x-transparent border-b-primary" />
              <span className="flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-primary-foreground">
                {currentValues[index] ?? _values[index]}
              </span>
            </span>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      <p className="text-sm text-muted-foreground">{max}</p>
    </div>
  );
}

export { Slider };
