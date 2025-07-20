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
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Сначала сбрасываем все элементы
          setVisibleItems(new Array(itemsCount).fill(false));

          // Очищаем предыдущие таймауты
          timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
          timeoutsRef.current = [];

          // Запускаем анимацию карточек с задержками
          for (let i = 0; i < itemsCount; i++) {
            const timeout = setTimeout(() => {
              setVisibleItems((prev) => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });
            }, i * staggerDelay);

            timeoutsRef.current.push(timeout);
          }
        } else {
          // Когда элемент уходит из viewport, сбрасываем анимацию
          setVisibleItems(new Array(itemsCount).fill(false));

          // Очищаем таймауты при выходе из viewport
          timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
          timeoutsRef.current = [];
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      // Очищаем таймауты при unmount
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));

      if (container) {
        observer.unobserve(container);
      }
    };
  }, [itemsCount, threshold, rootMargin, staggerDelay]);

  return [containerRef, visibleItems] as const;
}
