import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  const ariaLabel = props["aria-label"] || props.placeholder || props.name;
  return (
    <input
      aria-label={ariaLabel}
      className={cn(
        "w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-white/70",
        className
      )}
      {...props}
    />
  );
}
