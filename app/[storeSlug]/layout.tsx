import { ReactNode } from "react";
import { StoreProvider } from "@/lib/store-context";

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  return <StoreProvider slug={storeSlug}>{children}</StoreProvider>;
}
