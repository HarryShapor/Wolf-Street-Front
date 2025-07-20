import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import type {
  IChartApi,
  CandlestickSeriesOptions,
  UTCTimestamp,
  Time,
} from "lightweight-charts";
import { useTheme } from "../../context/ThemeContext";
import { FaPlus, FaMinus, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export type Candle = {
  time: UTCTimestamp | Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface CandlestickChartProps {
  data?: Candle[];
}

function getChartColors() {
  try {
    const raw = localStorage.getItem("chartColors");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.up === "string" &&
        typeof parsed.down === "string"
      ) {
        return parsed;
      }
    }
  } catch {}
  return { up: "#22d3a8", down: "#f43f5e" };
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data = [] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { theme } = useTheme();
  const [_, setRerender] = useState(0);
  const [chartColors, setChartColors] = useState(getChartColors());
  const [crosshair, setCrosshair] = useState<{
    x: number;
    y: number;
    price: number | null;
    time: string | null;
  } | null>(null);
  const [barSpacing, setBarSpacing] = useState(14);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "chartColors") setChartColors(getChartColors());
    }
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      const current = getChartColors();
      if (current.up !== chartColors.up || current.down !== chartColors.down) {
        setChartColors(current);
      }
    }, 400);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [chartColors.up, chartColors.down]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const isDark = theme === "dark";
    const chartBg = isDark ? "#1c1b1b" : "#fff";
    const textColor = isDark ? "#e5e7ef" : "#23263a";
    const gridColor = isDark ? "#23263a" : "#e5e7ef";
    const upColor = chartColors.up;
    const downColor = chartColors.down;
    const wickColor = isDark ? "#e5e7ef" : "#23263a";
    const borderColor = isDark ? "#222" : "#e5e7ef";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      autoSize: true,
      layout: {
        background: { color: chartBg },
        textColor: textColor,
        fontFamily: "Inter, Arial, sans-serif",
      },
      grid: {
        vertLines: { color: gridColor, visible: true, style: 0 },
        horzLines: { color: gridColor, visible: true, style: 0 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: gridColor,
        rightOffset: 0,
        barSpacing: 14,
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: { top: 0.05, bottom: 0.05 },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#888c",
          width: 2,
          style: 2,
          visible: true,
          labelVisible: false,
        },
        horzLine: {
          color: "#888c",
          width: 2,
          style: 2,
          visible: true,
          labelVisible: true,
        },
      },
    });

    chartRef.current = chart;
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderVisible: true,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      wickColor,
      wickVisible: true,
      borderColor,
      priceLineVisible: true,
    } as CandlestickSeriesOptions);

    seriesRef.current = candleSeries;
    candleSeries.setData(data);
    chart.timeScale().fitContent();
    setRerender((x) => x + 1);

    const container = chartContainerRef.current;
    if (container) container.style.cursor = "crosshair";

    let crosshairTimeout: number;
    const handleCrosshairMoveLabels = (param: any) => {
      clearTimeout(crosshairTimeout);
      crosshairTimeout = setTimeout(() => {
        let price = "";
        let time = "";
        let x = 0;
        let y = 0;

        if (param.point) {
          x = param.point.x;
          y = param.point.y;
        }
        if (param.seriesPrices && param.seriesPrices.size > 0) {
          const candleData = Array.from(param.seriesPrices.values())[0];
          if (
            candleData &&
            typeof candleData === "object" &&
            "close" in candleData
          ) {
            price = (candleData.close as number).toFixed(2);
          }
        }
        if (param.time) {
          if (typeof param.time === "number") {
            const d = new Date(param.time * 1000);
            const dateStr = d.toLocaleDateString("ru-RU");
            const utcTime = d.toISOString().slice(11, 19);
            const localTime = d.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            time = `${dateStr} ${utcTime} (UTC) / ${localTime} (по местному)`;
          } else {
            time = param.time;
          }
        }
        setCrosshair({ x, y, price: Number(price), time });
      }, 16);
    };

    chart.subscribeCrosshairMove(handleCrosshairMoveLabels);
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      clearTimeout(crosshairTimeout);
      chart.remove();
      chartRef.current = null;
      chart.unsubscribeCrosshairMove(handleCrosshairMoveLabels);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [theme, chartColors.up, chartColors.down]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const prevRange = timeScale.getVisibleLogicalRange();
    seriesRef.current.setData(data);
    if (prevRange) {
      timeScale.setVisibleLogicalRange(prevRange);
    }
  }, [data]);

  // Применять barSpacing к графику при изменении
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({ barSpacing });
    }
  }, [barSpacing]);

  // --- Функции управления графиком ---
  const handleZoomIn = () => {
    setBarSpacing((prev) => Math.min(prev * 1.3, 100));
  };
  const handleZoomOut = () => {
    setBarSpacing((prev) => Math.max(prev / 1.3, 2));
  };
  const handleGoToLatest = () => {
    setBarSpacing(40); // или другое подходящее значение
    setTimeout(() => {
      chartRef.current?.timeScale().scrollToRealTime();
    }, 50);
  };

  const handleScrollLeft = () => {
    if (!chartRef.current) return;
    const ts = chartRef.current.timeScale();
    const range = ts.getVisibleLogicalRange();
    if (range) {
      ts.setVisibleLogicalRange({
        from: range.from - 10,
        to: range.to - 10,
      });
    }
  };
  const handleScrollRight = () => {
    if (!chartRef.current) return;
    const ts = chartRef.current.timeScale();
    const range = ts.getVisibleLogicalRange();
    if (range) {
      ts.setVisibleLogicalRange({
        from: range.from + 10,
        to: range.to + 10,
      });
    }
  };

  return (
    <div style={{ width: "100%", position: "relative", height: "100%" }} className="group">
      {/* Всплывающие кнопки управления графиком */}
      <div className="absolute left-4 top-4 z-30 flex gap-3 rounded-xl shadow-lg p-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-auto border border-light-border/40 dark:border-dark-border/40 bg-white/20 dark:bg-dark-card/10 backdrop-blur-lg">
        <button onClick={() => chartRef.current?.timeScale().fitContent()} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-sm font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center">Сброс</button>
        <button onClick={handleGoToLatest} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-sm font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center">К последней</button>
        <button onClick={handleZoomIn} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-lg font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center"><FaPlus /></button>
        <button onClick={handleZoomOut} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-lg font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center"><FaMinus /></button>
        <button onClick={handleScrollLeft} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-lg font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center"><FaArrowLeft /></button>
        <button onClick={handleScrollRight} className="px-3 py-1.5 rounded-lg bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/60 dark:border-dark-border/60 text-light-accent dark:text-dark-accent text-lg font-bold shadow-md hover:brightness-110 hover:shadow-[0_0_8px_2px_theme('colors.light-accent')] dark:hover:shadow-[0_0_8px_2px_theme('colors.dark-accent')] transition-all duration-150 flex items-center justify-center"><FaArrowRight /></button>
      </div>
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 24,
          background: "transparent",
          position: "relative",
          overflow: "visible",
        }}
        className="rounded-2xl"
      />

      {crosshair && crosshair.price !== null && crosshair.price !== 0 && data && data.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: Math.max(16, Math.min(584, crosshair.y - 18)),
            background: "#222",
            color: "#fff",
            borderRadius: 6,
            padding: "3px 12px",
            fontSize: 15,
            fontWeight: 700,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {crosshair.price}
        </div>
      )}

      {crosshair && crosshair.time && (
        <div
          style={{
            position: "absolute",
            left: Math.max(16, Math.min(584, crosshair.x - 50)),
            bottom: 8,
            background: "#222",
            color: "#fff",
            borderRadius: 6,
            padding: "3px 12px",
            fontSize: 15,
            fontWeight: 700,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {crosshair.time}
        </div>
      )}

      {(!data || data.length === 0) && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: 24,
            zIndex: 30,
            fontSize: 20,
            color: "#888",
            fontWeight: 600,
          }}
        >
          Нет данных для выбранного инструмента/интервала
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
