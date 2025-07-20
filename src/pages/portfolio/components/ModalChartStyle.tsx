import React, { useState, useRef, useEffect } from 'react';

const PRESETS = [
  {
    key: 'old',
    name: 'Старая',
    up: '#b6d01b',
    down: '#e6007a',
    icon: [
      { color: '#b6d01b' },
      { color: '#e6007a' },
    ],
  },
  {
    key: 'new',
    name: 'Новая',
    up: '#22d3a8',
    down: '#f43f5e',
    icon: [
      { color: '#22d3a8' },
      { color: '#f43f5e' },
    ],
  },
  {
    key: 'daltonic',
    name: 'Дальтонизм',
    up: '#2196f3',
    down: '#ff9800',
    icon: [
      { color: '#2196f3' },
      { color: '#ff9800' },
    ],
  },
];

// Обновленная палитра на основе цветов из tailwind.config.js
const PALETTE = [
  // Основные цвета темы
  '#6c63ff', // light-accent
  '#81c784', // dark-accent
  '#3ecf8e', // light-success
  '#ff5c8a', // light-error
  '#ef4444', // error
  '#FFD600', // warning
  
  // Цвета для графиков
  '#22d3a8', // зеленый для роста
  '#f43f5e', // красный для падения
  '#b6d01b', // желто-зеленый
  '#e6007a', // розовый
  '#2196f3', // синий
  '#ff9800', // оранжевый
  
  // Дополнительные цвета
  '#6366f1', // индиго
  '#f59e42', // янтарный
  '#10b981', // изумрудный
  '#fbbf24', // желтый
  '#3b82f6', // голубой
  
  // Нейтральные цвета
  '#3a3a4d', // light-fg
  '#6e7287', // light-fg-secondary
  '#f0f4f0', // dark-fg
  '#b0b3b8', // dark-nav-inactive
  '#ffffff', // белый
  '#000000', // черный
];

interface ModalChartStyleProps {
  open: boolean;
  onClose: () => void;
  palette: any;
  current: { up: string; down: string };
  onConfirm: (colors: { up: string; down: string }) => void;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  CHART_COLORS: 'chart_colors',
  LAST_PRESET: 'chart_last_preset'
};

function randomCandles(up: string, down: string) {
  // Генерирует массив свечей для предпросмотра
  const arr = [];
  let last = 50;
  for (let i = 0; i < 18; i++) {
    const open = last + Math.round((Math.random() - 0.5) * 10);
    const close = open + Math.round((Math.random() - 0.5) * 10);
    const high = Math.max(open, close) + Math.round(Math.random() * 5);
    const low = Math.min(open, close) - Math.round(Math.random() * 5);
    arr.push({ open, close, high, low });
    last = close;
  }
  return arr.map((c, i) => ({ ...c, color: c.close >= c.open ? up : down, idx: i }));
}

// Вспомогательные функции hsv/rgb/hex
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, v];
}

function hsvToRgb(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  let i = Math.floor(h / 60);
  let f = h / 60 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hexToHsv(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function clamp(v: number, min: number, max: number): number { 
  return Math.max(min, Math.min(max, v)); 
}

// Улучшенный компонент выбора цвета
function ModernColorPicker({ color, onChange, onClose }: {
  color: string;
  onChange: (c: string) => void;
  onClose: () => void;
}) {
  const [hsv, setHSV] = useState<[number, number, number]>(hexToHsv(color));
  const [drag, setDrag] = useState<'hue' | 'sv' | null>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const svRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { 
    setHSV(hexToHsv(color)); 
  }, [color]);

  useEffect(() => { 
    onChange(hsvToHex(...hsv)); 
  }, [hsv, onChange]);

  // Отрисовка цветового круга
  useEffect(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 200;
    const center = size / 2;
    const radius = 80;
    
    ctx.clearRect(0, 0, size, size);
    
    // Рисуем цветовой круг
    for (let angle = 0; angle < 360; angle += 1) {
      const rad = (angle - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, rad, rad + Math.PI/180, false);
      ctx.closePath();
      ctx.fillStyle = hsvToHex(angle, 1, 1);
      ctx.fill();
    }
    
    // Белый круг внутри
    ctx.beginPath();
    ctx.arc(center, center, radius - 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, []);

  // Отрисовка SV квадрата
  useEffect(() => {
    const canvas = svRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 200;
    
    // Градиент по выбранному hue
    const { r, g, b } = hsvToRgb(hsv[0], 1, 1);
    const hueColor = `rgb(${r},${g},${b})`;
    
    // Создаем градиент
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, hueColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Добавляем вертикальный градиент
    const vGradient = ctx.createLinearGradient(0, 0, 0, size);
    vGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vGradient.addColorStop(1, '#000');
    
    ctx.fillStyle = vGradient;
    ctx.fillRect(0, 0, size, size);
  }, [hsv[0]]);

  // Обработчики событий
  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const distance = Math.sqrt(x * x + y * y);
    
    // Внешний радиус 80, внутренний 60
    if (distance >= 60 && distance <= 80) {
      let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      setHSV([angle, hsv[1], hsv[2]]);
    }
  };

  const handleSVClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = svRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    
    setHSV([hsv[0], x / rect.width, 1 - y / rect.height]);
  };

  // Добавляем обработчики для drag
  const handleHueMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrag('hue');
    handleHueClick(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (drag === 'hue') {
        const canvas = hueRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance >= 60 && distance <= 80) {
          let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
          if (angle < 0) angle += 360;
          setHSV([angle, hsv[1], hsv[2]]);
        }
      }
    };
    
    const handleMouseUp = () => {
      setDrag(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSVMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrag('sv');
    handleSVClick(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (drag === 'sv') {
        const canvas = svRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = clamp(e.clientX - rect.left, 0, rect.width);
        const y = clamp(e.clientY - rect.top, 0, rect.height);
        
        setHSV([hsv[0], x / rect.width, 1 - y / rect.height]);
      }
    };
    
    const handleMouseUp = () => {
      setDrag(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch обработчики для мобильных устройств
  const handleHueTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = hueRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = touch.clientX - rect.left - centerX;
    const y = touch.clientY - rect.top - centerY;
    const distance = Math.sqrt(x * x + y * y);
    
    if (distance >= 60 && distance <= 80) {
      let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      setHSV([angle, hsv[1], hsv[2]]);
    }
  };

  const handleSVTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = svRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clamp(touch.clientX - rect.left, 0, rect.width);
    const y = clamp(touch.clientY - rect.top, 0, rect.height);
    
    setHSV([hsv[0], x / rect.width, 1 - y / rect.height]);
  };

  // Позиции маркеров
  const hueAngle = (hsv[0] - 90) * Math.PI / 180;
  const hueX = 100 + 70 * Math.cos(hueAngle); // 70 - средний радиус между 60 и 80
  const hueY = 100 + 70 * Math.sin(hueAngle);
  const svX = 200 * hsv[1];
  const svY = 200 * (1 - hsv[2]);

  const { r, g, b } = hsvToRgb(...hsv);
  const hex = hsvToHex(...hsv);

  return (
    <div className="fixed inset-0 z-[1202] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-light-border dark:border-dark-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-light-fg dark:text-dark-fg">Выбор цвета</h3>
          <button
            onClick={onClose}
            className="text-light-nav-inactive dark:text-dark-nav-inactive hover:text-light-accent dark:hover:text-dark-accent text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Превью цвета */}
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="w-16 h-16 rounded-full border-4 border-white dark:border-dark-bg shadow-lg"
            style={{ background: hex }}
          />
          <div className="flex-1">
            <div className="text-sm text-light-fg-secondary dark:text-dark-nav-inactive mb-1">HEX</div>
            <input
              type="text"
              value={hex}
              onChange={e => {
                const value = e.target.value;
                if (/^#[0-9a-f]{6}$/i.test(value)) {
                  setHSV(hexToHsv(value));
                }
              }}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg font-mono text-sm focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
              maxLength={7}
            />
          </div>
        </div>

                 {/* Цветовой круг */}
         <div className="relative mb-4">
           <canvas
             ref={hueRef}
             width={200}
             height={200}
             className="block mx-auto cursor-pointer rounded-full select-none"
             onClick={handleHueClick}
             onMouseDown={handleHueMouseDown}
             onTouchStart={handleHueTouchStart}
             style={{ touchAction: 'none' }}
           />
           {/* Маркер на круге */}
           <div
             className="absolute w-6 h-6 rounded-full border-3 border-white shadow-lg pointer-events-none"
             style={{ 
               left: hueX - 12, 
               top: hueY - 12,
               background: hex,
               boxShadow: '0 0 0 2px #000, 0 2px 8px rgba(0,0,0,0.3)'
             }}
           />
         </div>

         {/* SV квадрат */}
         <div className="relative mb-4">
           <canvas
             ref={svRef}
             width={200}
             height={200}
             className="block mx-auto cursor-pointer rounded-lg select-none"
             onClick={handleSVClick}
             onMouseDown={handleSVMouseDown}
             onTouchStart={handleSVTouchStart}
             style={{ touchAction: 'none' }}
           />
           {/* Маркер на квадрате */}
           <div
             className="absolute w-6 h-6 rounded-full border-3 border-white shadow-lg pointer-events-none"
             style={{ 
               left: svX - 12, 
               top: svY - 12,
               background: hex,
               boxShadow: '0 0 0 2px #000, 0 2px 8px rgba(0,0,0,0.3)'
             }}
           />
         </div>

                 {/* RGB поля */}
         <div className="grid grid-cols-3 gap-2 mb-4">
           {[
             { label: 'R', value: r },
             { label: 'G', value: g },
             { label: 'B', value: b }
           ].map(({ label, value }, idx) => (
             <div key={label}>
               <div className="text-xs text-light-fg-secondary dark:text-dark-nav-inactive mb-1">{label}</div>
               <input
                 type="number"
                 min="0"
                 max="255"
                 value={value}
                 onChange={e => {
                   const newValue = clamp(Number(e.target.value), 0, 255);
                   const newRgb = [r, g, b];
                   newRgb[idx] = newValue;
                   setHSV(rgbToHsv(newRgb[0], newRgb[1], newRgb[2]));
                 }}
                 className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg text-center text-sm focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
               />
             </div>
           ))}
         </div>

         {/* Палитра быстрых цветов */}
         <div className="mb-4">
           <div className="text-sm text-light-fg-secondary dark:text-dark-nav-inactive mb-2">Быстрые цвета:</div>
           <div className="grid grid-cols-8 gap-2">
             {PALETTE.map(paletteColor => (
               <button
                 key={paletteColor}
                 onClick={() => setHSV(hexToHsv(paletteColor))}
                 className="w-8 h-8 rounded-full border-2 border-light-border dark:border-dark-border hover:border-light-accent dark:hover:border-dark-accent transition-colors"
                 style={{ background: paletteColor }}
                 aria-label={`Выбрать цвет ${paletteColor}`}
               />
             ))}
           </div>
         </div>

         {/* Кнопки */}
         <div className="flex gap-3">
           <button
             onClick={onClose}
             className="flex-1 px-4 py-2 border border-light-border dark:border-dark-border rounded-lg text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
           >
             Отмена
           </button>
           <button
             onClick={() => {
               onChange(hex);
               onClose();
             }}
             className="flex-1 px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-lg hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 transition-colors"
           >
             Применить
           </button>
         </div>
      </div>
    </div>
  );
}

const ModalChartStyle: React.FC<ModalChartStyleProps> = ({ open, onClose, current, onConfirm }) => {
  const [selected, setSelected] = useState(current);
  const [custom, setCustom] = useState(false);
  const [showPicker, setShowPicker] = useState<'up' | 'down' | null>(null);
  const [lastPreset, setLastPreset] = useState<string | null>(null);

  // Загрузка сохраненных настроек
  useEffect(() => {
    if (open) {
      try {
        const savedColors = localStorage.getItem(STORAGE_KEYS.CHART_COLORS);
        const savedPreset = localStorage.getItem(STORAGE_KEYS.LAST_PRESET);
        
        if (savedColors) {
          const parsed = JSON.parse(savedColors);
          setSelected(parsed);
          // Если есть сохраненный пресет, не считаем это кастомными цветами
          setCustom(savedPreset !== 'preset');
        }
        
        if (savedPreset) {
          setLastPreset(savedPreset);
        }
      } catch (error) {
        console.error('Ошибка загрузки сохраненных настроек:', error);
      }
    }
  }, [open]);

  // Слушаем изменения в localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CHART_COLORS && open) {
        try {
          const savedColors = localStorage.getItem(STORAGE_KEYS.CHART_COLORS);
          const savedPreset = localStorage.getItem(STORAGE_KEYS.LAST_PRESET);
          
          if (savedColors) {
            const parsed = JSON.parse(savedColors);
            setSelected(parsed);
            setCustom(savedPreset !== 'preset');
          }
        } catch (error) {
          console.error('Ошибка обработки изменения localStorage:', error);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [open]);

  // Сохранение настроек
  const saveSettings = (colors: { up: string; down: string }, presetKey?: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_COLORS, JSON.stringify(colors));
      if (presetKey) {
        localStorage.setItem(STORAGE_KEYS.LAST_PRESET, presetKey);
      }
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const handleConfirm = (colors: { up: string; down: string }) => {
    saveSettings(colors);
    onConfirm(colors);
    onClose();
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setSelected({ up: preset.up, down: preset.down });
    setCustom(false);
    setLastPreset(preset.key);
    // Сохраняем информацию о том, что выбран пресет
    localStorage.setItem(STORAGE_KEYS.LAST_PRESET, preset.key);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1201] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
        <div className="relative w-full max-w-md mx-4 bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-light-border/20 dark:border-dark-border/20">
          <div>
            <h3 className="text-xl font-bold text-light-fg dark:text-dark-fg">
              Настройка стиля графика
            </h3>
            <p className="text-sm text-light-fg-secondary dark:text-dark-nav-inactive mt-1">
              Выберите цветовую схему или задайте свои цвета
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

        {/* Пресеты */}
        <div className="p-6 space-y-3">
          {PRESETS.map(preset => (
            <div
              key={preset.key}
              onClick={() => handlePresetSelect(preset)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selected.up === preset.up && selected.down === preset.down && !custom
                  ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10 shadow-md'
                  : 'border-light-border dark:border-dark-border hover:border-light-accent/40 dark:hover:border-dark-accent/40 hover:bg-light-bg dark:hover:bg-dark-bg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {preset.icon.map((ic, i) => (
                      <span 
                        key={i} 
                        className="w-5 h-5 rounded-full border border-light-border dark:border-dark-border" 
                        style={{ background: ic.color }} 
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm text-light-fg dark:text-dark-fg">
                    {preset.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lastPreset === preset.key && (
                    <span className="text-xs text-light-accent dark:text-dark-accent bg-light-accent/20 dark:bg-dark-accent/20 px-2 py-1 rounded">
                      Последний
                    </span>
                  )}
                  {selected.up === preset.up && selected.down === preset.down && !custom && (
                    <div className="w-5 h-5 bg-light-accent dark:bg-dark-accent rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кастомные цвета */}
        <div className="px-6 pb-3">
          <div className="bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg p-3 border border-light-border/30 dark:border-dark-border/30">
            <div className="text-sm font-medium text-light-fg-secondary dark:text-dark-nav-inactive mb-2">
              Свои цвета
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full border-2 border-light-accent dark:border-dark-accent shadow-sm transition-all hover:scale-105"
                  style={{ background: selected.up }}
                  onClick={() => setShowPicker('up')}
                  aria-label="Выбрать цвет роста"
                />
                <span className="font-medium text-xs text-light-fg dark:text-dark-fg">Рост</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full border-2 border-light-accent dark:border-dark-accent shadow-sm transition-all hover:scale-105"
                  style={{ background: selected.down }}
                  onClick={() => setShowPicker('down')}
                  aria-label="Выбрать цвет падения"
                />
                <span className="font-medium text-xs text-light-fg dark:text-dark-fg">Падение</span>
              </div>
            </div>
          </div>
        </div>

        {/* Предпросмотр */}
        <div className="px-6 pb-3">
          <div className="bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg p-3 border border-light-border/30 dark:border-dark-border/30">
            <div className="text-sm font-medium text-light-fg-secondary dark:text-dark-nav-inactive mb-2">
              Предпросмотр
            </div>
            <ChartPreview candles={randomCandles(selected.up, selected.down)} />
          </div>
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
            onClick={() => handleConfirm(selected)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-white bg-light-accent dark:bg-dark-accent hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 ${
              (selected.up === current.up && selected.down === current.down && !custom) 
                ? 'opacity-60 cursor-not-allowed' 
                : ''
            }`}
            disabled={selected.up === current.up && selected.down === current.down && !custom}
          >
            Сохранить
          </button>
        </div>

      </div>
    </div>
    
    {/* Отдельный модал для выбора цвета */}
    {showPicker && (
      <div className="fixed inset-0 z-[1202] flex items-center justify-center bg-black/60" onClick={() => setShowPicker(null)}>
        <ModernColorPicker
          color={showPicker === 'up' ? selected.up : selected.down}
          onChange={color => {
            if (showPicker === 'up') {
              setSelected(s => ({ ...s, up: color }));
            } else {
              setSelected(s => ({ ...s, down: color }));
            }
            setCustom(true);
          }}
          onClose={() => setShowPicker(null)}
        />
      </div>
    )}
    </>
  );
};

// SVG предпросмотр свечного графика
const ChartPreview = ({ candles }: { candles: { open: number; close: number; high: number; low: number; color: string; idx: number }[] }) => {
  const w = 220, h = 60, pad = 8;
  const min = Math.min(...candles.map(c => c.low));
  const max = Math.max(...candles.map(c => c.high));
  const scaleY = (v: number) => h - pad - ((v - min) / (max - min + 1e-6)) * (h - pad * 2);
  
  return (
    <svg width={w} height={h} style={{ display: 'block', margin: '0 auto', background: 'none' }}>
      {candles.map((c, i) => {
        const x = pad + i * ((w - pad * 2) / candles.length);
        return (
          <g key={i}>
            {/* Тень */}
            <rect 
              x={x - 1.1} 
              y={scaleY(c.high)} 
              width={2.2} 
              height={scaleY(c.low) - scaleY(c.high)} 
              rx={1} 
              fill={c.color + '99'} 
            />
            {/* Тело */}
            <rect 
              x={x - 4} 
              y={scaleY(Math.max(c.open, c.close))} 
              width={8} 
              height={Math.max(2, Math.abs(scaleY(c.open) - scaleY(c.close)))} 
              rx={2} 
              fill={c.color} 
            />
          </g>
        );
      })}
    </svg>
  );
};

export default ModalChartStyle; 