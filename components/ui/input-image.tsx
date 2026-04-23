"use client";

import * as React from "react";

import { Camera, Plus, X } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Image } from "@/components/ui/image";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputImageContainerProps {
  label?: string;
  description?: string;
  recommendedSize?: string;
  error?: string;
  value?: string | File | null;
  onChange: (value: File | null) => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  name?: string;
}

function InputImageContainer({
  label,
  description = "Upload a cover image",
  recommendedSize,
  error,
  value,
  onChange,
  disabled,
  className,
  containerClassName,
  required,
  name,
}: InputImageContainerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleContainerClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2 flex flex-col", containerClassName)}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}

      <div
        onClick={handleContainerClick}
        className={cn(
          "relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all cursor-pointer overflow-hidden",
          preview ? "max-w-1/2 aspect-3/4" : "w-full h-full",
          error && "border-red-500",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <button
                type="button"
                onClick={handleClear}
                className="opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all transform scale-90 group-hover:scale-100"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 relative w-full h-full justify-center">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] aspect-square border-40 border-white/40 rounded-full -mb-[60%] pointer-events-none" />

            <div className="relative">
              <div className="bg-white p-4 rounded-full shadow-sm ring-1 ring-gray-100 relative z-10">
                <Camera className="size-8 text-[#FF4D4D]" />
                <div className="absolute top-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="bg-[#FF4D4D] rounded-full w-4 h-4 flex items-center justify-center">
                    <Plus className="size-2 text-white" strokeWidth={4} />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center relative z-10">
              <p className="font-semibold text-gray-900 text-lg">
                {description}
              </p>
              {recommendedSize && (
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: {recommendedSize}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormInputImageProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  recommendedSize?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

function InputImage<T extends FieldValues>({
  name,
  control,
  ...props
}: FormInputImageProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputImageContainer
          {...props}
          name={name}
          value={value}
          onChange={onChange}
          error={error?.message}
        />
      )}
    />
  );
}

export { InputImage, InputImageContainer };
