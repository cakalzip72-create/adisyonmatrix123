import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="relative w-full">{children}</div>
    </div>
  );
}
