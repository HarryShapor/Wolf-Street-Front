import React from 'react';
import CustomSelect from '../../components/ui/CustomSelect';

interface InstrumentSelectorProps {
  value: string;
  onChange: (v: string) => void;
  options: { symbol: string; name: string }[];
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ value, onChange, options }) => {
  return (
    <div
      className="w-full max-w-xs px-4 py-3 rounded-xl border border-light-border dark:border-dark-border shadow-md bg-gradient-to-br from-light-accent/10 to-light-bg/80 dark:from-dark-accent/20 dark:to-dark-bg/90 mb-6 focus:border-neutral-400 dark:focus:border-neutral-700 focus:ring-0"
      style={{ borderWidth: 1 }}
    >
      <div className="text-sm font-semibold text-light-fg dark:text-dark-fg mb-2">Изменение инструмента</div>
      <CustomSelect
        value={value}
        onChange={onChange}
        options={options.map(inst => ({ value: inst.symbol, label: `${inst.symbol} — ${inst.name}` }))}
        className="w-full bg-transparent border-none shadow-none px-0 py-0 focus:ring-0 min-w-0"
      />
    </div>
  );
};

export default InstrumentSelector; 