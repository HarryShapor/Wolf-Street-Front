interface AuthFormHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthFormHeader({
  title,
  subtitle,
}: AuthFormHeaderProps) {
  return (
    <div className="px-8 pt-4 pb-2 border-b border-light-border dark:border-dark-border">
      <h1 className="text-2xl font-bold text-center mb-1 text-light-accent dark:text-dark-accent">
        {title}
      </h1>
      <p className="text-center text-sm text-light-fg dark:text-dark-fg">
        {subtitle}
      </p>
    </div>
  );
}
