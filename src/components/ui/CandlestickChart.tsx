import React from 'react';

// Мок-данные для свечей (open, close, high, low)
const candles = [
  { x: 0, open: 80, close: 60, high: 50, low: 90 },   // green
  { x: 1, open: 60, close: 100, high: 110, low: 55 }, // red
  { x: 2, open: 100, close: 70, high: 120, low: 65 }, // green
  { x: 3, open: 70, close: 120, high: 130, low: 60 }, // red
  { x: 4, open: 120, close: 100, high: 140, low: 95 }, // green
  { x: 5, open: 100, close: 110, high: 115, low: 90 }, // green
  { x: 6, open: 110, close: 80, high: 120, low: 75 }, // red
  { x: 7, open: 80, close: 60, high: 90, low: 55 },   // green
  { x: 8, open: 60, close: 90, high: 95, low: 50 },   // red
];

const WIDTH = 900;
const HEIGHT = 520;
const PADDING = 40;
const CANDLE_WIDTH = 18;
const CANDLE_GAP = 10;
const BASE_X = PADDING + 4;

type CandlestickChartProps = {
  data?: any[];
};

export default function CandlestickChart({ data }: CandlestickChartProps) {
  // если data передан — использовать его, иначе старое поведение
  const candlesToRender = data || candles;

  return (
    <div className="w-full h-full bg-light-card dark:bg-dark-card rounded-xl p-2">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="max-w-full max-h-full"
      >
        {/* Фон */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} className="fill-light-card dark:fill-dark-card" />
        {/* Горизонтальные линии */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={'h' + i}
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={PADDING + i * ((HEIGHT - 2 * PADDING) / 4)}
            y2={PADDING + i * ((HEIGHT - 2 * PADDING) / 4)}
            className="stroke-light-border/30 dark:stroke-dark-border/30"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}
        {/* Вертикальные линии */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <line
            key={'v' + i}
            y1={PADDING}
            y2={HEIGHT - PADDING}
            x1={PADDING + i * ((WIDTH - 2 * PADDING) / 8)}
            x2={PADDING + i * ((WIDTH - 2 * PADDING) / 8)}
            className="stroke-light-border/30 dark:stroke-dark-border/30"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}
        {/* Оси */}
        <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} className="stroke-light-border/20 dark:stroke-dark-border/20" strokeWidth="1" />
        <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} className="stroke-light-border/20 dark:stroke-dark-border/20" strokeWidth="1" />
        {/* Деления по Y (цена) */}
        {[0, 1, 2, 3, 4].map(i => (
          <text
            key={'ytick' + i}
            x={8}
            y={PADDING + i * ((HEIGHT - 2 * PADDING) / 4) + 4}
            className="fill-light-fg/60 dark:fill-dark-fg/60 text-xs select-none"
            textAnchor="start"
          >
            {/* Здесь можно вывести значение цены, но пока просто индекс */}
            {i === 0 ? 'max' : i === 4 ? 'min' : ''}
          </text>
        ))}
        {/* Деления по X (индекс/время) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <text
            key={'xtick' + i}
            x={PADDING + i * ((WIDTH - 2 * PADDING) / 8)}
            y={HEIGHT - 8}
            className="fill-light-fg/60 dark:fill-dark-fg/60 text-xs select-none"
            textAnchor="middle"
          >
            {i === 0 ? 'start' : i === 8 ? 'end' : ''}
          </text>
        ))}
        {/* Свечи */}
        {candlesToRender.map((c, i) => {
          const x = BASE_X + i * (CANDLE_WIDTH + CANDLE_GAP);
          const isGreen = c.close < c.open;
          const color = isGreen ? 'var(--tw-colors-light-success)' : 'var(--tw-colors-light-error)';
          const darkColor = isGreen ? 'var(--tw-colors-dark-accent)' : 'var(--tw-colors-error)';
          return (
            <g key={i}>
              {/* Тень */}
              <line
                x1={x + CANDLE_WIDTH / 2}
                x2={x + CANDLE_WIDTH / 2}
                y1={PADDING + c.high}
                y2={PADDING + c.low}
                stroke={color}
                strokeWidth={3}
                opacity={0.6}
                className="dark:stroke-[var(--tw-colors-dark-accent)] dark:opacity-80"
              />
              {/* Тело свечи */}
              <rect
                x={x}
                y={PADDING + Math.min(c.open, c.close)}
                width={CANDLE_WIDTH}
                height={Math.abs(c.close - c.open) || 4}
                rx={2}
                fill={color}
                className="dark:fill-[var(--tw-colors-dark-accent)] dark:opacity-90"
                opacity={0.95}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
