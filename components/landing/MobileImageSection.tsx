import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mobil tasarım görsellerinin doğal ölçüsü — 9:16'ya çok yakın. */
export const MOBILE_ASPECT = "941 / 1672";

/**
 * Masaüstündeki ImageSection'ın mobil karşılığı.
 * Görsel tam genişlikte akar, çocuk öğeler (hotspot'lar) yüzde konumla üstüne biner.
 */
export function MobileImageSection({
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
    <section id={id} className={cn("relative w-full scroll-mt-4", className)} style={{ aspectRatio: MOBILE_ASPECT }}>
      <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      {children}
    </section>
  );
}
