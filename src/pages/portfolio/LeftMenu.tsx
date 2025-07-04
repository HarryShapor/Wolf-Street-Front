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
  const [assetsOpen, setAssetsOpen] = useState(false);
  const assetsMenu = [
    { label: 'Обзор', value: 'assets-overview' },
    { label: 'Спотовый', value: 'assets-spot' },
    { label: 'Маржа', value: 'assets-margin' },
  ];

  return (
    <aside
      className="min-w-[240px] max-h-[calc(100vh-140px)] bg-gradient-to-br from-white/80 to-light-card/90 dark:from-dark-card/80 dark:to-[#181926]/90 rounded-3xl p-6 flex flex-col gap-3 shadow-2xl card-glow backdrop-blur-md bg-opacity-95 border border-light-border dark:border-dark-border fixed top-[120px] left-32 z-30 text-light-fg dark:text-dark-fg transition-all duration-300 animate-fadein overflow-y-auto"
      style={{boxShadow: '0 8px 32px 0 #a18fff22'}}
    >
      {menuLabels.map((label) => {
        if (label === 'Ваши активы') {
          const isActive = assetsMenu.some((item) => activeMenu === item.value);
          return (
            <div key={label} className="mb-2">
              <div
                className={`flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-[16px] cursor-pointer transition-all duration-200 min-w-0 max-w-full no-underline shadow-xl relative overflow-hidden border backdrop-blur-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-bold ring-2 ring-light-accent/40 dark:ring-dark-accent/40 border-light-accent/30 dark:border-dark-accent/30 scale-[1.05]'
                    : 'bg-gradient-to-r from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 text-light-fg dark:text-dark-fg border-light-border/40 dark:border-dark-border/40 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-light-accent dark:hover:text-dark-accent hover:scale-[1.03]'}
                `}
                onClick={() => setAssetsOpen((v) => !v)}
                style={{boxShadow: isActive ? '0 4px 24px 0 #a18fff33' : '0 2px 8px 0 #0001'}}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-white/90 shadow' : 'bg-light-accent/30 dark:bg-dark-accent/30'} transition-all`} />
                <span className="truncate z-10">Ваши активы</span>
                <span className={`transition-transform duration-200 ml-auto ${assetsOpen ? 'rotate-180' : ''}`}>▴</span>
              </div>
              {assetsOpen && (
                <div className="flex flex-col mt-1 ml-4">
                  {assetsMenu.map((item, idx) => (
                    <div
                      key={item.value}
                      className={`px-4 py-2 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-150
                        ${activeMenu === item.value
                          ? 'bg-[#23262F] text-white'
                          : 'text-[#8F98B2] hover:bg-[#23262F]/60 hover:text-white'}
                        ${idx === 0 ? 'mt-1' : ''}
                      `}
                      onClick={() => setActiveMenu(item.value)}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <LeftMenuButton
            key={label}
            label={label}
            onClick={() => setActiveMenu(label)}
            active={activeMenu === label}
          />
        );
      })}
    </aside>
  );
} 