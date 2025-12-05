import React, {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type AvatarColor =
  | "neutral"
  | "primary"
  | "success"
  | "error"
  | "warning";

type AvatarOwnProps<E extends ElementType = "div"> = {
  component?: E;
  src?: string | null;
  alt?: string;
  name?: string;
  size?: number; // بالـ rem*4
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  color?: AvatarColor | "auto";
};

export type AvatarProps<E extends ElementType = "div"> =
  AvatarOwnProps<E> &
  Omit<React.ComponentPropsWithoutRef<E>, "color" | "className" | "children">;

const AvatarInner = forwardRef(
  <E extends ElementType = "div">(
    props: AvatarProps<E>,
    ref: ForwardedRef<any>,
  ) => {
    const {
      component,
      src,
      alt,
      name,
      size = 10,
      className,
      style,
      children,
      color = "neutral",
      ...rest
    } = props;

    const Component = component || "div";

    const chars =
      name
        ?.match(/\b(\w)/g)
        ?.slice(0, 2)
        .join("")
        .toUpperCase() || "";

    const bgColor: Record<AvatarColor, string> = {
      neutral: "bg-gray-200 text-gray-800",
      primary: "bg-blue-600 text-white",
      success: "bg-green-600 text-white",
      error: "bg-red-600 text-white",
      warning: "bg-yellow-500 text-white",
    };

    const resolvedColor: AvatarColor =
      color === "auto" ? "primary" : (color as AvatarColor);

    return (
      <Component
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center overflow-hidden rounded-full",
          className,
        )}
        style={{
          height: `${size / 4}rem`,
          width: `${size / 4}rem`,
          ...style,
        }}
        {...rest}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={clsx(
              "flex h-full w-full items-center justify-center text-sm font-medium uppercase",
              bgColor[resolvedColor],
            )}
          >
            {name ? chars : children}
          </div>
        )}
      </Component>
    );
  },
);

AvatarInner.displayName = "Avatar";

export const Avatar = AvatarInner;
