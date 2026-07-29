"use client";

import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const baseClass =
  "absolute rounded-xl outline-none transition-colors hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500";

function style(box: Box) {
  return { top: `${box.top}%`, left: `${box.left}%`, width: `${box.width}%`, height: `${box.height}%` };
}

interface LinkHotspotProps extends Box, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
}

export function LinkHotspot({ top, left, width, height, href, className, ...props }: LinkHotspotProps) {
  return (
    <Link
      href={href}
      className={cn(baseClass, className)}
      style={style({ top, left, width, height })}
      {...props}
    />
  );
}

interface ButtonHotspotProps extends Box, ButtonHTMLAttributes<HTMLButtonElement> {}

export function ButtonHotspot({ top, left, width, height, className, ...props }: ButtonHotspotProps) {
  return (
    <button
      type="button"
      className={cn(baseClass, className)}
      style={style({ top, left, width, height })}
      {...props}
    />
  );
}
