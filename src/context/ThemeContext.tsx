import { createContext, useContext, useState, useLayoutEffect } from "react";
import Cookies from "js-cookie";

interface ThemeContextType {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

const defaultContext: ThemeContextType = {
  theme: "dark",
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Получаем тему из cookie или localStorage
  const getInitialTheme = (): "dark" | "light" => {
    const cookieTheme = Cookies.get("theme");
    if (cookieTheme === "dark" || cookieTheme === "light") return cookieTheme;
    const localTheme = localStorage.getItem("wolf-street-theme");
    if (localTheme === "dark" || localTheme === "light") return localTheme;
    return "dark";
  };

  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  // Синхронизируем тему с DOM до первого рендера
  useLayoutEffect(() => {
    // Добавляем/убираем класс немедленно
    document.documentElement.classList.toggle("dark", theme === "dark");

    Cookies.set("theme", theme, { expires: 365 });
    localStorage.setItem("wolf-street-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
