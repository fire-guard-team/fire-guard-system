// src/components/ui/Badge/index.tsx
import React, {
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type ReactNode,
} from "react";
import clsx from "clsx";

type Variant = "filled" | "outlined" | "soft";
type BadgeColor = "neutral" | "primary" | "success" | "error" | "warning";

type BadgeOwnProps<E extends ElementType = "div"> = {
  component?: E;
  className?: string;
  children?: ReactNode;
  variant?: Variant;
  color?: BadgeColor;
};

export type BadgeProps<E extends ElementType = "div"> =
  BadgeOwnProps<E> &
  Omit<React.ComponentPropsWithoutRef<E>, "color" | "children" | "className">;

const BadgeInner = forwardRef(
  <E extends ElementType = "div">(
    props: BadgeProps<E>,
    ref: ForwardedRef<any>,
  ) => {
    const {
      component,
      className,
      children,
      variant = "filled",
      color = "neutral",
      ...rest
    } = props;
    const Component = component || "div";

    const base =
      "inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full";

    const neutralVariants: Record<Variant, string> = {
      filled: "bg-gray-200 text-gray-900",
      outlined: "border border-gray-300 text-gray-900",
      soft: "bg-gray-200/40 text-gray-900",
    };

    const colorVariants: Record<BadgeColor, Record<Variant, string>> = {
      neutral: neutralVariants,
      primary: {
        filled: "bg-blue-600 text-white",
        outlined: "border border-blue-500 text-blue-600",
        soft: "bg-blue-100 text-blue-700",
      },
      success: {
        filled: "bg-green-600 text-white",
        outlined: "border border-green-500 text-green-700",
        soft: "bg-green-100 text-green-700",
      },
      error: {
        filled: "bg-red-600 text-white",
        outlined: "border border-red-500 text-red-700",
        soft: "bg-red-100 text-red-700",
      },
      warning: {
        filled: "bg-yellow-500 text-white",
        outlined: "border border-yellow-400 text-yellow-700",
        soft: "bg-yellow-100 text-yellow-700",
      },
    };

    return (
      <Component
        ref={ref}
        className={clsx(base, colorVariants[color][variant], className)}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

BadgeInner.displayName = "Badge";

export const Badge = BadgeInner;
