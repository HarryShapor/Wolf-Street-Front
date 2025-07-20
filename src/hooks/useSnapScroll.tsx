import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useSnapScroll() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/") return;
    let isScrolling = false;
    let scrollTimeout: number;

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }
      isScrolling = true;
      const direction = e.deltaY > 0 ? 1 : -1;

      // Получаем все секции (включая футер)
      const sections = document.querySelectorAll("section[id]");
      const currentSection = Array.from(sections).find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });
      if (currentSection) {
        const currentIndex = Array.from(sections).indexOf(currentSection);
        const targetIndex = Math.max(
          0,
          Math.min(sections.length - 1, currentIndex + direction)
        );
        if (targetIndex !== currentIndex) {
          e.preventDefault();
          const targetSection = sections[targetIndex];

          // Специальная логика для футера - скроллим в конец страницы
          if (targetSection.id === "footer") {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "smooth",
            });
          } else {
            targetSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }

      // Сбрасываем флаг через небольшую задержку
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 500);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [location.pathname]);
}
