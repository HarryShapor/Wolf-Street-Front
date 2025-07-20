import React from 'react';
import clsx from 'clsx';
import type { Step } from './StepTypes';

interface StepperLineProps {
  steps: Step[];
  activeKey: string;
  onStepClick?: (key: string) => void;
}

const StepperLine: React.FC<StepperLineProps> = ({ steps, activeKey, onStepClick }) => (
  <div className="flex items-center justify-between mb-2 px-2 min-h-[40px]">
    {steps.map((step, idx) => (
      <div key={step.key} className="flex-1 flex items-center relative cursor-pointer" onClick={() => onStepClick?.(step.key)}>
        {idx > 0 && (
          <div className="h-0.5 flex-1 bg-light-border dark:bg-dark-border" />
        )}
        <div className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center font-bold text-[16px] border-2 mx-1 z-10 transition-colors duration-200',
          activeKey === step.key
            ? 'bg-light-accent dark:bg-dark-accent text-white border-light-accent dark:border-dark-accent'
            : 'bg-light-bg dark:bg-dark-bg text-light-fg/80 dark:text-dark-brown border-light-border dark:border-dark-border'
        )}>{idx + 1}</div>
        {idx < steps.length - 1 && (
          <div className="h-0.5 flex-1 bg-light-border dark:bg-dark-border" />
        )}
      </div>
    ))}
  </div>
);

export default StepperLine; 