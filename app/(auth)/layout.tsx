import { ReactNode } from "react";

/**
 * Arka plan artık ekranın kendisine ait: mobilde tam sayfa tasarım görseli,
 * masaüstünde gradyan. Bu yüzden layout sadece içeriği geçirir.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
