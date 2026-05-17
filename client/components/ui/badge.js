import { cn } from "@/lib/utils";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-[10px] tracking-[0.12em] uppercase text-neutral-200",
        className
      )}
      {...props}
    />
  );
}
