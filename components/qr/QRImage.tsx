"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRImage({ value, size = 160, color = "#1d4ed8" }: { value: string; size?: number; color?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: color, light: "#ffffff" } }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size, color]);

  if (!src) {
    return <div className="animate-pulse rounded-xl bg-slate-100" style={{ width: size, height: size }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR kod" width={size} height={size} className="rounded-xl" />;
}
