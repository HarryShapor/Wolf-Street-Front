import React, { useState, useRef } from 'react';
import ModalEditProfile from './ui/ModalEditProfile';
import ModalColorSettings from './ui/ModalColorSettings';
import ModalTimezonePicker from './ui/ModalTimezonePicker';
import ModalChartStyle from './ui/ModalChartStyle';
import EditButton from './ui/EditButton';
import ProfileFieldBlock from './ui/ProfileFieldBlock';
import ProfileAvatarBlock from './ui/ProfileAvatarBlock';

function CustomSwitch({ checked, onChange, accent = 'light' }: { checked: boolean; onChange: (v: boolean) => void; accent?: 'light' | 'dark' }) {
  return (
    <button
      type="button"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none border-2 border-transparent
        ${checked ? (accent === 'light' ? 'bg-light-accent' : 'bg-dark-accent') : 'bg-light-bg dark:bg-dark-bg'}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function SettingsPanel() {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);
  const [timezoneModal, setTimezoneModal] = useState(false);
  const [chartStyleModal, setChartStyleModal] = useState(false);
  const [nickname, setNickname] = useState('Игорь Климкин');
  const [avatar, setAvatar] = useState('https://i.imgur.com/0y0y0y0.png');
  const [email, setEmail] = useState('user@email.com');
  const [phone, setPhone] = useState('+7 900 000-XX-XX');
  const [password, setPassword] = useState('********');
  const [colorScheme, setColorScheme] = useState<'green-red'|'red-green'>('green-red');
  const [timezone, setTimezone] = useState('UTC+3');
  const [chartColors, setChartColors] = useState({ up: '#22d3a8', down: '#f43f5e' });
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [browserNotif, setBrowserNotif] = useState(true);
  const [customTheme, setCustomTheme] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const tzBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleProfileSave = (data: { nickname: string; avatar: string; avatarFile: File | null }) => {
    setNickname(data.nickname);
    setAvatar(data.avatar);
    setEditProfileModal(false);
  };

  return (
    <div className="w-full max-w-[1200px] ml-0 mr-auto mt-8 px-4">
      {/* Модалки */}
      <ModalEditProfile
        open={editProfileModal}
        onClose={() => setEditProfileModal(false)}
        palette={{}}
        currentName={nickname}
        currentAvatar={avatar}
        onSave={handleProfileSave}
      />
      <ModalColorSettings
        open={colorModal}
        onClose={() => setColorModal(false)}
        palette={{}}
        current={colorScheme}
        onConfirm={v => { setColorScheme(v); setColorModal(false); }}
      />
      <ModalTimezonePicker
        open={timezoneModal}
        anchorRef={tzBtnRef as React.RefObject<HTMLButtonElement>}
        current={timezone}
        onSelect={v => { setTimezone(v); setTimezoneModal(false); }}
        onClose={() => setTimezoneModal(false)}
        palette={{}}
      />
      <ModalChartStyle
        open={chartStyleModal}
        onClose={() => setChartStyleModal(false)}
        palette={{}}
        current={chartColors}
        onConfirm={v => { setChartColors(v); setChartStyleModal(false); }}
      />
      {/* Заголовок */}
      <h1 className="text-[28px] font-bold mb-8 text-light-fg dark:text-dark-fg">Настройки</h1>
      {/* Никнейм и аватар */}
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-8 mb-8 border border-light-border dark:border-dark-border flex flex-row items-center gap-8 min-h-[220px]">
        {/* Поля */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="text-[20px] font-semibold mb-1">Никнейм и аватар</div>
          <div className="text-light-brown dark:text-dark-brown text-[15px] mb-6">Настройте аватар и никнейм. Мы рекомендуем не использовать своё настоящее имя или ваш никнейм в соц. сетях.</div>
          <div className="space-y-5">
            {/* Email */}
            <ProfileFieldBlock
              label="Email"
              value={email}
              onEdit={() => setEditProfileModal(true)}
            />
            {/* Телефон */}
            <ProfileFieldBlock
              label="Телефон"
              value={phone}
              onEdit={() => setEditProfileModal(true)}
            />
            {/* Пароль */}
            <ProfileFieldBlock
              label="Пароль"
              value={password}
              onEdit={() => setEditProfileModal(true)}
            />
          </div>
        </div>
        {/* Аватар, никнейм и кнопка справа, по центру по вертикали */}
        <ProfileAvatarBlock
          avatar={avatar}
          nickname={nickname}
          onEdit={() => setEditProfileModal(true)}
        />
      </div>
      {/* Уведомления */}
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-8 mb-8 border border-light-border dark:border-dark-border">
        <div className="text-[20px] font-semibold mb-1">Уведомления</div>
        <div className="text-light-brown dark:text-dark-brown text-[15px] mb-6 max-w-2xl">Управляйте своими уведомлениями — выберите, как мы можем держать вас в курсе самого важного. Мы ценим ваше доверие и никогда не будем злоупотреблять вашим вниманием.</div>
        <div className="space-y-6">
          {/* Email уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Получать рассылку на Email</div>
              <div className="text-[14px] text-light-nav-inactive">Получайте <span className="text-light-accent dark:text-dark-accent font-semibold">важные новости</span>, обновления и персональные предложения на вашу электронную почту. Мы не рассылаем спам и заботимся о вашей приватности.</div>
            </div>
            <CustomSwitch checked={emailNotif} onChange={setEmailNotif} accent="light" />
          </div>
          {/* SMS уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Получать рассылку на телефон (SMS)</div>
              <div className="text-[14px] text-light-nav-inactive">Оперативные уведомления о <span className="text-light-accent dark:text-dark-accent font-semibold">безопасности</span> и важных событиях. Только действительно важная информация — никаких рекламных сообщений.</div>
            </div>
            <CustomSwitch checked={smsNotif} onChange={setSmsNotif} accent="light" />
          </div>
          {/* Push уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Push-уведомления в браузере</div>
              <div className="text-[14px] text-light-nav-inactive">Будьте в курсе событий в <span className="text-light-accent dark:text-dark-accent font-semibold">реальном времени</span> прямо в браузере. Вы всегда сможете изменить этот выбор в настройках.</div>
            </div>
            <CustomSwitch checked={browserNotif} onChange={setBrowserNotif} accent="light" />
          </div>
        </div>
      </div>
      {/* Предпочитаемые настройки */}
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-8 mb-8 border border-light-border dark:border-dark-border">
        <div className="text-[20px] font-semibold mb-1">Предпочитаемые настройки</div>
        <div className="space-y-6 mt-6">
          {/* Цветовая схема */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Настройка цвета</div>
              <div className="text-[14px] text-light-nav-inactive">{colorScheme === 'green-red' ? <span className="text-green-400 font-semibold">Зелёный</span> : <span className="text-red-400 font-semibold">Красный</span>} — рост / <span className="text-red-400 font-semibold">красный</span> — падение</div>
            </div>
            <button className="bg-light-accent dark:bg-dark-accent text-white rounded-lg px-5 py-2 font-semibold shadow hover:scale-105 transition-transform" onClick={() => setColorModal(true)}>Изменить</button>
          </div>
          {/* Стиль графика */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Настройка стиля</div>
              <div className="text-[14px] text-light-nav-inactive">{customTheme ? <span className="text-light-accent font-semibold">Пользовательская</span> : 'Стандартная'}</div>
            </div>
            <button className="bg-light-accent dark:bg-dark-accent text-white rounded-lg px-5 py-2 font-semibold shadow hover:scale-105 transition-transform" onClick={() => setChartStyleModal(true)}>Изменить</button>
          </div>
          {/* Часовой пояс */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Часовой пояс, <span className="font-normal">{timezone}</span></div>
              <div className="text-[14px] text-light-nav-inactive">Europe/Moscow</div>
            </div>
            <button ref={tzBtnRef} className="bg-light-accent dark:bg-dark-accent text-white rounded-lg px-5 py-2 font-semibold shadow hover:scale-105 transition-transform" onClick={() => setTimezoneModal(true)}>Изменить</button>
          </div>
          {/* Горячие клавиши */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Горячие клавиши</div>
            </div>
            <button className="bg-light-accent dark:bg-dark-accent text-white rounded-lg px-5 py-2 font-semibold shadow hover:scale-105 transition-transform">Изменить</button>
          </div>
          {/* Тема */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Тема</div>
            </div>
            <div className="flex items-center gap-2">
              <CustomSwitch checked={darkMode} onChange={setDarkMode} accent="dark" />
              <span className="text-[15px] text-light-nav-inactive">Тёмная</span>
              <span className="ml-1 text-[18px]">🌙</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 