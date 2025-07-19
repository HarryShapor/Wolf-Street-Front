import React, { useState } from 'react';

interface ModalColorSettingsProps {
  open: boolean;
  onClose: () => void;
  palette: any;
  current: 'green-red' | 'red-green';
  onConfirm: (value: 'green-red' | 'red-green') => void;
}

// Ключи для localStorage (синхронизированы с ModalChartStyle.tsx)
const STORAGE_KEYS = {
  CHART_COLORS: 'chart_colors',
  LAST_PRESET: 'chart_last_preset'
};

// Функция для получения текущих цветов свечей
function getCurrentChartColors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHART_COLORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.up === "string" && typeof parsed.down === "string") {
        return parsed;
      }
    }
  } catch {}
  return { up: "#22d3a8", down: "#f43f5e" };
}

// Функция для сохранения цветов свечей
function saveChartColors(colors: { up: string; down: string }) {
  localStorage.setItem(STORAGE_KEYS.CHART_COLORS, JSON.stringify(colors));
  // Уведомляем другие компоненты об изменении
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.CHART_COLORS }));
}

// Функция для определения текущей схемы по цветам
function getCurrentScheme(colors: { up: string; down: string }): ColorSchemeKey {
  const greenRed = { up: "#22d3a8", down: "#f43f5e" };
  const redGreen = { up: "#f43f5e", down: "#22d3a8" };
  
  if (colors.up === greenRed.up && colors.down === greenRed.down) {
    return 'green-red';
  } else if (colors.up === redGreen.up && colors.down === redGreen.down) {
    return 'red-green';
  }
  // Если цвета не соответствуют стандартным схемам, возвращаем green-red как дефолт
  return 'green-red';
}

const colorSchemes = [
  {
    key: 'green-red',
    label: 'Зелёный рост / Красный падение',
    preview: [
      { up: true, value: '+4.15%' },
      { up: false, value: '-3.21%' },
    ],
    colors: { up: "#22d3a8", down: "#f43f5e" }
  },
  {
    key: 'red-green',
    label: 'Красный рост / Зелёный падение',
    preview: [
      { up: true, value: '+4.15%' },
      { up: false, value: '-3.21%' },
    ],
    colors: { up: "#f43f5e", down: "#22d3a8" }
  },
] as const;

type ColorSchemeKey = typeof colorSchemes[number]['key'];

const ModalColorSettings: React.FC<ModalColorSettingsProps> = ({ open, onClose, palette, current, onConfirm }) => {
  const [selected, setSelected] = useState<ColorSchemeKey>('green-red');
  const [currentColors, setCurrentColors] = useState(getCurrentChartColors());

  React.useEffect(() => {
    if (open) {
      const colors = getCurrentChartColors();
      setCurrentColors(colors);
      setSelected(getCurrentScheme(colors));
    }
  }, [open, current]);

  // Слушаем изменения в localStorage для обновления состояния
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CHART_COLORS && open) {
        const colors = getCurrentChartColors();
        setCurrentColors(colors);
        setSelected(getCurrentScheme(colors));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [open]);

  const handleConfirm = () => {
    const scheme = colorSchemes.find(s => s.key === selected);
    if (scheme) {
      saveChartColors(scheme.colors);
      // Также сохраняем информацию о том, что выбран пресет
      localStorage.setItem(STORAGE_KEYS.LAST_PRESET, 'preset');
    }
    onConfirm(selected);
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-light-border/20 dark:border-dark-border/20">
          <div>
            <h3 className="text-xl font-bold text-light-fg dark:text-dark-fg">
              Настройка стиля графика
            </h3>
            <p className="text-sm text-light-fg-secondary dark:text-dark-nav-inactive mt-1">
              Выберите цветовую схему для свечей
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
          >
            <svg className="w-5 h-5 text-light-nav-inactive dark:text-dark-nav-inactive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Схемы цветов */}
        <div className="p-6 space-y-4">
          {colorSchemes.map(scheme => (
            <div
              key={scheme.key}
              onClick={() => setSelected(scheme.key)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selected === scheme.key
                  ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10 shadow-lg'
                  : 'border-light-border dark:border-dark-border hover:border-light-accent/40 dark:hover:border-dark-accent/40 hover:bg-light-bg dark:hover:bg-dark-bg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-light-fg dark:text-dark-fg">
                  {scheme.label}
                </span>
                {selected === scheme.key && (
                  <div className="w-6 h-6 bg-light-accent dark:bg-dark-accent rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {scheme.preview.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-light-border dark:border-dark-border"
                      style={{ backgroundColor: scheme.colors[item.up ? 'up' : 'down'] }}
                    />
                    <div className="flex-1 h-3 bg-light-border/30 dark:bg-dark-border/30 rounded-full" />
                    <span 
                      className="font-semibold text-sm"
                      style={{ color: scheme.colors[item.up ? 'up' : 'down'] }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>



        {/* Кнопки действий */}
        <div className="flex gap-3 p-6 border-t border-light-border/20 dark:border-dark-border/20">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-light-fg dark:text-dark-fg bg-light-bg dark:bg-dark-bg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors border border-light-border dark:border-dark-border"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalColorSettings;