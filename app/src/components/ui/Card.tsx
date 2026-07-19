"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "gradient" | "solid";
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "glass",
      hover = true,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    const base = "rounded-2xl transition-all duration-300";

    const variants = {
      glass:
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
      gradient:
        "bg-gradient-to-br from-violet-600/10 to-cyan-500/10 border border-violet-500/20",
      solid:
        "bg-[#0d1224] border border-white/[0.06]",
    };

    const hoverClasses = hover
      ? "hover:bg-white/[0.06] hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
      : "";

    const glowClass = glow ? "shadow-[0_0_40px_rgba(124,58,237,0.2)]" : "";

    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], hoverClasses, glowClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
