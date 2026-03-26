const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base = "staff-btn";
  const v = variant === "ghost" ? "staff-btn--ghost" : variant === "danger" ? "staff-btn--danger" : "staff-btn--primary";
  const s = size === "sm" ? "staff-btn--sm" : size === "xs" ? "staff-btn--xs" : "";

  return (
    <button
      className={`${base} ${v} ${s} ${className}`.trim()}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
