import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import InstrumentFilters from "./InstrumentFilters";
import InstrumentsList from "./InstrumentsList";
import { useInstruments } from "../../hooks/useInstruments";
import type { Instrument } from "../../hooks/useInstruments";
import btcIcon from "../../image/crypto/bitcoin.svg";
import ethIcon from "../../image/crypto/ethereum.svg";
import usdtIcon from "../../image/crypto/usdt.svg";
import tonIcon from "../../image/crypto/ton.svg";
import { useInstrumentImages } from "../../hooks/useInstrumentImages";
import { useInstrumentMarketData } from "../../hooks/useInstrumentMarketData";
import { useNavigate } from "react-router-dom";
import { useInstrumentsProfitability } from '../../hooks/useInstrumentProfitability';

const TYPE_FILTERS = [
  { label: "Все", value: "all" },
  { label: "Криптовалюта", value: "crypto" },
  { label: "Стейблкоин", value: "stablecoin" },
];

const SORT_OPTIONS = [
  { label: "По алфавиту (A-Z)", value: "alpha-asc" },
  { label: "По алфавиту (Z-A)", value: "alpha-desc" },
  { label: "По цене (сначала дешёвые)", value: "price-asc" },
  { label: "По цене (сначала дорогие)", value: "price-desc" },
  { label: "По доходности (сначала прибыльные)", value: "profit-desc" },
  { label: "По доходности (сначала убыточные)", value: "profit-asc" },
];

interface FloatingCurrenciesBackgroundProps {
  instruments: Instrument[];
  images: Record<number, string>;
  loadingImages: boolean;
}

function FloatingCurrenciesBackground({
  instruments,
  images,
  loadingImages,
}: FloatingCurrenciesBackgroundProps) {
  // Статичные иконки как fallback
  const fallbackIcons = [btcIcon, ethIcon, usdtIcon, tonIcon];

  // Создаем массив иконок для анимации
  const icons = useMemo(() => {
    let iconsToUse: string[] = [];

    if (!loadingImages && instruments.length > 0) {
      // Используем реальные логотипы инструментов
      iconsToUse = instruments
        .map((instrument) => images[instrument.instrumentId])
        .filter((image) => image) // фильтруем только те, у которых есть изображения
        .slice(0, 12); // ограничиваем количество плавающих элементов

      // Если реальных логотипов мало, добавляем fallback иконки
      while (iconsToUse.length < 6 && iconsToUse.length < instruments.length) {
        iconsToUse.push(
          fallbackIcons[iconsToUse.length % fallbackIcons.length]
        );
      }
    }

    // Если реальных данных нет, используем fallback иконки
    if (iconsToUse.length === 0) {
      iconsToUse = [...fallbackIcons];
    }

    // Создаем случайные позиции и параметры анимации для каждой иконки
    return iconsToUse.map((src, index) => {
      const positions = [
        { top: "10%", left: "8%" },
        { top: "30%", left: "80%" },
        { top: "65%", left: "15%" },
        { top: "75%", left: "70%" },
        { top: "55%", left: "55%" },
        { top: "20%", left: "60%" },
        { top: "45%", left: "25%" },
        { top: "80%", left: "40%" },
        { top: "15%", left: "90%" },
        { top: "90%", left: "10%" },
        { top: "35%", left: "85%" },
        { top: "60%", left: "5%" },
      ];

      const position = positions[index % positions.length];

      return {
        src,
        size: 36 + (index % 3) * 12, // размеры от 36 до 60
        top: position.top,
        left: position.left,
        duration: 18 + (index % 8), // длительность от 18 до 25 секунд
        delay: index * 0.5, // задержка для разнообразия
        opacity: 0.1 + (index % 4) * 0.02, // прозрачность от 0.10 до 0.16
      };
    });
  }, [instruments, images, loadingImages]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {icons.map((icon, i) => (
        <img
          key={`${icon.src}-${i}`}
          src={icon.src}
          alt="currency"
          style={{
            position: "absolute",
            top: icon.top,
            left: icon.left,
            width: icon.size,
            height: icon.size,
            opacity: icon.opacity,
            filter: "blur(0.5px) drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
            animation: `floatY${i} ${icon.duration}s ease-in-out infinite alternate`,
            animationDelay: `${icon.delay}s`,
            transition: "opacity 0.5s, transform 0.3s",
            objectFit: "contain",
          }}
        />
      ))}
      <style>{`
        ${icons
          .map(
            (icon, i) => `
          @keyframes floatY${i} {
            0% { 
              transform: translateY(0px) scale(1) rotate(0deg); 
            }
            100% { 
              transform: translateY(-40px) scale(1.08) rotate(${
                i % 2 === 0 ? 8 : -8
              }deg); 
            }
          }
        `
          )
          .join("")}
      `}</style>
    </div>
  );
}

export default function InstrumentsPage() {
  const { instruments, loading, error } = useInstruments();
  const ids = useMemo(
    () =>
      [...new Set(instruments.map((inst) => inst.instrumentId))].sort(
        (a, b) => a - b
      ),
    [instruments]
  );
  const { images, loading: loadingImages } = useInstrumentImages(ids);
  const { prices, loading: loadingPrices } = useInstrumentMarketData(ids);
  const { data: profitability, loading: loadingProfit } = useInstrumentsProfitability(ids, '1d');
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("alpha-asc");
  const [show, setShow] = useState(false);
  const [cardsVisible, setCardsVisible] = useState<number>(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Показываем страницу только при первом рендере
  useEffect(() => {
    setShow(true);
  }, []);

  // Мемоизированная фильтрация и сортировка
  const filtered = useMemo(() => {
    let result = instruments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.ticker.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
    result = result.slice().sort((a, b) => {
      if (sort === "alpha-asc") return a.title.localeCompare(b.title);
      if (sort === "alpha-desc") return b.title.localeCompare(a.title);
      if (sort === "price-asc") return (prices[a.instrumentId] ?? 0) - (prices[b.instrumentId] ?? 0);
      if (sort === "price-desc") return (prices[b.instrumentId] ?? 0) - (prices[a.instrumentId] ?? 0);
      if (sort === "profit-asc") return (profitability?.[a.instrumentId] ?? 0) - (profitability?.[b.instrumentId] ?? 0);
      if (sort === "profit-desc") return (profitability?.[b.instrumentId] ?? 0) - (profitability?.[a.instrumentId] ?? 0);
      return 0;
    });
    return result;
  }, [instruments, search, sort, prices, profitability]);

  // Анимация карточек только при изменении фильтра/сортировки/поиска/инструментов
  useEffect(() => {
    if (filtered.length > 0) {
      setCardsVisible(0);
      filtered.forEach((_, i) => {
        setTimeout(
          () => setCardsVisible((v) => Math.max(v, i + 1)),
          50 + i * 30
        );
      });
    }
  }, [filter, sort, search, instruments, filtered]);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg font-sans">
      <FloatingCurrenciesBackground
        instruments={instruments}
        images={images}
        loadingImages={loadingImages}
      />
      <Header
        scrolled={false}
        NAV={[]}
        setSearchPos={() => {}}
        activeSection={""}
        headerVisible={true}
        setSearchOpen={() => {}}
        searchOpen={false}
      />
      <main
        className={`flex-1 w-full max-w-3xl mx-auto px-4 py-16 transition-all duration-700 ease-in-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } transform`}
      >
        <h1 className="text-4xl font-extrabold text-light-accent dark:text-dark-accent mb-10 text-center tracking-wide">
          Доступные инструменты
        </h1>
        <InstrumentFilters
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          typeOptions={TYPE_FILTERS}
          sortOptions={SORT_OPTIONS}
        />
        {/* Список инструментов */}
        {loading ? (
          <div className="text-center py-8">Загрузка инструментов...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <div>Ошибка загрузки инструментов!</div>
            <div className="mt-2 text-sm text-red-400 break-all">{error}</div>
            <div className="mt-2 text-xs text-light-fg/60 dark:text-dark-fg/60">
              Проверьте, что вы авторизованы и backend доступен.
              <br />
              Если ошибка 401 — попробуйте перелогиниться.
              <br />
              Если ошибка 500 — проверьте backend.
            </div>
          </div>
        ) : instruments.length === 0 ? (
          <div className="text-center text-lg opacity-60 py-12">
            Нет доступных инструментов. Проверьте соединение с сервером или
            обратитесь к администратору.
          </div>
        ) : (
          <InstrumentsList
            instruments={filtered}
            cardsVisible={cardsVisible}
            images={images}
            loadingImages={loadingImages || loadingPrices}
            prices={prices}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
