"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { classNames } from "@/lib/utils";

interface ExternalImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ExternalImage({ src, alt = "", className }: ExternalImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={classNames("flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 text-gangwon-orange", className)}>
        <ImageOff size={30} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={classNames("h-full w-full object-cover", className)}
    />
  );
}
