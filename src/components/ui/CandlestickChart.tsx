import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import type {
  IChartApi,
  CandlestickSeriesOptions,
  UTCTimestamp,
  Time,
} from "lightweight-charts";
import { useTheme } from "../../context/ThemeContext";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaUndo,
} from "react-icons/fa";

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

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--light-card, #f8f9fa)",
          borderRadius: "16px",
        }}
      >
        <p style={{ color: "var(--light-fg, #333)", fontSize: "18px" }}>
          Загрузка данных графика...
        </p>
      </div>
    );
  }

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const { theme } = useTheme();
  const [_, setRerender] = useState(0); // для форс-обновления
  const [cursor, setCursor] = useState<"crosshair" | "pointer" | "grabbing">(
    "crosshair"
  );
  const isMouseDown = useRef(false);
  const [crosshair, setCrosshair] = useState<{
    x: number;
    y: number;
    price: number | null;
    time: string | null;
  } | null>(null);

  // Управление графиком
  const scrollChart = (delta: number) => {
    if (chartRef.current) {
      const ts = chartRef.current.timeScale();
      ts.scrollToPosition(ts.getVisibleLogicalRange()?.from! - delta, false);
    }
  };
  const zoomChart = (inOut: "in" | "out") => {
    if (chartRef.current) {
      const ts = chartRef.current.timeScale();
      const range = ts.getVisibleLogicalRange();
      if (range) {
        const center = (range.from + range.to) / 2;
        const size = range.to - range.from;
        const newSize = inOut === "in" ? size * 0.7 : size * 1.3;
        ts.setVisibleLogicalRange({
          from: center - newSize / 2,
          to: center + newSize / 2,
        });
      }
    }
  };
  const resetChart = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // Обработчики для overlay
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Получаем координаты времени
    const series = seriesRef.current;
    if (series) {
      const time = chartRef.current.timeScale().coordinateToTime(x);
      // Проверяем, есть ли свеча под курсором (по времени)
      const candle = Array.isArray(series.data)
        ? series.data.find((c: any) => c.time === time)
        : null;
      if (candle) {
        setCursor("pointer");
      } else {
        setCursor(isMouseDown.current ? "grabbing" : "crosshair");
      }
    }
  };
  const handleMouseLeave = () => {
    setCursor("crosshair");
  };
  const handleMouseDown = () => {
    isMouseDown.current = true;
    setCursor("grabbing");
  };
  const handleMouseUp = () => {
    isMouseDown.current = false;
    setCursor("crosshair");
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    // Цвета для премиального стиля
    const isDark = theme === "dark";
    const chartBg = isDark ? "#1c1b1b" : "#fff"; // Tailwind dark-bg
    const textColor = isDark ? "#e5e7ef" : "#23263a";
    const gridColor = isDark ? "#23263a" : "#e5e7ef";
    const upColor = isDark ? "#22e57a" : "#22c55e";
    const downColor = isDark ? "#ff4b6b" : "#ef4444";
    const wickColor = isDark ? "#e5e7ef" : "#23263a";
    const borderColor = isDark ? "#222" : "#e5e7ef";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
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
        secondsVisible: true, // теперь показываем и время
        borderColor: gridColor,
        rightOffset: 2,
        barSpacing: 14,
        // tickMarkLabelPadding: 16, // удалено, не поддерживается
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: { top: 0.12, bottom: 0.18 }, // увеличил bottom
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#888c", // заметный серый с alpha
          width: 2,
          style: 2, // пунктир
          visible: true,
          labelVisible: false,
        },
        horzLine: {
          color: "#888c", // заметный серый с alpha
          width: 2,
          style: 2, // пунктир
          visible: true,
          labelVisible: true,
        },
      },
      // watermark: { visible: false }, // watermark/лого TradingView полностью отключён и не появится
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
    setRerender((x) => x + 1); // чтобы панель кнопок не "отставала" при ресете

    // --- Курсор ---
    let isMouseDown = false;
    const container = chartContainerRef.current;
    if (container) container.style.cursor = "crosshair";
    // crosshairMove: pointer если есть свеча, иначе crosshair
    const handleCrosshairMove = (param: any) => {
      if (!container) return;
      if (isMouseDown) return; // если тянем — grabbing
      if (param && param.seriesPrices && param.seriesPrices.size > 0) {
        container.style.cursor = "pointer";
      } else {
        container.style.cursor = "crosshair";
      }
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);
    // mouse down/up: grabbing
    const handleMouseDown = () => {
      isMouseDown = true;
      if (container) container.style.cursor = "grabbing";
    };
    const handleMouseUp = () => {
      isMouseDown = false;
      if (container) container.style.cursor = "crosshair";
    };
    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
    }

    // --- Кастомные label-ы ---
    const handleCrosshairMoveLabels = (param: any) => {
      if (!param || !param.point) {
        setCrosshair(null);
        return;
      }
      const { x, y } = param.point;
      let price = null;
      let time = null;
      if (param.seriesPrices && param.seriesPrices.size > 0) {
        price = Number(Array.from(param.seriesPrices.values())[0]);
      }
      if (param.time) {
        // param.time может быть number (timestamp) или string (YYYY-MM-DD)
        if (typeof param.time === "number") {
          const d = new Date(param.time * 1000);
          const dateStr = d.toLocaleDateString("ru-RU");
          const utcTime = d.toISOString().slice(11, 19); // HH:MM:SS UTC
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
      setCrosshair({ x, y, price, time });
    };
    chart.subscribeCrosshairMove(handleCrosshairMoveLabels);
    return () => {
      chart.remove();
      chartRef.current = null;
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.unsubscribeCrosshairMove(handleCrosshairMoveLabels);
      if (container) {
        container.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [data, theme]);

  // Стили для плавающей панели
  const isDark = theme === "dark";
  const upColor = isDark ? "#22e57a" : "#22c55e";
  const downColor = isDark ? "#ff4b6b" : "#ef4444";
  const panelBg = isDark ? "rgba(30,30,30,0.95)" : "rgba(255,255,255,0.95)";
  const panelBorder = isDark ? "#333" : "#e5e7ef";
  const iconColor = isDark ? "#e5e7ef" : "#23263a";
  const btnHover = isDark ? "#444" : "#f3f4f6";

  // --- Hover-появление панели ---
  const [showPanel, setShowPanel] = useState(false);

  // Определяем цвет последней цены
  const lastPrice = data.length > 0 ? data[data.length - 1].close : null;
  const lastPriceColor =
    lastPrice !== null
      ? lastPrice > data[data.length - 2]?.close
        ? upColor
        : downColor
      : "#888";

  return (
    <div style={{ width: "100%", position: "relative", height: "100%" }}>
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 8px 32px 0 #0002",
          borderRadius: 24,
          background: theme === "dark" ? "#000" : "#fff",
          transition: "background 0.3s",
          position: "relative",
          overflow: "visible",
        }}
        className="rounded-2xl"
        onMouseMove={(e) => {
          // Если курсор в нижней 80px области графика — показываем панель
          const rect = e.currentTarget.getBoundingClientRect();
          if (e.clientY > rect.bottom - 80) setShowPanel(true);
          else setShowPanel(false);
        }}
        onMouseLeave={() => setShowPanel(false)}
      />
      {/* Кастомные label-ы для кроссхайра (как на TradingView) */}
      {crosshair && crosshair.price !== null && (
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
            boxShadow: "0 2px 8px #0005",
          }}
        >
          {crosshair.price}
        </div>
      )}
      {crosshair && crosshair.time && (
        <div
          style={{
            position: "absolute",
            left: Math.max(16, Math.min(984, crosshair.x - 60)),
            bottom: 8,
            background: "#222",
            color: "#fff",
            borderRadius: 6,
            padding: "3px 14px",
            fontSize: 15,
            fontWeight: 700,
            pointerEvents: "none",
            zIndex: 20,
            boxShadow: "0 2px 8px #0005",
          }}
        >
          {crosshair.time}
        </div>
      )}
      {/* Плавающая панель управления */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 56, // поднято выше
          transform: "translateX(-50%)",
          background: panelBg,
          borderRadius: 12,
          boxShadow: "0 2px 12px 0 #0002",
          border: `1.5px solid ${panelBorder}`,
          display: "flex",
          gap: 4,
          padding: "4px 10px",
          zIndex: 10,
          opacity: showPanel ? 1 : 0,
          pointerEvents: showPanel ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
        onMouseEnter={() => setShowPanel(true)}
        onMouseLeave={() => setShowPanel(false)}
      >
        <button
          onClick={() => zoomChart("out")}
          style={{
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            color: iconColor,
            fontSize: 18,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = btnHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          <FaMinus />
        </button>
        <button
          onClick={() => zoomChart("in")}
          style={{
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            color: iconColor,
            fontSize: 18,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = btnHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          <FaPlus />
        </button>
        <button
          onClick={() => scrollChart(20)}
          style={{
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            color: iconColor,
            fontSize: 18,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = btnHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => scrollChart(-20)}
          style={{
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            color: iconColor,
            fontSize: 18,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = btnHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          <FaChevronRight />
        </button>
        <button
          onClick={resetChart}
          style={{
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            color: iconColor,
            fontSize: 18,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = btnHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
        >
          <FaUndo />
        </button>
      </div>
    </div>
  );
};

export default CandlestickChart;
