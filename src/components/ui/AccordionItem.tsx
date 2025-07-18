import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface AccordionItemProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
}

export default function AccordionItem({
  title,
  text,
  icon,
}: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-light-border dark:border-dark-border transition-all duration-300 hover:shadow-xl hover:border-light-accent/30 dark:hover:border-dark-accent/30 group cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center gap-4 p-6 hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-all duration-200 rounded-2xl select-none">
        {/* Иконка */}
        {icon && (
          <div className="w-12 h-12 bg-light-bg dark:bg-dark-bg rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        )}

        {/* Заголовок */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-light-accent dark:text-dark-accent transition-colors duration-200">
            {title}
          </h3>
        </div>

        {/* Стрелка - увеличиваем время анимации */}
        <div
          className={`text-light-accent dark:text-dark-accent transform transition-all duration-500 ease-in-out ${
            open ? "-rotate-90" : "rotate-0"
          }`}
        >
          <FaChevronDown className="text-lg" />
        </div>
      </div>

      {/* Контент с более плавной анимацией */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-6 pb-6 transition-all duration-500 delay-100 ${
            open
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-2"
          }`}
        >
          <div className="pl-16 text-light-fg/80 dark:text-dark-fg/80 text-base leading-relaxed">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
