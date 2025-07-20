import { Link } from "react-router-dom";

interface PromoFeature {
  text: string;
}

interface AuthPromoBannerProps {
  title: string;
  subtitle: string;
  features: PromoFeature[];
  ctaText: string;
  ctaLink: string;
  ctaButtonText: string;
}

export default function AuthPromoBanner({
  title,
  subtitle,
  features,
  ctaText,
  ctaLink,
  ctaButtonText,
}: AuthPromoBannerProps) {
  return (
    <div className="lg:col-span-1 p-8 flex flex-col justify-between min-h-[600px] bg-light-bg dark:bg-dark-bg">
      {/* Верхняя часть - контент */}
      <div>
        <div className="text-center lg:text-left mb-6">
          <h2 className="text-3xl font-bold mb-2 text-light-accent dark:text-dark-accent">
            {title}
          </h2>
          <p className="mb-4 text-light-fg dark:text-dark-fg">{subtitle}</p>
        </div>

        <div className="space-y-2 text-sm text-light-fg dark:text-dark-fg">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 bg-light-accent dark:bg-dark-accent"></div>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка - точно в самом низу */}
      <div className="pt-4">
        <p className="text-sm mb-4 text-center lg:text-left text-light-fg/80 dark:text-dark-nav-inactive">
          {ctaText}
        </p>
        <Link
          to={ctaLink}
          className="inline-block w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out text-center transform hover:scale-105 hover:shadow-lg
            bg-transparent border-2 border-light-accent dark:border-dark-accent 
            text-light-accent dark:text-dark-accent
            hover:bg-light-accent dark:hover:bg-dark-accent 
            hover:text-light-bg dark:hover:text-dark-bg"
        >
          {ctaButtonText}
        </Link>
      </div>
    </div>
  );
}
