"use client";

import { cn } from "@/lib/utils";
import React, { useMemo, ComponentType, useState } from "react";

interface ComponentCache {
  [key: string]: ComponentType<{ className?: string }> | null;
}

const req = require.context("@/assets/icons", true, /\.svg$/);

const icons: ComponentCache = req.keys().reduce((acc: ComponentCache, curr) => {
  const key = curr.replace("./", "").replace(".svg", "");
  acc[key] = req(curr).default;
  return acc;
}, {});

export interface SvgIconProps {
  name: string;
  className?: string;
  rotate?: boolean;
  clickRotate?: boolean;
  rotateDuration?: number;
  onClick?: () => void;
}

const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  rotate = false,
  clickRotate = false,
  rotateDuration = 1000,
  className = "",
  onClick,
  ...props
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" does not exist in the icon map.`);
    return null;
  }

  const handleClick = () => {
    if (clickRotate) {
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), rotateDuration);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      {...props}
      className={cn(
        className,
        rotate ? "animate-spin" : "",
        isRotating ? `animate-spin duration-${rotateDuration}` : ""
      )}
    >
      <IconComponent className="w-full h-full" />
    </div>
  );
};

export default SvgIcon;
