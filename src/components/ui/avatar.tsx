"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "size-8",
  medium: "size-12",
  large: "size-16",
};

function Avatar({ className, size = "small", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export interface AvatarImageProps
  extends React.ComponentProps<typeof AvatarPrimitive.Image> {
  size?: "small" | "medium" | "large";
}

function AvatarImage({
  className,
  size = "small",
  ...props
}: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square", sizeClasses[size], className)}
      {...props}
    />
  );
}

export interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  size?: "small" | "medium" | "large";
}

function AvatarFallback({
  className,
  size = "small",
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex items-center justify-center rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
