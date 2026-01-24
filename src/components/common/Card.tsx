import type { CardProps } from "../../types/common";

export default function Card({
  children,
  className = "",
  title,
  subtitle,
  onClick,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-secondary-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
