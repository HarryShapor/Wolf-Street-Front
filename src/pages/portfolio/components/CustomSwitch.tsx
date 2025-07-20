import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ checked, onChange, ariaLabel, className }) => {
  const { theme } = useTheme();

  // Цвета для light/dark темы
  const activeBg = theme === 'dark' ? 'bg-dark-accent' : 'bg-light-accent';
  const inactiveBg = theme === 'dark' ? 'bg-dark-border' : 'bg-light-border';
  const borderColor = theme === 'dark' ? 'border-dark-border' : 'border-light-border';

  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={ariaLabel}
      className={`relative w-10 h-6 rounded-full transition-all duration-200 focus:outline-none flex items-center px-1 select-none
        ${checked ? activeBg : inactiveBg} ${borderColor} ${className || ''}`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out flex items-center justify-center text-base
          ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      >
        {checked ? (
          // Галочка SVG
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 11 17 4 10" />
          </svg>
        ) : (
          // Крестик SVG
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C739C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </span>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
};

export default CustomSwitch; 