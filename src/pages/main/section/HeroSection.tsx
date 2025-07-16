import CurrencyRates from "../../../components/ui/CurrencyRates";

interface HeroSectionProps {
  heroVisible: boolean;
  setEmail: (e: string) => void;
  email: string;
}

export default function HeroSection({
  heroVisible,
  setEmail,
  email,
}: HeroSectionProps) {
  const handleStart = () => alert(`Введён email: ${email}`);

  return (
    <>
      <section
        id="main"
        className="snap-start relative flex flex-col items-center justify-center min-h-screen h-screen p-0 border-b border-light-border dark:border-dark-border w-full m-0 bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg overflow-hidden"
      >
        {/* Анимированный градиентный фон */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Волна 1 - основная */}
          <div className="absolute left-1/2 top-1/2 w-[650px] h-[650px] animate-gradient-wave-1">
            <div className="w-full h-full bg-gradient-to-br from-light-accent/25 via-purple-500/18 to-pink-500/25 dark:from-dark-accent/30 dark:via-emerald-400/22 dark:to-teal-400/28 rounded-full blur-3xl"></div>
          </div>

          {/* Волна 2 - вторичная */}
          <div className="absolute left-1/3 top-1/3 w-[450px] h-[450px] animate-gradient-wave-2">
            <div className="w-full h-full bg-gradient-to-tr from-blue-500/22 via-light-accent/25 to-indigo-500/22 dark:from-blue-400/25 dark:via-dark-accent/30 dark:to-cyan-400/25 rounded-full blur-3xl"></div>
          </div>

          {/* Волна 3 - акцентная */}
          <div className="absolute right-1/3 bottom-1/3 w-[550px] h-[550px] animate-gradient-wave-3">
            <div className="w-full h-full bg-gradient-to-bl from-orange-400/18 via-yellow-500/22 to-light-accent/25 dark:from-green-400/22 dark:via-dark-accent/28 dark:to-emerald-500/22 rounded-full blur-3xl"></div>
          </div>

          {/* Дополнительная подложка для глубины */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-bg/15 to-light-bg/25 dark:via-dark-bg/15 dark:to-dark-bg/25"></div>
        </div>

        <div
          className={`w-full h-full flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-24 z-10 px-4 lg:px-0 transition-all duration-700 ease-out
            ${
              heroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
        >
          {/* Левая часть: заголовок, описание, форма */}
          <div className="flex flex-col items-start justify-center w-full max-w-md lg:max-w-[460px] text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold text-light-fg dark:text-dark-fg mb-4 lg:mb-6 leading-tight tracking-tight">
              Биржа будущего{" "}
              <span className="text-light-accent dark:text-dark-accent">
                уже здесь
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-light-accent dark:text-dark-accent font-medium mb-6 lg:mb-8 max-w-full lg:max-w-[420px] leading-relaxed">
              Управляйте капиталом, инвестируйте и следите за рынком в
              премиальном стиле. Wolf Street — ваш финансовый успех начинается
              здесь.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStart();
              }}
              className="w-full flex flex-col sm:flex-row items-center gap-3 lg:gap-4 mb-4 lg:mb-6"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите ваш e-mail"
                  className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-full border border-light-accent dark:border-dark-accent outline-none bg-light-card dark:bg-dark-card text-light-fg dark:text-dark-fg text-base lg:text-lg shadow-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:ring-opacity-20 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 lg:py-3 px-6 lg:px-8 bg-light-accent dark:bg-dark-accent text-light-nav-text dark:text-dark-nav-text rounded-full font-bold text-base lg:text-lg shadow-lg border-none cursor-pointer hover:scale-105 transition-transform whitespace-nowrap"
              >
                Начать
              </button>
            </form>

            <span className="text-light-fg/80 dark:text-dark-brown text-xs lg:text-sm opacity-70 text-center lg:text-left">
              * Мы не рассылаем спам. Только важные новости и инсайды.
            </span>
          </div>

          {/* Правая часть: курсы валют */}
          <div className="flex flex-col items-center justify-center w-full max-w-[350px] lg:max-w-[400px] mt-4 lg:mt-0">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg p-6 w-full border border-light-accent dark:border-dark-accent">
              <h3 className="text-base font-semibold mb-4 text-light-accent dark:text-dark-accent text-center flex items-center justify-center gap-2">
                Актуальные курсы
              </h3>
              <CurrencyRates compact={true} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
