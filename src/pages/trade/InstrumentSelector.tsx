import React from 'react';
import CustomSelect from '../../components/ui/CustomSelect';

interface InstrumentSelectorProps {
  value: string;
  onChange: (v: string) => void;
  options: { ticker: string; title: string }[];
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ value, onChange, options }) => {
  return (
    <div
      className="w-full py-3 rounded-xl border border-light-border dark:border-dark-border shadow-md bg-white/30 dark:bg-dark-card/40 backdrop-blur-md mb-4 focus:border-neutral-400 dark:focus:border-neutral-700 focus:ring-0 transition-all duration-300 hover:shadow-[0_0_32px_0_theme('colors.light-accent')] dark:hover:shadow-[0_0_32px_0_#81c784] hover:scale-[1.03] animate-fadein overflow-visible"
      style={{ borderWidth: 1 }}
    >
      <div className="text-sm font-semibold text-light-fg dark:text-dark-fg mb-2">Изменение инструмента</div>
      <CustomSelect
        value={value}
        onChange={onChange}
        options={options.map(inst => ({ value: inst.ticker, label: inst.title }))}
        className="w-full bg-transparent border-none shadow-none px-0 py-0 focus:ring-0 min-w-0"
      />
    </div>
  );
};

export default InstrumentSelector; 