import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

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
    lightLogo.src = "/src/image/wolf_logo.svg";
    darkLogo.src = "/src/image/wolf_logo_for_black.png";
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

  // --- AUTH LOGIC ---
  const [isAuth, setIsAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("accessToken"));
  }, []);

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
    setIsAuth(false);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-30 flex items-center justify-between px-6 py-2 min-h-12 
          transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]
          ${
            headerVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-[60px] opacity-0"
          }
          ${
            scrolled
              ? "bg-white/95 dark:bg-dark-bg/95 shadow-lg backdrop-blur-md"
              : "bg-transparent"
          }`}
      >
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
              src="/src/image/wolf_logo.svg"
              alt="logo"
              className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                theme === "light" ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Темный логотип */}
            <img
              src="/src/image/wolf_logo_for_black.png"
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

        <nav className="flex gap-1">
          <button
            onClick={() => handleNavClick("main")}
            className={`text-sm font-bold py-1.5 px-4 rounded-full border-none outline-none cursor-pointer transition-all duration-200
              ${
                isMain && activeSection === "main"
                  ? "bg-light-nav-active dark:bg-dark-nav-active text-light-nav-text dark:text-dark-nav-text scale-105 shadow-[0_2px_8px_rgba(197,107,98,0.33)] dark:shadow-[0_2px_8px_rgba(129,199,132,0.33)]"
                  : "bg-transparent text-light-fg/80 dark:text-dark-nav-inactive hover:scale-105"
              }`}
          >
            Главная
          </button>
          {NAV.filter((section) => section.id !== "main").map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`text-sm font-bold py-1.5 px-4 rounded-full border-none outline-none cursor-pointer transition-all duration-200
                ${
                  isMain && activeSection === section.id
                    ? "bg-light-nav-active dark:bg-dark-nav-active text-light-nav-text dark:text-dark-nav-text scale-105 shadow-[0_2px_8px_rgba(197,107,98,0.33)] dark:shadow-[0_2px_8px_rgba(129,199,132,0.33)]"
                    : "bg-transparent text-light-fg/80 dark:text-dark-nav-inactive hover:scale-105"
                }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

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
            className="bg-transparent border-none cursor-pointer p-1 ml-0 flex items-center hover:scale-110 transition-transform"
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
              className="py-1.5 px-4 bg-light-accent dark:bg-dark-accent text-light-nav-text dark:text-dark-nav-text rounded-full font-bold text-sm border-none cursor-pointer shadow-[0_2px_8px_rgba(197,107,98,0.33)] dark:shadow-[0_2px_8px_rgba(129,199,132,0.33)] hover:scale-105 transition-transform"
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
                <svg
                  className="w-6 h-6 text-light-fg dark:text-dark-fg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card shadow-lg rounded-lg z-50 border border-light-border dark:border-dark-border transition-all duration-200 origin-top-right animate-profile-menu">
                  <button
                    className="w-full text-left px-4 py-2 rounded-md transition-all duration-200 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent active:bg-light-accent/20 dark:active:bg-dark-accent/20 hover:pl-6"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/portfolio");
                    }}
                  >
                    Профиль
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded-md transition-all duration-200 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent active:bg-light-accent/20 dark:active:bg-dark-accent/20 hover:pl-6"
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
      className={`w-10 h-6 flex items-center rounded-full p-0.5 ml-2 cursor-pointer transition-all duration-200 border-2
        ${
          theme === "dark"
            ? "bg-dark-fg border-dark-accent"
            : "bg-light-bg border-light-accent"
        }`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Сменить тему"
    >
      <span
        className={`w-4 h-4 rounded-full transition-all duration-300
          ${theme === "dark" ? "bg-dark-border ml-4" : "bg-light-border ml-0"}`}
      />
    </button>
  );
}
