import { useState } from "react";

interface AccordionItemProps {
  title: string;
  text: string;
}

export default function AccordionItem({ title, text }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-3xl shadow-lg p-6 border border-light-border dark:border-dark-border transition-all duration-300 hover:shadow-xl">
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-lg font-bold text-light-accent dark:text-dark-accent">
          {title}
        </span>
        <span
          className={`text-light-accent dark:text-dark-accent text-xl transform transition-transform duration-300 ease-in-out ${
            open ? "rotate-90" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </div>

      {/* Контент с плавной анимацией */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "mt-4 max-h-96 opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="text-light-fg dark:text-dark-fg text-base leading-relaxed">
          {text}
        </div>
      </div>
    </div>
  );
}
