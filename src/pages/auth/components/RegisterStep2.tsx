import FormField from "../../../components/ui/FormField";
import LoadingButton from "../../../components/ui/LoadingButton";
import PasswordStrengthIndicator from "../../../components/ui/PasswordStrengthIndicator";
import type { RegisterRequest } from "../../../services/auth/TypesAuth";

interface RegisterStep2Props {
  formData: RegisterRequest;
  confirmPassword: string;
  validation: {
    password: string;
    confirmPassword: string;
    [key: string]: string;
  };
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function RegisterStep2({
  formData,
  confirmPassword,
  validation,
  isLoading,
  handleInputChange,
  handleConfirmPasswordChange,
  onSubmit,
  onBack,
}: RegisterStep2Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <FormField
          label="Пароль"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Введите пароль"
          required
          error={validation.password}
        />
        {/* Индикатор силы пароля */}
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      <FormField
        label="Подтверждение пароля"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Повторите пароль"
        required
        error={validation.confirmPassword}
      />

      {/* Кнопки навигации */}
      <div className="flex gap-3 pt-2">
        <LoadingButton
          type="button"
          isLoading={false}
          loadingText=""
          onClick={onBack}
          className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-400 dark:hover:bg-gray-700"
        >
          Назад
        </LoadingButton>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Создание аккаунта..."
          className="flex-1"
        >
          Создать аккаунт
        </LoadingButton>
      </div>
    </form>
  );
}
