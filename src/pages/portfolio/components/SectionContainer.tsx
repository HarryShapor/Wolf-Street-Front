import React from 'react';
import clsx from 'clsx';

interface SectionContainerProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ title, children, actions, className }) => (
  <div className={clsx(
    'bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-[#181926] rounded-2xl shadow-lg card-glow backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 p-8 mb-8',
    className
  )}>
    {title && <div className="text-[22px] font-bold mb-4 text-light-accent dark:text-dark-accent">{title}</div>}
    {actions && <div className="mb-4">{actions}</div>}
    <div>{children}</div>
  </div>
);

export default SectionContainer; 