interface SectionContainerProps {
  id: string;
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

export default function SectionContainer({
  id,
  children,
  maxWidth = 900,
  className = "",
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`snap-start max-w-full min-h-screen h-screen flex flex-col justify-center p-0 m-0 
        bg-light-bg dark:bg-dark-bg 
        border-b border-gray-800 dark:border-dark-border 
        ${className}`}
    >
      <div className="mx-auto w-full p-12" style={{ maxWidth }}>
        {children}
      </div>
    </section>
  );
}
