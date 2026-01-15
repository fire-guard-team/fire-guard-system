// src/components/ui/Button/index.tsx
import React, {
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type ReactNode,
} from "react";
import clsx from "clsx";

type Variant = "filled" | "outlined" | "soft" | "flat";
type ButtonColor = "neutral" | "primary" | "success" | "error" | "warning";

type ButtonOwnProps<E extends ElementType = "button"> = {
  component?: E;
  children?: ReactNode;
  color?: ButtonColor;
  isIcon?: boolean;
  variant?: Variant;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<E>, "color" | "className" | "children">;

export type ButtonProps<E extends ElementType = "button"> = ButtonOwnProps<E>;

const colorBase: Record<ButtonColor, string> = {
  neutral: "",
  primary: "text-white bg-blue-600 hover:bg-blue-700",
  success: "text-white bg-green-600 hover:bg-green-700",
  error: "text-white bg-red-600 hover:bg-red-700",
  warning: "text-white bg-yellow-500 hover:bg-yellow-600",
};

const neutralVariants: Record<Variant, string> = {
  filled:
    "bg-gray-150 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200/80",
  soft: "bg-gray-150/30 text-gray-900 hover:bg-gray-200/40",
  outlined:
    "border border-gray-300 text-gray-900 hover:bg-gray-200/20 active:bg-gray-200/30",
  flat: "text-gray-700 hover:bg-gray-200/30",
};

const ButtonInner = forwardRef(
  <E extends ElementType = "button">(
    props: ButtonProps<E>,
    ref: ForwardedRef<any>,
  ) => {
    const {
      component,
      className,
      children,
      color = "neutral",
      isIcon = false,
      variant = "filled",
      type: buttonType,
      ...rest
    } = props;
    const Component = component || "button";
    const { disabled, ...propsRest } = rest as any;

    const type = Component === "button" ? buttonType || "button" : undefined;

    const colorClasses =
      color === "neutral"
        ? neutralVariants[variant]
        : clsx(
            {
              filled: colorBase[color],
              soft: `text-${color}-700 bg-${color}-100 hover:bg-${color}-200`,
              outlined: `border border-${color}-400 text-${color}-700 hover:bg-${color}-50`,
              flat: `text-${color}-600 hover:bg-${color}-50`,
            }[variant],
          );

    return (
      <Component
        ref={ref}
        type={type}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none",
          isIcon && "p-0 aspect-square",
          colorClasses,
          className,
        )}
        disabled={Component === "button" ? disabled : undefined}
        data-disabled={disabled}
        {...propsRest}
      >
        {children}
      </Component>
    );
  },
);

ButtonInner.displayName = "Button";

export const Button = ButtonInner;
