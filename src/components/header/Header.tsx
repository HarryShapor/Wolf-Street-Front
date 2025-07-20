import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getUserAvatarUrl } from "../../services/AvatarService";
import { isAuthenticated } from "../../services/auth/Login";

interface HeaderProps {
  scrolled: boolean;
  NAV?: { id: string; label: string }[];
  setSearchPos: (pos: { top: number; left: number }) => void;
  activeSection: string;
  headerVisible: boolean;
  setSearchOpen: (open: boolean) => void;
  searchOpen: boolean;
}

export default function Header({
  scrolled,
  NAV = [],
  setSearchPos,
  activeSection,
  headerVisible,
  setSearchOpen,
  searchOpen,
}: HeaderProps) {
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme(); // Получаем текущую тему

  const isMain = location.pathname === "/";

  // Предзагружаем логотипы
  useEffect(() => {
    const lightLogo = new Image();
    const darkLogo = new Image();
    lightLogo.src = "/image/wolf_logo.svg";
    darkLogo.src = "/image/wolf_logo_for_black.png";
  }, []);

  const handleNavClick = (id: string) => {
    if (isMain) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
    }
  };

  // Функция для обработки клика на кнопку "Торговля"
  const handleTradeClick = () => {
    if (isAuthenticated()) {
      navigate("/trade");
    } else {
      navigate("/login");
    }
  };

  // Функция для обработки клика на кнопку "Инструменты"
  const handleInstrumentsClick = () => {
    if (isAuthenticated()) {
      navigate("/instruments");
    } else {
      navigate("/login");
    }
  };

  // --- AUTH LOGIC ---
  const [isAuth, setIsAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsAuth(isAuthenticated()); // Используем isAuthenticated() для консистентности
    // Получаем аватарку через сервис, как в ProfileSection/SettingsPanel
    if (isAuthenticated()) {
      getUserAvatarUrl().then(setAvatarUrl);
    } else {
      setAvatarUrl(null);
    }
  }, []); // только при монтировании

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem("logout", "true"); // Ставим флаг logout
    setIsAuth(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const mainButtonClass = `px-4 py-1.5 rounded-full bg-gradient-to-r from-light-accent to-light-accent/80 dark:from-dark-accent dark:to-dark-accent/80 text-white font-semibold text-sm border-none cursor-pointer shadow-sm hover:scale-105 transition-transform`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-30 flex items-center px-6 py-2 min-h-12 transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]
          ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-[60px] opacity-0"
          }
          ${
            scrolled
              ? "bg-white/95 dark:bg-dark-bg/95 shadow-lg backdrop-blur-md"
              : "bg-white dark:bg-dark-bg"
          }`}
      >
        {/* Логотип и название слева */}
        <div
          className={`flex items-center gap-3 ${
            !isMain ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={() => {
            if (!isMain) navigate("/");
          }}
        >
          <span className="text-[32px] relative inline-block w-12 h-12">
            {/* Светлый логотип */}
            <img
              src="/image/wolf_logo.svg"
              alt="logo"
              className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                theme === "light" ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Темный логотип */}
            <img
              src="/image/wolf_logo_for_black.png"
              alt="logo"
              className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                theme === "dark" ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
          <span className="text-[22px] font-extrabold text-light-accent dark:text-dark-accent tracking-tight transition-colors duration-300">
            Wolf Street
          </span>
        </div>
        {/* Центральный блок: навигация + кнопки */}
        <div className="flex-1 flex justify-center items-center gap-6">
          <nav className="flex gap-2">
            {(() => {
              const navWithMain = NAV.some((s) => s.id === "main")
                ? NAV
                : [{ id: "main", label: "Главная" }, ...NAV];
              return navWithMain.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  className={
                    isMain && activeSection === section.id
                      ? mainButtonClass
                      : "text-base font-semibold px-4 py-1.5 rounded-full transition-colors duration-200 bg-transparent text-light-fg/80 dark:text-dark-nav-inactive hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent"
                  }
                >
                  {section.label}
                </button>
              ));
            })()}
          </nav>
          {/* Кнопки Торговля/Инструменты */}
          <div className="flex gap-2">
            <button
              onClick={handleTradeClick}
              className={
                location.pathname.startsWith("/trade")
                  ? mainButtonClass
                  : "text-base font-semibold px-4 py-1.5 rounded-full transition-colors duration-200 bg-transparent text-light-fg/80 dark:text-dark-nav-inactive hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent"
              }
            >
              Торговля
            </button>
            <button
              onClick={handleInstrumentsClick}
              className={
                location.pathname.startsWith("/instruments")
                  ? mainButtonClass
                  : "text-base font-semibold px-4 py-1.5 rounded-full transition-colors duration-200 bg-transparent text-light-fg/80 dark:text-dark-nav-inactive hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent"
              }
            >
              Инструменты
            </button>
          </div>
        </div>

        {/* Actions справа (только утилиты) */}
        <div className="flex items-center gap-2">
          <button
            ref={searchBtnRef}
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                return;
              }
              setSearchOpen(true);
              if (searchBtnRef.current) {
                const rect = searchBtnRef.current.getBoundingClientRect();
                setSearchPos({ top: rect.bottom + 8, left: rect.left });
              }
            }}
            aria-label="Поиск"
            className="bg-transparent border-none cursor-pointer p-1 flex items-center hover:scale-110 transition-transform"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="stroke-light-fg dark:stroke-dark-fg opacity-70"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {/* --- AUTH BUTTONS --- */}
          {!isAuth ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1.5 rounded-full bg-light-accent/80 dark:bg-dark-accent/80 text-white font-semibold text-sm border-none cursor-pointer shadow-sm hover:scale-105 transition-transform"
            >
              Войти
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-light-card dark:bg-dark-card flex items-center justify-center border border-light-border dark:border-dark-border shadow transition-all duration-200 hover:scale-110 hover:shadow-xl"
                aria-label="Профиль"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover border border-light-border dark:border-dark-border"
                  />
                ) : null}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card shadow-lg rounded-lg z-50 border border-light-border dark:border-dark-border transition-all duration-200 origin-top-right animate-profile-menu">
                  <button
                    className="w-full text-left px-4 py-2 rounded-md transition-all duration-200 text-light-fg dark:text-dark-fg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent active:bg-light-accent/20 dark:active:bg-dark-accent/20 hover:pl-6"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/portfolio");
                    }}
                  >
                    Профиль
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded-md transition-all duration-200 text-light-fg dark:text-dark-fg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent active:bg-light-accent/20 dark:active:bg-dark-accent/20 hover:pl-6"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className={`w-12 h-6 flex items-center rounded-full p-0.5 ml-2 cursor-pointer transition-all duration-300 border-2
        ${
          theme === "dark"
            ? "bg-dark-fg border-dark-accent"
            : "bg-light-bg border-light-accent"
        }`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Сменить тему"
    >
      <span
        className={`w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center
          ${theme === "dark" ? "bg-dark-border ml-5" : "bg-light-border ml-0"}`}
      >
        {theme === "dark" ? (
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
          </svg>
        )}
      </span>
    </button>
  );
}
