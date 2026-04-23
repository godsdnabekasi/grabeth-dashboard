"use client";

import { useState } from "react";

import Image, { ImageProps, StaticImageData } from "next/image";

import PlaceholderImage from "@/assets/images/placeholder-no-image.jpg";
import { cn } from "@/lib/utils";

interface AppImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallback?: string | StaticImageData;
}

export function AppImage({
  src,
  alt = "",
  className,
  fallback = PlaceholderImage,
  ...props
}: AppImageProps) {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  const imageSrc = !src || error ? fallback : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
