import * as React from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaUserCheck, FaKey, FaListUl, FaLock, FaUserSecret, FaUserFriends, FaLink, FaCode, FaMobileAlt, FaPowerOff, FaTrashAlt, FaChevronRight } from 'react-icons/fa';
import { LoaderBlock } from '../../components/ui/LoadingButton';
import { API_HOST } from '../../services/Api';

const steps = [
  { label: 'Двухфакторная аутентификация (2FA)', icon: <FaKey />, enabled: false },
  { label: 'Подтверждение личности', icon: <FaUserCheck />, enabled: false },
  { label: 'Антифишинговый код', icon: <FaUserSecret />, enabled: false },
  { label: 'Белый список для вывода средств', icon: <FaListUl />, enabled: false },
];

// Получение инструментов пользователя
function UserInstrumentsBlock() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [instruments, setInstruments] = React.useState<any[]>([]);

  React.useEffect(() => {
    setLoading(true);
    setError('');
    // fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setInstruments(data);
        else setInstruments([]);
      })
      .catch(err => setError(err.message || 'Ошибка загрузки инструментов'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-10 p-6 rounded-2xl bg-light-card/80 dark:bg-dark-card/80 border border-light-border/30 dark:border-dark-border/30 shadow">
      <div className="text-[18px] font-bold text-light-accent dark:text-dark-accent mb-2">Ваши инструменты</div>
      {loading ? (
        <div className="text-light-fg/70 dark:text-dark-fg/70">Загрузка...</div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400">{error}</div>
      ) : instruments.length === 0 ? (
        <div className="text-light-fg/70 dark:text-dark-fg/70">Нет инструментов</div>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {instruments.map(inst => (
            <li key={inst.instrumentId} className="px-3 py-1 rounded-lg bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-[15px] font-mono border border-light-accent/20 dark:border-dark-accent/20">
              {inst.instrumentId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function VerificationSection() {
  // Заглушка для будущей загрузки
  const [loading] = React.useState(false); // заменить на useState(true) при интеграции с backend
  if (loading) {
    return <LoaderBlock text="Загружаем данные безопасности..." />;
  }

  return (
    <div className="bg-gradient-to-br from-light-card/90 to-light-bg/80 dark:from-dark-card/90 dark:to-[#181926]/80 rounded-3xl shadow-2xl card-glow ring-2 ring-light-accent/10 dark:ring-dark-accent/20 backdrop-blur-md border border-light-border/30 dark:border-dark-border/30 max-w-5xl mx-auto mt-8 flex flex-col gap-10 p-12 transition-all duration-300">
      {/* Проверка безопасности */}
      <div>
        <div className="flex items-center gap-3 mb-7">
          <FaShieldAlt className="text-light-accent dark:text-dark-accent text-2xl drop-shadow-glow" />
          <span className="text-[24px] font-bold text-light-accent dark:text-dark-accent">Проверка безопасности</span>
        </div>
        {/* Чек-лист шагов */}
        <div className="flex flex-wrap gap-4 mb-6">
          {steps.map((step) => (
            <div key={step.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-light-border/40 dark:border-dark-border/40 bg-white/60 dark:bg-dark-card/60 shadow-sm backdrop-blur-md transition-all duration-200 ${step.enabled ? 'text-green-500' : 'text-light-fg dark:text-dark-fg/80'} hover:shadow-lg hover:ring-2 hover:ring-light-accent/20 dark:hover:ring-dark-accent/20`}> 
              {step.icon}
              <span className="text-[15px] font-medium">{step.label}</span>
              <span className={`ml-2 text-xs font-bold ${step.enabled ? 'text-green-500' : 'text-light-accent dark:text-dark-accent'}`}>{step.enabled ? 'Включено' : 'Не настроено'}</span>
            </div>
          ))}
        </div>
        {/* Предупреждение */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-light-accent/10 to-light-bg/60 dark:from-dark-accent/10 dark:to-dark-bg/60 border border-light-accent/20 dark:border-dark-accent/20 rounded-2xl px-6 py-4 mb-7 shadow-md backdrop-blur-md animate-fadein">
          <FaExclamationTriangle className="text-light-accent dark:text-dark-accent text-xl drop-shadow-glow" />
          <div>
            <div className="font-bold text-light-accent dark:text-dark-accent mb-1">Аккаунт под угрозой</div>
            <div className="text-light-fg/80 dark:text-dark-fg text-[15px]">Вы ещё не активировали Passkey. Мы рекомендуем добавить Passkey для защиты вашей учётной записи.</div>
          </div>
          <button className="ml-auto btn-accent-glow">Добавить Passkey</button>
        </div>
        {/* Список настроек безопасности */}
        <div className="space-y-6">
          <SecuritySetting
            icon={<FaKey className="text-light-accent dark:text-dark-accent text-xl drop-shadow-glow" />}
            title="Двухфакторная аутентификация (2FA)"
            desc="Используйте Google Authenticator для защиты аккаунта и транзакций."
            status="ВЫКЛ"
            btn="Включить"
          />
          <SecuritySetting
            icon={<FaLock className="text-light-accent dark:text-dark-accent text-xl drop-shadow-glow" />}
            title="Passkey (биометрия)"
            desc="Добавьте Passkey или YubiKey для дополнительной защиты."
            status="ВЫКЛ"
            btn="Включить"
          />
        </div>
      </div>
      {/* Расширенная безопасность */}
      <SectionGlow title="Расширенная безопасность">
        <SecurityRow icon={<FaUserFriends className="text-light-accent dark:text-dark-accent" />} label="Экстренный контакт" desc="Добавьте контакты для экстренных случаев на случай неактивности аккаунта" status="ВЫКЛ" btn="Управлять" />
        <SecurityRow icon={<FaLink className="text-light-accent dark:text-dark-accent" />} label="Привязанные аккаунты" desc="Свяжите свою учётную запись со сторонними аккаунтами" status="" btn="Управлять" />
        <SecurityRow icon={<FaCode className="text-light-accent dark:text-dark-accent" />} label="Антифишинговый код" desc="Защитите свой аккаунт от фишинга и получайте письма только от нас" status="ВЫКЛ" btn="Включить" />
        <SecurityRow icon={<FaMobileAlt className="text-light-accent dark:text-dark-accent" />} label="Авторизация в приложениях" desc="Используйте свой аккаунт для входа на сторонние сайты и приложения" status="" btn="Управлять" />
      </SectionGlow>
      {/* Устройства и активность */}
      <SectionGlow title="Устройства и активность">
        <SecurityRow icon={<FaMobileAlt className="text-light-accent dark:text-dark-accent" />} label="Мои устройства" desc="Управляйте устройствами, на которых выполнен вход, и просматривайте историю своих устройств." status="" btn="Управлять" />
        <SecurityRow icon={<FaPowerOff className="text-light-accent dark:text-dark-accent" />} label="Активность аккаунта" desc={<span>История распределений: <span className="font-mono">2025-07-02 20:53:48</span><br />Подозрительная активность аккаунта?</span>} status="" btn="Больше" />
      </SectionGlow>
      {/* Управление аккаунтом */}
      <SectionGlow title="Управление аккаунтом">
        <SecurityRow icon={<FaPowerOff className="text-light-accent dark:text-dark-accent" />} label="Отключить аккаунт" desc="После блокировки аккаунта большинство ваших действий будет ограничено. Вы можете разблокировать аккаунт в любое время." status="" btn="Отключить" danger />
        <SecurityRow icon={<FaTrashAlt className="text-light-accent dark:text-dark-accent" />} label="Удалить аккаунт" desc="Удаление аккаунта необратимо. После удаления вы не сможете получить к нему доступ или просмотреть историю транзакций." status="" btn="Удалить" danger />
      </SectionGlow>
    </div>
  );
}

function SectionGlow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 rounded-2xl shadow-xl card-glow border border-light-border/30 dark:border-dark-border/30 p-7 mb-2 backdrop-blur-md">
      <div className="text-[18px] font-bold text-light-accent dark:text-dark-accent mb-4">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SecuritySetting({ icon, title, desc, status, btn }: { icon: React.ReactNode, title: string, desc: string, status: string, btn: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/70 dark:bg-dark-card/70 rounded-xl px-4 py-3 border border-light-border/30 dark:border-dark-border/30 shadow-sm backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-light-accent/20 dark:hover:ring-dark-accent/20">
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div className="text-light-fg dark:text-dark-fg font-medium">{title}</div>
        <div className="text-light-fg dark:text-dark-fg/80 text-[14px]">{desc}</div>
      </div>
      <span className="font-bold mr-2 text-light-accent dark:text-dark-accent">{status}</span>
      <button className="btn-accent-glow">{btn}</button>
    </div>
  );
}

function SecurityRow({ icon, label, desc, status, btn, danger }: { icon: React.ReactNode, label: string, desc: React.ReactNode, status?: string, btn: string, danger?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-white/80 dark:bg-dark-card/80 rounded-xl px-4 py-3 border border-light-border/30 dark:border-dark-border/30 shadow-sm backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-light-accent/20 dark:hover:ring-dark-accent/20">
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div className="text-light-fg dark:text-dark-fg font-medium">{label}</div>
        <div className="text-light-fg dark:text-dark-fg/80 text-[14px]">{desc}</div>
      </div>
      {status && <span className={`font-bold mr-2 ${status === 'ВЫКЛ' ? 'text-light-accent dark:text-dark-accent' : 'text-green-500'}`}>{status}</span>}
      <button
        className={
          danger
            ? `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-semibold
                bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-500
                text-white shadow border border-red-500/60 dark:border-red-600/60
                transition-all duration-200
                hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:ring-2 hover:ring-red-400/40
                focus:outline-none focus:ring-2 focus:ring-red-400/40
                ml-0 justify-start`
            : `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-semibold bg-gradient-to-r from-light-accent/80 to-light-accent/60 dark:from-dark-accent/80 dark:to-dark-accent/60 text-white shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:bg-light-accent/90 dark:hover:bg-dark-accent/90 hover:border-light-accent dark:hover:border-dark-accent focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 ml-0 justify-start`
        }
        type="button"
      >
        <FaChevronRight className={danger ? "text-[15px] text-white opacity-90 mr-1" : "text-[15px] opacity-70 mr-1"} />
        {btn}
      </button>
    </div>
  );
}