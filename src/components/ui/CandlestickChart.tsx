import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import type {
  IChartApi,
  CandlestickSeriesOptions,
  UTCTimestamp,
  Time,
} from "lightweight-charts";
import { useTheme } from "../../context/ThemeContext";

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
        leftOffset: 0,
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

    let crosshairTimeout: NodeJS.Timeout;
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
            price = candleData.close.toFixed(2);
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
        setCrosshair({ x, y, price, time });
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

  return (
    <div style={{ width: "100%", position: "relative", height: "100%" }}>
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
