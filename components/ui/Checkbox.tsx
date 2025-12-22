"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed"
          )}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
