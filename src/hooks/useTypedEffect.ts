import { useState, useEffect, useRef } from "react";

interface UseTypedEffectOptions {
  texts: string[];
  typeSpeed?: number;
  backSpeed?: number;
  startDelay?: number;
  backDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
}

export function useTypedEffect({
  texts,
  typeSpeed = 100,
  backSpeed = 50,
  startDelay = 1000,
  backDelay = 2000,
  loop = true,
  showCursor = true,
}: UseTypedEffectOptions) {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursorState, setShowCursorState] = useState(showCursor);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (texts.length === 0) return;

    // Задержка перед началом
    if (!hasStarted.current) {
      timeoutRef.current = window.setTimeout(() => {
        hasStarted.current = true;
        // После задержки начинаем анимацию
        startAnimation();
      }, startDelay);
      return;
    }

    startAnimation();

    function startAnimation() {
      const currentText = texts[currentTextIndex];

      if (isTyping) {
        // Печатаем текст
        if (currentIndexRef.current < currentText.length) {
          timeoutRef.current = window.setTimeout(() => {
            setDisplayText(currentText.slice(0, currentIndexRef.current + 1));
            currentIndexRef.current++;
          }, typeSpeed);
        } else {
          // Закончили печатать, пауза перед стиранием
          if (loop && texts.length > 1) {
            timeoutRef.current = window.setTimeout(() => {
              setIsTyping(false);
            }, backDelay);
          }
        }
      } else {
        // Стираем текст
        if (currentIndexRef.current > 0) {
          timeoutRef.current = window.setTimeout(() => {
            setDisplayText(currentText.slice(0, currentIndexRef.current - 1));
            currentIndexRef.current--;
          }, backSpeed);
        } else {
          // Закончили стирать, переходим к следующему тексту
          const nextIndex = (currentTextIndex + 1) % texts.length;
          setCurrentTextIndex(nextIndex);
          setIsTyping(true);
        }
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    currentTextIndex,
    isTyping,
    texts,
    typeSpeed,
    backSpeed,
    backDelay,
    loop,
    startDelay,
  ]);

  // Анимация курсора
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursorState((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return {
    displayText,
    showCursor: showCursorState,
    isTyping,
    currentTextIndex,
  };
}
