import { cn } from "@/lib/utils";

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const gradId = "amx-logo-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="27" stroke={`url(#${gradId})`} strokeWidth="6" fill="none" />
      <path
        d="M14 44 L24 20 L32 34 L40 20 L50 44"
        stroke={`url(#${gradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M32 16 V34 M28 16 V26 Q28 29 32 29 Q36 29 36 26 V16" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ size = 32, className, wordmarkClassName }: { size?: number; className?: string; wordmarkClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className={cn("text-xl font-bold tracking-tight text-slate-900", wordmarkClassName)}>
        Adisyon<span className="text-blue-600">Matrix</span>
      </span>
    </span>
  );
}
