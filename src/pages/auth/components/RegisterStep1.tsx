import FormField from "../../../components/ui/FormField";
import LoadingButton from "../../../components/ui/LoadingButton";
import type { RegisterRequest } from "../../../services/auth/TypesAuth";

interface RegisterStep1Props {
  formData: RegisterRequest;
  validation: {
    username: string;
    email: string;
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export default function RegisterStep1({
  formData,
  validation,
  handleInputChange,
  onNext,
}: RegisterStep1Props) {
  return (
    <div className="space-y-4">
      <FormField
        label="Имя пользователя"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleInputChange}
        placeholder="Введите имя пользователя"
        required
        error={validation.username}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Введите email"
        required
        error={validation.email}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Имя"
          name="firstname"
          type="text"
          value={formData.firstname}
          onChange={handleInputChange}
          placeholder="Имя"
        />

        <FormField
          label="Фамилия"
          name="lastname"
          type="text"
          value={formData.lastname}
          onChange={handleInputChange}
          placeholder="Фамилия"
        />
      </div>

      <FormField
        label="Телефон"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleInputChange}
        placeholder="+7 (000) 000-00-00"
      />

      <div className="pt-6 pb-6">
        <LoadingButton
          type="button"
          isLoading={false}
          loadingText=""
          onClick={onNext}
        >
          Далее
        </LoadingButton>
      </div>
    </div>
  );
}
