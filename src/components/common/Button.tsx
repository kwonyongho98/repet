import type { ButtonProps } from "../../types/common";
import { Loader2 } from "lucide-react";

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md",
    secondary:
      "bg-secondary text-white hover:bg-secondary-800 active:bg-secondary-950",
    outline:
      "border-2 border-primary text-primary hover:bg-primary-50 active:bg-primary-100",
    ghost: "text-primary hover:bg-primary-50 active:bg-primary-100",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          처리중...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
