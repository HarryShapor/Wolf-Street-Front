import { useEffect } from "react";

export function useSnapScroll() {
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      // Предотвращаем накопление событий скролла
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      isScrolling = true;

      // Определяем направление скролла
      const direction = e.deltaY > 0 ? 1 : -1;

      // Получаем все секции
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
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      // Сбрасываем флаг через небольшую задержку
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 500);
    };

    // Добавляем слушатель только на главной странице
    if (window.location.pathname === "/") {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);
}
