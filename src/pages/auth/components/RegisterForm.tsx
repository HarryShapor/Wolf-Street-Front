import ErrorAlert from "../../../components/ui/ErrorAlert";
import StepIndicator from "../../../components/ui/StepIndicator";
import RegisterStep1 from "./RegisterStep1";
import RegisterStep2 from "./RegisterStep2";
import { useMultiStepRegister } from "../../../hooks/useMultiStepRegister";
import { useEffect } from 'react';

interface RegisterFormProps {
  onSuccess: () => void;
  showToast: (opts: {message: string, type?: 'success'|'error'|'info', title?: string}) => void;
}

export default function RegisterForm({ onSuccess, showToast }: RegisterFormProps) {
  const {
    currentStep,
    formData,
    confirmPassword,
    isLoading,
    error,
    validation,
    handleInputChange,
    handleConfirmPasswordChange,
    handleSubmit,
    nextStep,
    prevStep,
  } = useMultiStepRegister({ onSuccess });

  const steps = ["Основные данные", "Безопасность"];

  useEffect(() => {
    if (error) {
      showToast({message: error, type: 'error', title: 'Ошибка регистрации'});
    }
  }, [error, showToast]);

  return (
    <div className="px-8 pt-4 pb-2">
      {/* Индикатор прогресса */}
      <StepIndicator currentStep={currentStep} totalSteps={2} steps={steps} />

      {/* Ошибки теперь через toast */}
      {/* <div className="mb-2"><ErrorAlert error={error} /></div> */}

      {/* Рендер текущего шага */}
      {currentStep === 1 ? (
        <RegisterStep1
          formData={formData}
          validation={validation}
          handleInputChange={handleInputChange}
          onNext={nextStep}
        />
      ) : (
        <RegisterStep2
          formData={formData}
          confirmPassword={confirmPassword}
          validation={validation}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleConfirmPasswordChange={handleConfirmPasswordChange}
          onSubmit={handleSubmit}
          onBack={prevStep}
        />
      )}
    </div>
  );
}
