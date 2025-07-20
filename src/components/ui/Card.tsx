import React from "react";
import clsx from "clsx";

interface CardProps {
  title?: React.ReactNode;
  accent?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  disableHover?: boolean;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  accent = false,
  icon,
  actions,
  footer,
  className,
  onClick,
  disableHover = false,
  children,
}) => (
  <div
    className={clsx(
      // glassmorphism + анимация + тени
      "flex flex-col rounded-2xl border-2 shadow-xl p-6 transition-all duration-300",
      "bg-white/30 dark:bg-dark-card/40 backdrop-blur-md",
      !disableHover &&
        'hover:shadow-[0_0_32px_0_theme("colors.light-accent")] dark:hover:shadow-[0_0_32px_0_#81c784] hover:scale-[1.03]',
      "animate-fadein",
      accent
        ? "border-light-accent dark:border-dark-accent"
        : "border-light-border dark:border-dark-border",
      className
    )}
    style={{ boxSizing: "border-box" }}
    onClick={onClick}
  >
    {(icon || title || actions) && (
      <div className="flex items-center mb-4 gap-3">
        {icon && (
          <span className="text-2xl mr-2 flex items-center">{icon}</span>
        )}
        {title && (
          <div className="text-[20px] font-bold text-light-fg dark:text-dark-fg flex-1">
            {title}
          </div>
        )}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    )}
    <div className="flex-1">{children}</div>
    {footer && <div className="mt-4">{footer}</div>}
  </div>
);

export default Card;
