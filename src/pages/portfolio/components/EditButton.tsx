import React from 'react';

interface EditButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  label?: string;
  className?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, children, label, className }) => (
  <button
    className={`bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[130px] hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40 ${className || ''}`}
    onClick={onClick}
  >
    {children || label || 'Изменить'}
  </button>
);

export default EditButton; 