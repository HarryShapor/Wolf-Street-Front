interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({
  currentStep,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="mb-3">
      {/* Прогресс бар с двумя отдельными полосками */}
      <div className="flex items-center justify-center mb-2">
        {/* Первый кружок */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            currentStep >= 1
              ? "bg-light-accent dark:bg-dark-accent text-light-bg dark:text-dark-bg"
              : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
          }`}
        >
          {currentStep > 1 ? (
            // Галочка для завершенного первого шага
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            1
          )}
        </div>

        {/* Левая полоска */}
        <div
          className={`h-1 w-20 transition-all duration-300 ${
            currentStep >= 1
              ? "bg-light-accent dark:bg-dark-accent"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        />

        {/* Пробел между полосками */}
        <div className="w-2" />

        {/* Правая полоска */}
        <div
          className={`h-1 w-20 transition-all duration-300 ${
            currentStep >= 2
              ? "bg-light-accent dark:bg-dark-accent"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        />

        {/* Второй кружок */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            currentStep >= 2
              ? "bg-light-accent dark:bg-dark-accent text-light-bg dark:text-dark-bg"
              : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
          }`}
        >
          2
        </div>
      </div>

      {/* Названия шагов */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`text-xs font-medium transition-colors duration-300 ${
              index + 1 === currentStep
                ? "text-light-accent dark:text-dark-accent"
                : index + 1 < currentStep
                ? "text-light-accent dark:text-dark-accent"
                : "text-light-fg/70 dark:text-gray-500"
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}