import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-xs tracking-[0.12em] uppercase transition focus:outline-none focus:ring-2";

const variants = {
  primary: "bg-white text-black border-white hover:bg-neutral-200 focus:ring-white",
  ghost: "bg-transparent text-white border-neutral-700 hover:bg-neutral-900 focus:ring-white",
};

export function Button({ className, variant = "primary", ...props }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
