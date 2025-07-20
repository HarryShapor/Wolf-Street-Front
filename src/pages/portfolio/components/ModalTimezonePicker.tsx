import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';

const TIMEZONES = [
  { value: 'last24', label: 'Последние 24 часа' },
  ...Array.from({ length: 25 }, (_, i) => {
    const offset = 12 - i;
    const sign = offset > 0 ? '+' : offset < 0 ? '-' : '';
    const abs = Math.abs(offset);
    return {
      value: `UTC${sign}${abs === 0 ? '' : abs}`,
      label: `UTC ${sign}${abs}, 00:00`,
    };
  }),
];

interface ModalTimezonePickerProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  current: string;
  onSelect: (tz: string) => void;
  onClose: () => void;
  palette: any;
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 320;
const MODAL_HEIGHT = 320;

const ModalTimezonePicker: React.FC<ModalTimezonePickerProps> = ({ open, anchorRef, current, onSelect, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: MIN_WIDTH });
  const [openUp, setOpenUp] = useState(false);

  useLayoutEffect(() => {
    if (open && anchorRef.current && modalRef.current) {
      const btn = anchorRef.current;
      const btnRect = btn.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      // Вертикальное положение
      const openUpwards = btnRect.bottom + 16 + MODAL_HEIGHT > viewportHeight && btnRect.top > MODAL_HEIGHT;
      setOpenUp(openUpwards);
      // Ширина модалки = ширина кнопки, но не меньше MIN_WIDTH и не больше MAX_WIDTH
      let width = Math.max(MIN_WIDTH, Math.min(btnRect.width, MAX_WIDTH));
      let left = btnRect.left + scrollLeft;
      // Если модалка вылезает за правый край — прижимаем
      if (left + width > viewportWidth - 8) {
        left = viewportWidth - width - 8;
      }
      if (left < 8) left = 8;
      // top: строго поверх кнопки
      let top = openUpwards
        ? btnRect.top + scrollTop + btnRect.height - MODAL_HEIGHT
        : btnRect.top + scrollTop;
      // Если не помещается сверху — прижимаем к верху
      if (openUpwards && top < 8) {
        top = 8;
      }
      // Если не помещается снизу — прижимаем к низу
      if (!openUpwards && top + MODAL_HEIGHT > viewportHeight - 8) {
        top = viewportHeight - MODAL_HEIGHT - 8;
      }
      setPos({ left, top, width });
    }
  }, [open, anchorRef]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-[1200] min-w-[${MIN_WIDTH}px] max-w-[${MAX_WIDTH}px] w-full rounded-2xl shadow-2xl border-2 p-0 text-light-fg dark:text-dark-fg bg-white dark:bg-dark-card border-light-accent dark:border-dark-accent animate-slidein-left ${openUp ? 'origin-bottom-left' : 'origin-top-left'}`}
      style={{
        left: pos.left,
        top: pos.top,
        width: pos.width,
        position: 'absolute',
        transition: 'box-shadow 0.2s',
      }}
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-[22px] text-neutral-500 hover:text-light-accent dark:hover:text-dark-accent transition-colors bg-transparent border-none outline-none"
        style={{ lineHeight: 1 }}
        aria-label="Закрыть"
      >×</button>
      {/* Заголовок */}
      <div className="text-center pt-6 pb-2 px-6">
        <div className="text-[20px] font-extrabold text-light-accent dark:text-dark-accent mb-1">Выберите часовой пояс</div>
      </div>
      {/* Список таймзон */}
      <div className="max-h-[220px] overflow-y-auto px-2 pb-4 custom-tz-scroll">
        {TIMEZONES.map((tz, idx) => (
          <label
            key={tz.value}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 mb-1
              ${current === tz.value ? 'bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent font-bold' : 'hover:bg-light-bg/80 dark:hover:bg-dark-bg/80'}`}
            style={{ fontSize: 15 }}
          >
            <input
              type="radio"
              name="tz"
              checked={current === tz.value}
              onChange={() => onSelect(tz.value)}
              className="accent-light-accent dark:accent-dark-accent mr-2 w-4 h-4"
            />
            <span>
              {tz.label}
              {current === tz.value && idx !== 0 ? ' (Текущий)' : ''}
            </span>
          </label>
        ))}
      </div>
      <style>{`
        .animate-slidein-left {
          animation: slideInLeft 0.32s cubic-bezier(.4,1.4,.6,1) both;
        }
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(40px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .custom-tz-scroll::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-tz-scroll::-webkit-scrollbar-thumb {
          background: #c56b6233;
          border-radius: 5px;
        }
        .custom-tz-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default ModalTimezonePicker; 