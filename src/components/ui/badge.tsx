import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  bgColor?: string;
}

function Badge({ className, color, bgColor, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        color: color ?? "#667085",
        backgroundColor: bgColor ?? "#F2F4F7",
        ...style,
      }}
      {...props}
    />
  );
}

export { Badge };
