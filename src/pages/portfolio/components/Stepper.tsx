import React from 'react';
import StepperLine from './StepperLine';
import type { Step } from './StepTypes';

interface StepperProps {
  steps: Step[];
  active: string;
  onStepClick?: (key: string) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, active, onStepClick, className }) => (
  <div className={className}>
    <StepperLine steps={steps} activeKey={active} onStepClick={onStepClick} />
  </div>
);

export default Stepper; 