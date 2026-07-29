import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ImageSection({
  id,
  src,
  alt,
  priority,
  className,
  children,
}: {
  id?: string;
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative w-full scroll-mt-4", className)} style={{ aspectRatio: "1536 / 1024" }}>
      <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      {children}
    </section>
  );
}
