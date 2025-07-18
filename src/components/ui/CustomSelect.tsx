import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

export default function CustomSelect({ value, onChange, options, label, placeholder, id, className }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) setHighlighted(-1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      // Если клик по элементу списка (li), не закрываем dropdown здесь
      if (listRef.current && listRef.current.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Закрывать dropdown при скролле страницы
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [open]);

  // Portal dropdown positioning
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  // Scroll to highlighted/selected
  useEffect(() => {
    if (open && listRef.current && highlighted >= 0) {
      const el = listRef.current.children[highlighted] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlighted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      if (!options[highlighted].disabled) {
        onChange(options[highlighted].value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative min-w-[120px] ${className || ""}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{overflow: 'visible'}}
    >
      {label && <label htmlFor={id} className="block mb-1 text-xs font-medium text-light-fg dark:text-dark-fg">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        id={id}
        className={`w-full min-h-[36px] px-3 py-2 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm font-medium text-left focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all cursor-pointer flex items-center relative shadow-md hover:shadow-lg hover:border-light-accent dark:hover:border-dark-accent ${open ? "ring-1 ring-neutral-300 dark:ring-neutral-700 border-neutral-300 dark:border-neutral-700" : ""} text-light-fg dark:text-dark-fg font-sans`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "opacity-50"}>
          {selected ? selected.label : placeholder || "Выберите..."}
        </span>
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform flex items-center justify-center h-4 w-4 ${open ? "rotate-180" : ""}`}
          style={{margin:0,padding:0}}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M7 8.5L10 12L13 8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-light-accent dark:text-dark-accent"/>
          </svg>
        </span>
      </button>
      {open && createPortal(
        <ul
          ref={listRef}
          style={dropdownStyle}
          className="bg-white dark:bg-dark-card bg-opacity-100 dark:bg-opacity-100 border border-white dark:border-dark-card rounded-xl shadow-2xl max-h-96 overflow-auto text-sm py-1 font-sans"
          role="listbox"
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`px-4 py-2 cursor-pointer select-none flex items-center justify-between gap-2 transition-colors rounded-lg
                ${opt.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-light-accent/10 dark:hover:bg-dark-accent/10"}
                ${value === opt.value ? "bg-light-accent/20 dark:bg-dark-accent/20 font-bold text-light-accent dark:text-dark-accent" : "text-light-fg dark:text-dark-fg font-normal"}
                ${highlighted === i ? "bg-light-accent/10 dark:bg-dark-accent/10" : ""}
              `}
              onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && (
                <span className="ml-2 flex items-center justify-center">
                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M5 10l4 4 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-light-accent dark:text-dark-accent"/>
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>, document.body)
      }
    </div>
  );
} 