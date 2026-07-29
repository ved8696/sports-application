import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-blue text-white shadow-[0_8px_24px_-6px_rgba(91,147,255,0.4)] hover:bg-blue-dim",
        danger:
          "bg-red text-white shadow-[0_8px_24px_-6px_rgba(229,72,77,0.4)] hover:bg-red-dim",
        ghost: "bg-surface-2 text-foreground border border-border",
        outline: "bg-transparent text-muted border border-white/[0.14]",
        link: "bg-transparent text-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5 text-[15px] w-full rounded-2xl",
        sm: "h-9 px-3.5 text-xs",
        md: "h-11 px-4",
        icon: "h-9 w-9 rounded-[11px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
