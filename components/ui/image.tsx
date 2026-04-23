"use client";

import { useState } from "react";

import NextImage, {
  ImageProps as NextImageProps,
  StaticImageData,
} from "next/image";

import PlaceholderImage from "@/assets/images/placeholder-no-image.jpg";
import { cn } from "@/lib/utils";

interface ImageProps extends Omit<NextImageProps, "src"> {
  src?: string | null;
  fallback?: string | StaticImageData;
}

export function Image({
  src,
  alt = "",
  className,
  fallback = PlaceholderImage,
  ...props
}: ImageProps) {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  const imageSrc = !src || error ? fallback : src;

  return (
    <NextImage
      {...props}
      src={imageSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
