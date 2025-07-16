import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import currencyCodes from "currency-codes";

type CurrencyRatesProps = {
  compact?: boolean;
  className?: string;
};

export default function CurrencyRates({
  compact = false,
  className = "",
}: CurrencyRatesProps) {
  // Состояние для курсов валют
  const [rates, setRates] = useState<{ [code: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Функция для получения курсов валют
  const fetchRates = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.result === "success" && data.rates) {
          setRates(data.rates);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Загружаем курсы при монтировании
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <CurrencyRatesCard
      rates={rates}
      loading={loading}
      error={error}
      onRefresh={fetchRates}
      compact={compact}
      className={className}
    />
  );
}

type CurrencyRatesCardProps = {
  rates: { [code: string]: number };
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
  compact?: boolean;
  className?: string;
};

function CurrencyRatesCard({
  rates,
  loading,
  error,
  onRefresh,
  compact = false,
  className = "",
}: CurrencyRatesCardProps) {
  const [search, setSearch] = useState("");
  const [allCodes, setAllCodes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Топ популярных валют (для компактного режима меньше)
  const popular = compact
    ? ["USD", "EUR", "CNY"]
    : ["USD", "EUR", "CNY", "GBP", "JPY"];

  // Получить название валюты по коду
  const getCurrencyName = (code: string) => {
    const entry = currencyCodes.code(code);
    return entry ? entry.currency : code;
  };

  useEffect(() => {
    setAllCodes(rates ? Object.keys(rates) : []);
  }, [rates]);

  // Функция для обновления позиции dropdown
  const updateDropdownPos = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Открытие dropdown и обновление позиции
  const openDropdown = () => {
    setShowDropdown(true);
    setTimeout(updateDropdownPos, 0);
  };

  // Обновлять позицию при ресайзе/скролле
  useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPos();
    const handle = () => updateDropdownPos();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [showDropdown, updateDropdownPos]);

  // Закрытие по клику вне и по Esc
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDropdown]);

  // Фильтрация по поиску (по коду и названию)
  const filtered = useMemo(() => {
    if (!search) return [];
    const s = search.trim().toUpperCase();
    return allCodes.filter((code) => {
      const name = getCurrencyName(code).toUpperCase();
      return code.includes(s) || name.includes(s);
    });
  }, [search, allCodes]);

  // Функция для получения курса X/RUB
  const getRateToRUB = (code: string) => {
    if (!rates[code] || !rates["RUB"]) return "-";
    return (rates["RUB"] / rates[code]).toFixed(4);
  };

  if (compact) {
    // Компактный режим для главной страницы
    return (
      <div className={`space-y-3 ${className}`}>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin w-6 h-6 border-2 border-light-accent dark:border-dark-accent border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm py-4">
            <div>Ошибка загрузки</div>
            <button onClick={onRefresh} className="mt-2 text-xs underline">
              Повторить
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {popular.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between p-3 rounded-lg bg-light-bg/50 dark:bg-dark-bg/50 hover:bg-light-accent/5 dark:hover:bg-dark-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-light-accent dark:text-dark-accent">
                      {code[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-light-fg dark:text-dark-fg">
                      {code}
                    </div>
                    <div className="text-sm text-light-fg/60 dark:text-dark-brown">
                      {getCurrencyName(code)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-light-fg dark:text-dark-fg">
                    ₽{getRateToRUB(code)}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center text-sm text-light-fg/60 dark:text-dark-brown mt-3 pt-2 border-t border-light-border/30 dark:border-dark-border/30">
              Курс за 1 единицу валюты
            </div>
          </div>
        )}
      </div>
    );
  }

  // Полный режим для портфолио
  return (
    <div
      className={`flex flex-col min-w-[260px] max-w-sm w-full p-2.5 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-light-border dark:border-dark-border ${className}`}
    >
      {loading ? (
        <div className="text-light-fg/80 dark:text-dark-brown text-[15px] my-3">
          Загрузка...
        </div>
      ) : error ? (
        <div className="text-red-500 text-[15px] my-3 flex items-center gap-2">
          Ошибка загрузки
          <button onClick={onRefresh} className="ml-2 text-xs underline">
            Повторить
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Левая колонка: топ-5 валют */}
          <div className="flex-1 flex flex-col gap-1 justify-start">
            {popular.map((code) => (
              <div
                key={code}
                className="flex items-center gap-2 text-[15px] font-semibold text-light-fg dark:text-dark-fg"
              >
                <span className="min-w-[60px]">{code}</span>
                <span className="text-light-accent dark:text-dark-accent font-bold">
                  {getRateToRUB(code)}
                </span>
                <span className="text-light-fg/60 dark:text-dark-brown text-xs ml-2">
                  {getCurrencyName(code)}
                </span>
              </div>
            ))}
          </div>
          {/* Правая колонка: поиск и результаты */}
          <div className="flex-1 flex flex-col gap-1 justify-start">
            <div className="w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск по коду или названию валюты (например, USD, евро)"
                value={search}
                onFocus={openDropdown}
                onChange={(e) => {
                  setSearch(e.target.value);
                  openDropdown();
                }}
                className="w-full px-2 py-1 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 text-[14px]"
              />
              {search &&
                showDropdown &&
                ReactDOM.createPortal(
                  <div
                    ref={dropdownRef}
                    style={{
                      position: "absolute",
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      minWidth: 260,
                      zIndex: 9999,
                    }}
                    className="currency-dropdown-scrollbar bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded shadow-lg max-h-72 overflow-y-auto transition-all duration-150 overflow-x-hidden"
                  >
                    {filtered.length === 0 ? (
                      <div className="text-light-fg/60 dark:text-dark-brown text-[13px] px-3 py-2">
                        Валюта не найдена
                      </div>
                    ) : (
                      filtered.slice(0, 20).map((code) => (
                        <div
                          key={code}
                          className="flex items-center gap-1 text-[14px] text-light-fg dark:text-dark-fg px-2.5 py-1.5 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition cursor-pointer"
                        >
                          <span className="min-w-[48px] mr-1">{code}</span>
                          <span className="text-light-accent dark:text-dark-accent font-bold mr-1">
                            {getRateToRUB(code)}
                          </span>
                          <span
                            className="block w-full text-light-fg/60 dark:text-dark-brown text-xs leading-tight truncate"
                            style={{ maxWidth: "90px" }}
                            title={getCurrencyName(code)}
                          >
                            {getCurrencyName(code)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
      )}
      <div className="text-light-fg/80 dark:text-dark-brown text-[13px] mt-2">
        Курс за 1 единицу валюты
      </div>
    </div>
  );
}
