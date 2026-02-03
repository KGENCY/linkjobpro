"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, className = "" }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          h-5 w-5 shrink-0 rounded border-2 transition-all
          ${checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300 hover:border-blue-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
      >
        {checked && (
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";