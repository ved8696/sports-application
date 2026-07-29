import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-[52px] w-full rounded-xl border bg-surface px-4 text-[15px] text-foreground placeholder:text-muted-2",
        "focus:outline-none focus:ring-1",
        error ? "border-red/60 focus:ring-red/40" : "border-border focus:ring-blue/40 focus:border-blue/40",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
