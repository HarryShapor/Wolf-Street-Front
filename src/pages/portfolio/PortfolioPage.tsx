import React, { useState } from "react";
import Header from "../../components/header/Header";
import LeftMenu from './LeftMenu';
import ProfileSection from './ProfileSection';
import SettingsPanel from './SettingsPanel';
import VerificationSection from './VerificationSection';
import DepositSection from './DepositSection';
import TradeSection from './TradeSection';
import AssetsSection from './AssetsSection';
import HistorySection from './HistorySection';
import { useNavigate } from "react-router-dom";

const SECTIONS: { [key: string]: React.FC<any> } = {
  'Портфель': (props) => <ProfileSection onGoToDeposit={() => {}} {...props} />,
  'Безопасность': VerificationSection,
  'Пополните счет': DepositSection,
  'Совершите сделку': TradeSection,
  'Ваши активы': AssetsSection,
  'assets-overview': AssetsSection,
  'История операций': HistorySection,
  'Настройки': SettingsPanel,
};

const MENU_LABELS = [
  'Портфель',
  'Безопасность',
  'Пополните счет',
  'Совершите сделку',
  'Ваши активы',
  'История операций',
  'Настройки',
];

export default function PortfolioPage({ NAV }: { NAV: { id: string, label: string}[] }) {
  const [activeMenu, setActiveMenu] = useState('Портфель');
  const SectionComponent = SECTIONS[activeMenu] || ProfileSection;
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg font-sans pt-20 relative overflow-hidden">
      {/* Шапка сайта */}
      <Header
        NAV={NAV}
        setSearchPos={() => {}}
        scrolled={false}
        activeSection={""}
        headerVisible={true}
        setSearchOpen={() => {}}
        searchOpen={false}
      />
      <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 min-h-[calc(100vh-80px)] grid grid-cols-1 md:grid-cols-[minmax(260px,320px)_1fr] gap-4 justify-items-start">
        {/* Левое меню */}
        <aside className="w-full md:w-auto min-w-[260px] max-w-[340px] mt-8 md:mt-16 md:-ml-4">
          <LeftMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} menuLabels={MENU_LABELS} />
        </aside>
        {/* Контент */}
        <main className="w-full flex flex-col gap-5">
          <div key={activeMenu} className="animate-portfolio-fade">
            {activeMenu === 'Портфель'
              ? <ProfileSection onGoToDeposit={() => setActiveMenu('Пополните счет')} />
              : <SectionComponent />}
          </div>
        </main>
      </div>
    </div>
  );
}
