import React from 'react';
import clsx from 'clsx';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, className, ...props }) => (
  <button
    className={clsx(
      'px-5 py-2.5 rounded bg-light-accent dark:bg-dark-accent text-white font-semibold text-[16px] shadow-none hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 transition-all duration-150',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default ActionButton; 