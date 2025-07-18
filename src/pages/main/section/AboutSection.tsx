import FeatureCard from "../../../components/ui/FeatureCard";
import SectionContainer from "../../../components/ui/SectionContainer";
import { useScrollAnimations } from "../../../hooks/useScrollAnimations";
import { FaShieldAlt, FaRocket, FaGem, FaUsers } from "react-icons/fa";

export default function AboutSection() {
  const features = [
    {
      icon: (
        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
          <FaShieldAlt className="text-green-500 text-2xl" />
        </div>
      ),
      title: "Банковский уровень защиты",
      text: "Cold storage для 95% активов, двухфакторная аутентификация и шифрование AES-256. За 3 года работы — ноль взломов.",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <FaRocket className="text-blue-500 text-2xl" />
        </div>
      ),
      title: "Скорость исполнения <50мс",
      text: "Ордера исполняются мгновенно благодаря прямым подключениям к ликвидности. Торгуйте на пиковых объемах без проскальзывания.",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <FaGem className="text-purple-500 text-2xl" />
        </div>
      ),
      title: "Комиссии от 0.02%",
      text: "Одни из самых низких комиссий на рынке. VIP статус снижает до 0.01%. Экономьте тысячи долларов на активной торговле.",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
          <FaUsers className="text-orange-500 text-2xl" />
        </div>
      ),
      title: "Поддержка 24/7",
      text: "Техподдержка отвечает в среднем за 2 минуты. Персональные менеджеры для VIP клиентов. Решаем проблемы, а не создаем их.",
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

      {/* Центрированный 2x2 grid layout */}
      <div ref={containerRef} className="max-w-5xl mx-auto">
        {/* Верхняя пара */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-3xl mx-auto">
          <div
            className={`flex transition-all duration-700 ease-out ${
              visibleItems[0]
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: `${0 * 100}ms`,
            }}
          >
            <FeatureCard
              icon={features[0].icon}
              title={features[0].title}
              text={features[0].text}
              isVisible={visibleItems[0]}
            />
          </div>

          <div
            className={`flex transition-all duration-700 ease-out ${
              visibleItems[1]
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: `${1 * 100}ms`,
            }}
          >
            <FeatureCard
              icon={features[1].icon}
              title={features[1].title}
              text={features[1].text}
              isVisible={visibleItems[1]}
            />
          </div>
        </div>

        {/* Нижняя пара */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div
            className={`flex transition-all duration-700 ease-out ${
              visibleItems[2]
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: `${2 * 100}ms`,
            }}
          >
            <FeatureCard
              icon={features[2].icon}
              title={features[2].title}
              text={features[2].text}
              isVisible={visibleItems[2]}
            />
          </div>

          <div
            className={`flex transition-all duration-700 ease-out ${
              visibleItems[3]
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{
              transitionDelay: `${3 * 100}ms`,
            }}
          >
            <FeatureCard
              icon={features[3].icon}
              title={features[3].title}
              text={features[3].text}
              isVisible={visibleItems[3]}
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
