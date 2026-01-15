// src/components/ui/Avatar/AvatarDot.tsx
import React, {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import clsx from "clsx";

type DotColor = "neutral" | "primary" | "success" | "error" | "warning";

export type AvatarDotProps = {
  color?: DotColor;
  isPing?: boolean;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export const AvatarDot = forwardRef<HTMLDivElement, AvatarDotProps>(
  ({ color = "neutral", isPing, className, children, ...rest }, ref) => {
    const colorClasses: Record<DotColor, string> = {
      neutral: "bg-gray-300",
      primary: "bg-blue-500",
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-400",
    };

    return (
      <div
        className={clsx(
          "absolute h-3 w-3 rounded-full",
          colorClasses[color],
          className,
        )}
        ref={ref}
        {...rest}
      >
        {isPing && (
          <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-inherit opacity-80" />
        )}
        {children}
      </div>
    );
  },
);

AvatarDot.displayName = "AvatarDot";
