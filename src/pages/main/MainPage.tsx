import { useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import HeroSection from "./section/HeroSection";
import SearchModal from "../../components/ui/SearchModal";
import AboutSection from "./section/AboutSection";
import ChartSection from "./section/ChartSection";
import FAQSection from "./section/FAQSection";
import { useScrollTracking } from "../../hooks/useScrollTracking";
import { usePageAnimations } from "../../hooks/usePageAnimations";
import { useSnapScroll } from "../../hooks/useSnapScroll";

const NAV = [
  { id: "main", label: "Главная" },
  { id: "about", label: "О проекте" },
  { id: "chart", label: "График" },
  { id: "faq", label: "FAQ" },
  { id: "footer", label: "Контакты" },
];

export default function MainPage() {
  // State для email и поиска
  const [email, setEmail] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPos, setSearchPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Custom hooks для логики
  const { scrolled, activeSection } = useScrollTracking(NAV);
  const { headerVisible, heroVisible } = usePageAnimations();

  // Добавляем snap scrolling
  useSnapScroll();

  return (
    <div className="min-h-screen w-full font-sans bg-light-bg text-light-fg dark:bg-dark-bg dark:text-dark-fg scroll-smooth snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
      {/* Header */}
      <Header
        NAV={NAV}
        setSearchPos={setSearchPos}
        scrolled={scrolled}
        activeSection={activeSection}
        headerVisible={headerVisible}
        setSearchOpen={setSearchOpen}
        searchOpen={searchOpen}
      />

      {/* Search Modal */}
      <SearchModal
        searchOpen={searchOpen}
        searchPos={searchPos}
        onClose={() => setSearchOpen(false)}
      />

      {/* Hero Section */}
      <HeroSection
        email={email}
        heroVisible={heroVisible}
        setEmail={setEmail}
      />

      {/* About Section */}
      <AboutSection />

      {/* Chart Section */}
      <ChartSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
