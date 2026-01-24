interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
  fallback?: string;
}

export default function Avatar({
  name,
  size = "md",
  src,
  fallback,
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-2xl",
  };

  // fallback이나 name 중 하나 사용
  const displayText = fallback || (name ? name.charAt(0).toUpperCase() : "?");

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold`}
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {displayText}
    </div>
  );
}
