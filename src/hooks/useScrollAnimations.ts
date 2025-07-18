import { useState, useEffect, useRef } from "react";

interface UseScrollAnimationsOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

export function useScrollAnimations(
  itemsCount: number,
  {
    threshold = 0.1,
    rootMargin = "0px",
    staggerDelay = 150,
  }: UseScrollAnimationsOptions = {}
) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemsCount).fill(false)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Запускаем анимацию карточек с задержками
          for (let i = 0; i < itemsCount; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });
            }, i * staggerDelay);
          }

          // Отключаем observer после первого срабатывания
          observer.unobserve(container);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [itemsCount, threshold, rootMargin, staggerDelay]);

  return [containerRef, visibleItems] as const;
}
