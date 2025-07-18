import FeatureCard from "../../../components/ui/FeatureCard";
import SectionContainer from "../../../components/ui/SectionContainer";
import { useScrollAnimations } from "../../../hooks/useScrollAnimations";

export default function AboutSection() {
  const features = [
    {
      icon: (
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 32 32"
          className="text-light-accent dark:text-dark-accent"
        >
          <circle
            cx="16"
            cy="16"
            r="15"
            className="stroke-current"
            strokeWidth="2"
          />
          <path
            d="M10 16l4 4 8-8"
            className="stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Гарантия безопасности",
      text: "Ваши активы под защитой: многоуровневое шифрование, резервные копии и круглосуточный мониторинг. Мы — ваш цифровой сейф.",
      gridClass: "col-start-1 row-start-1",
    },
    {
      icon: (
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 32 32"
          className="text-light-accent dark:text-dark-accent"
        >
          <rect
            x="4"
            y="8"
            width="24"
            height="16"
            rx="4"
            className="stroke-current"
            strokeWidth="2"
          />
          <path
            d="M8 16h16M16 12v8"
            className="stroke-current"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Технологии будущего",
      text: "Интеллектуальные алгоритмы, автоматизация сделок и интеграция с топовыми банками. Всё для вашего роста и удобства.",
      gridClass: "col-start-2 row-start-1",
    },
    {
      icon: (
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 32 32"
          className="text-light-accent dark:text-dark-accent"
        >
          <path
            d="M16 4l4 8 8 1-6 6 2 9-8-4-8 4 2-9-6-6 8-1 4-8z"
            className="stroke-current fill-light-card dark:fill-dark-card"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Премиальный стиль",
      text: "Дизайн, который вдохновляет: минимализм, скорость, внимание к деталям. Управляйте капиталом с удовольствием.",
      gridClass: "col-start-3 row-start-1",
    },
    {
      icon: (
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 32 32"
          className="text-light-accent dark:text-dark-accent"
        >
          <circle
            cx="16"
            cy="16"
            r="14"
            className="stroke-current"
            strokeWidth="2"
          />
          <path
            d="M10 22v-2a4 4 0 014-4h4a4 4 0 014 4v2"
            className="stroke-current"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="13"
            r="3"
            className="stroke-current"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Живое сообщество",
      text: "Wolf Street — это не только сервис, но и люди. Форумы, поддержка 24/7, обмен опытом и совместные инвестиции.",
      gridClass: "col-start-2 row-start-2",
    },
  ];

  // Хук для анимаций скролла с задержками
  const [containerRef, visibleItems] = useScrollAnimations(features.length, {
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px",
    staggerDelay: 200, // 200ms задержка между карточками
  });

  return (
    <SectionContainer id="about">
      <h2 className="text-3xl font-extrabold text-light-accent dark:text-dark-accent mb-8 text-center tracking-wide">
        О проекте
      </h2>

      {/* Grid с анимациями появления */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-6 max-w-4xl mx-auto"
      >
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`${
              feature.gridClass
            } flex transition-all duration-700 ease-out ${
              visibleItems[idx]
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: `${idx * 100}ms`,
            }}
          >
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              text={feature.text}
              isVisible={visibleItems[idx]}
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
