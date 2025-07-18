import React, { useState } from 'react';

function LeftMenuButton({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-[16px] cursor-pointer transition-all duration-200 min-w-0 max-w-full no-underline shadow-xl relative overflow-hidden border backdrop-blur-sm
        ${active
          ? 'bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-bold ring-2 ring-light-accent/40 dark:ring-dark-accent/40 border-light-accent/30 dark:border-dark-accent/30 scale-[1.05]'
          : 'bg-gradient-to-r from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 text-light-fg dark:text-dark-fg border-light-border/40 dark:border-dark-border/40 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent hover:scale-[1.03]'}
      `}
      onClick={onClick}
      style={{boxShadow: active ? '0 4px 24px 0 #a18fff33' : '0 2px 8px 0 #0001'}}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${active ? 'bg-white/90 shadow' : 'bg-light-accent/30 dark:bg-dark-accent/30'} transition-all`} />
      <span className="truncate z-10">{label}</span>
    </div>
  );
}

export default function LeftMenu({ activeMenu, setActiveMenu, menuLabels }: { activeMenu: string, setActiveMenu: (label: string) => void, menuLabels: string[] }) {
  // const [assetsOpen, setAssetsOpen] = useState(false);
  // const assetsMenu = [
  //   { label: 'Обзор', value: 'assets-overview' },
  // ];

  return (
    <aside
      className="min-w-[260px] md:min-w-[300px] max-w-[340px] md:w-[300px] max-h-[calc(100vh-140px)] bg-gradient-to-br from-white/80 to-light-card/90 dark:from-dark-card/80 dark:to-[#181926]/90 rounded-3xl p-4 sm:p-6 flex flex-col gap-3 shadow-2xl card-glow backdrop-blur-md bg-opacity-95 border border-light-border dark:border-dark-border text-light-fg dark:text-dark-fg transition-all duration-300 animate-leftmenu-fade-in overflow-y-auto"
      style={{boxShadow: '0 8px 32px 0 #a18fff22'}}
    >
      {menuLabels
        .filter(label => label !== 'Совершите сделку' && label !== 'Безопасность')
        .map((label) => (
          <LeftMenuButton
            key={label}
            label={label}
            onClick={() => setActiveMenu(label)}
            active={activeMenu === label}
          />
        ))}
    </aside>
  );
} 