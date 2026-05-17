import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("fs-panel p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-sm tracking-[0.18em] uppercase text-white", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-xs fs-muted leading-relaxed", className)} {...props} />;
}
