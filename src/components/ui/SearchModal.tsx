interface SearchModalProps {
  searchOpen: boolean;
  searchPos: { top: number; left: number } | null;
  onClose: () => void;
}

export default function SearchModal({
  searchOpen,
  searchPos,
  onClose,
}: SearchModalProps) {
  if (!searchOpen || !searchPos) return null;

  return (
    <div
      className="fixed z-[100] bg-light-card dark:bg-dark-card rounded-[18px] shadow-2xl p-0 min-w-[340px] min-h-[80px] flex flex-col items-stretch opacity-100 translate-y-0 transition-all duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)] border-[1.5px] border-light-accent dark:border-dark-accent"
      style={{
        top: searchPos.top,
        left: searchPos.left - 260,
      }}
    >
      <div className="flex items-center py-[18px] px-[18px] pb-[10px] gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="stroke-light-accent dark:stroke-dark-accent mr-2"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          autoFocus
          type="text"
          placeholder="Поиск..."
          className="flex-1 bg-transparent border-[1.5px] border-light-accent dark:border-dark-accent text-light-fg dark:text-dark-fg text-[17px] rounded-lg py-2 px-3 outline-none transition-colors duration-200 focus:outline-none focus:shadow-none"
        />

        <button
          onClick={onClose}
          className="bg-transparent border-none text-light-fg dark:text-dark-fg font-bold text-[15px] ml-2 cursor-pointer hover:opacity-70 transition-opacity"
        >
          Отменить
        </button>
      </div>
      {/* Здесь можно добавить результаты поиска или подсказки */}
    </div>
  );
}
