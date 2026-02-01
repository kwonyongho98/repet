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
    "font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variants = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm hover:shadow-md border border-orange-500",
    secondary:
      "bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900 border border-slate-700",
    outline:
      "border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 active:bg-orange-100",
    ghost: 
      "text-orange-500 hover:bg-orange-50 active:bg-orange-100 border border-transparent",
    danger: 
      "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border border-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-base min-h-[40px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
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
