import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'gradient' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40';
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-light-accent dark:bg-dark-accent text-white hover:bg-light-accent/90 dark:hover:bg-dark-accent/90',
  secondary: 'bg-light-card dark:bg-dark-card text-light-accent dark:text-dark-accent border border-light-accent dark:border-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10',
  gradient: 'bg-gradient-to-r from-light-accent to-light-accent/90 dark:from-dark-accent dark:to-dark-accent/90 text-white shadow-lg hover:scale-[1.04] hover:shadow-2xl',
  ghost: 'bg-transparent text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10',
};
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[14px]',
  md: 'px-5 py-2 text-[16px]',
  lg: 'px-7 py-2.5 text-[18px]',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => (
  <button
    className={clsx(
      base,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
    )}
    {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
    {children}
    {iconRight && <span className="ml-2 flex items-center">{iconRight}</span>}
  </button>
);

export default Button; 