interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = [
    "Очень слабый",
    "Слабый",
    "Средний",
    "Сильный",
    "Очень сильный",
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              level <= strength
                ? strengthColors[strength - 1]
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-light-fg dark:text-dark-fg">
        Сила пароля: {strengthLabels[strength - 1] || "Слишком простой"}
      </p>
    </div>
  );
}
