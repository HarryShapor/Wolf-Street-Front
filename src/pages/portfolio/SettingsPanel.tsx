import React, { useState, useRef, useEffect } from 'react';
import ModalEditProfile from './components/ModalEditProfile';
import ModalColorSettings from './components/ModalColorSettings';
import ModalTimezonePicker from './components/ModalTimezonePicker';
import ModalChartStyle from './components/ModalChartStyle';
import EditButton from './components/EditButton';
import ProfileFieldBlock from './components/ProfileFieldBlock';
import ProfileAvatarBlock from './components/ProfileAvatarBlock';
import CustomSwitch from './components/CustomSwitch';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { LoaderBlock, ErrorBlock } from '../../components/ui/LoadingButton';
import Modal from '../../components/ui/Modal';
import DEFAULT_AVATAR_SVG from '../../components/ui/defaultAvatar';
import { getUserAvatarUrl } from '../../services/AvatarService';
import { API_HOST } from '../../services/Api';
import { useNavigate } from "react-router-dom";

// const API_BASE = "http://158.160.190.168:8080/user-service/api/v1";
const API_BASE = `${API_HOST}/user-service/api/v1`;
const PASSWORD_COOKIE_KEY = "password";
const PASSWORD_ENCRYPT_KEY = "demo-key";

export default function SettingsPanel() {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [colorModal, setColorModal] = useState(false);
  const [timezoneModal, setTimezoneModal] = useState(false);
  const [chartStyleModal, setChartStyleModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_SVG);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('********');
  const [colorScheme, setColorScheme] = useState<'green-red'|'red-green'>('green-red');
  const [timezone, setTimezone] = useState('UTC+3');
  const [chartColors, setChartColors] = useState({ up: '#22d3a8', down: '#f43f5e' });
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [browserNotif, setBrowserNotif] = useState(true);
  const [customTheme, setCustomTheme] = useState(false);
  const tzBtnRef = useRef<HTMLButtonElement | null>(null);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния для инлайн-редактирования
  const [editingField, setEditingField] = useState<'email'|'phone'|'password'|'firstname'|'lastname'|'username'|null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  // Состояния для массового редактирования
  const [editingProfileFields, setEditingProfileFields] = useState(false);
  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Состояния для модальных уведомлений
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Для отслеживания, был ли 401 после успешного изменения
  const [pendingLogout, setPendingLogout] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setNickname(res.data.username || '');
        setEmail(res.data.email || '');
        setPhone(res.data.phone || '');
        setFirstname(res.data.firstname || '');
        setLastname(res.data.lastname || '');
        // setAvatar(res.data.avatar || avatar); // УДАЛЕНО!
        setEditFirstname(res.data.firstname || '');
        setEditLastname(res.data.lastname || '');
        setEditEmail(res.data.email || '');
        setEditPhone(res.data.phone || '');
      } catch (err) {
        setError('Не удалось загрузить данные пользователя');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // Получаем и расшифровываем пароль из cookie, если есть
    const encrypted = Cookies.get(PASSWORD_COOKIE_KEY);
    if (encrypted) {
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, PASSWORD_ENCRYPT_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) setPassword(decrypted);
      } catch {}
    }
  }, []);

  // --- Новый useEffect для аватара ---
  useEffect(() => {
    const updateAvatar = async () => {
      const url = await getUserAvatarUrl();
      setAvatar(url);
    };
    updateAvatar();
  }, [nickname, email, phone]);

  // useEffect для загрузки пароля из cookie при монтировании и при изменении cookie
  useEffect(() => {
    const loadPasswordFromCookie = () => {
      const encrypted = Cookies.get(PASSWORD_COOKIE_KEY);
      if (encrypted) {
        try {
          const bytes = CryptoJS.AES.decrypt(encrypted, PASSWORD_ENCRYPT_KEY);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (decrypted) setPassword(decrypted);
        } catch {}
      }
    };
    loadPasswordFromCookie();
  }, []);

  // Сброс showPassword и полей смены пароля при открытии редактирования пароля
  useEffect(() => {
    if (editingField === 'password') {
      setShowPassword(false);
      // Автозаполнение старого пароля, если он есть и не '********'
      setOldPassword(password && password !== '********' ? password : '');
      setNewPassword(''); // всегда сбрасываем
      setPasswordError('');
    }
  }, [editingField]);

  const handleProfileSave = async (data: { nickname: string; avatar: string; avatarFile: File | null }) => {
    let nicknameChanged = false;
    try {
      const res = await axios.get(`${API_BASE}/user/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (res.data.username && res.data.username !== nickname) {
        nicknameChanged = true;
      }
      setNickname(res.data.username || '');
      setEmail(res.data.email || '');
      setPhone(res.data.phone || '');
      setFirstname(res.data.firstname || '');
      setLastname(res.data.lastname || '');
      setEditFirstname(res.data.firstname || '');
      setEditLastname(res.data.lastname || '');
      setEditEmail(res.data.email || '');
      setEditPhone(res.data.phone || '');
      // Если включено "запомнить меня" — обновить куку с новым никнеймом
      if (Cookies.get('rememberMe') === 'true') {
        Cookies.set('rememberedUsername', res.data.username || '', { expires: 30 });
        // Если есть rememberedUsername input на странице логина — обновить его значение
        if (typeof window !== 'undefined') {
          const loginInput = document.querySelector('input[name="username"]') as HTMLInputElement | null;
          if (loginInput) loginInput.value = res.data.username || '';
        }
      }
    } catch {
      setNickname(data.nickname);
    }
    if (data.avatar) {
      try {
        const url = await getUserAvatarUrl();
        setAvatar(url);
      } catch {
        setAvatar(DEFAULT_AVATAR_SVG);
      }
    }
    setEditProfileModal(false);
    if (data.nickname && data.nickname !== nickname) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      Cookies.remove(PASSWORD_COOKIE_KEY);
      navigate("/login?profileUpdated=1", { replace: true });
      return;
    }
  };

  // Обработчик смены пароля
  const handlePasswordSave = async () => {
    setPasswordError('');
    if (!oldPassword || !newPassword) {
      setPasswordError('Заполните оба поля');
      return;
    }
    // Сравниваем oldPassword с расшифрованным паролем из cookie
    if (oldPassword !== password) {
      setPasswordError('Старый пароль неверен');
      return;
    }
    try {
      await axios.post(`${API_BASE}/auth/change-password`, {
        newPassword,
        currentPassword: oldPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setModalTitle('Пароль изменён');
      setModalMessage('Пароль успешно изменён. Войдите с новым паролем.');
      setModalOpen(true);
      setEditingField(null); // Закрываем модалку смены пароля
      // Если включено "запомнить меня" — обновить куку с новым паролем
      if (Cookies.get('rememberMe') === 'true') {
        const encrypted = CryptoJS.AES.encrypt(newPassword, PASSWORD_ENCRYPT_KEY).toString();
        Cookies.set(PASSWORD_COOKIE_KEY, encrypted, { expires: 30 });
      }
      setPassword(newPassword); // обновляем password в state для автозаполнения
    } catch (err: any) {
      let msg = 'Ошибка при смене пароля';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          msg = 'Старый пароль неверен или сессия истекла';
        } else if (err.response.status === 400) {
          msg = 'Некорректный новый пароль';
        }
      }
      setModalTitle('Ошибка');
      setModalMessage(msg);
      setModalOpen(true);
    }
  };

  // Универсальный обработчик сохранения поля профиля
  const handleProfileFieldSave = async (field: string, value: string) => {
    // Формируем новое состояние
    const updated = {
      username: field === 'username' ? value : nickname,
      email: field === 'email' ? value : email,
      phone: field === 'phone' ? value : phone,
      firstname: field === 'firstname' ? value : firstname,
      lastname: field === 'lastname' ? value : lastname,
    };
    try {
      await axios.put(`${API_BASE}/user/me`, updated, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setNickname(updated.username);
      setEmail(updated.email);
      setPhone(updated.phone);
      setFirstname(updated.firstname);
      setLastname(updated.lastname);
      setModalTitle('Профиль обновлён');
      setModalMessage('Данные успешно сохранены.');
      setModalOpen(true);
      setEditingField(null);
    } catch (err) {
      setModalTitle('Ошибка');
      setModalMessage('Не удалось сохранить изменения.');
      setModalOpen(true);
    }
  };

  // Массовое сохранение профиля
  const handleSaveProfileFields = async () => {
    // Проверка изменений
    if (
      editFirstname === firstname &&
      editLastname === lastname &&
      editEmail === email &&
      editPhone === phone
    ) {
      setEditingProfileFields(false);
      return;
    }
    const updated = {
      username: nickname, // Никнейм не меняем отсюда
      email: editEmail,
      phone: editPhone,
      firstname: editFirstname,
      lastname: editLastname,
    };
    try {
      await axios.put(`${API_BASE}/user/me`, updated, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setFirstname(editFirstname);
      setLastname(editLastname);
      setEmail(editEmail);
      setPhone(editPhone);
      setModalTitle('Профиль обновлён');
      setModalMessage('Данные успешно сохранены.');
      setModalOpen(true);
      setEditingProfileFields(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setModalTitle('Требуется повторная авторизация');
          setModalMessage('Данные успешно изменены. Для продолжения требуется повторная авторизация.');
          setModalOpen(true);
          setPendingLogout(true);
          return;
        } else if (err.response.status === 404) {
          setModalTitle('Пользователь не найден');
          setModalMessage('Пользователь не найден.');
          setModalOpen(true);
          return;
        }
      }
      setModalTitle('Ошибка');
      setModalMessage('Не удалось сохранить изменения.');
      setModalOpen(true);
    }
  };
  const handleCancelEdit = () => {
    setEditFirstname(firstname);
    setEditLastname(lastname);
    setEditEmail(email);
    setEditPhone(phone);
    setEditingProfileFields(false);
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setNickname(res.data.username || '');
        setEmail(res.data.email || '');
        setPhone(res.data.phone || '');
        // ---
        // Фейковые данные:
        setNickname('demo_user');
        setEmail('demo@example.com');
        setPhone('+7 999 123-45-67');
      } catch (err) {
        setError('Не удалось загрузить данные пользователя');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (loading) return <LoaderBlock text="Загружаем настройки..." />;
  if (error) return <ErrorBlock text={error} onRetry={handleRetry} />;

  // Логирование для диагностики
  console.log('render editingField', editingField, 'showPassword', showPassword);
  return (
    <div className="w-full max-w-screen-lg mx-auto mt-8 px-2 sm:px-4">
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
      {/* Модальные уведомления */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (pendingLogout) {
            setPendingLogout(false);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            Cookies.remove(PASSWORD_COOKIE_KEY);
            window.location.href = "/login";
          }
          if (modalTitle === 'Пароль изменён') {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            Cookies.remove(PASSWORD_COOKIE_KEY);
            window.location.href = "/login?passwordChanged=1";
          }
        }}
        title={modalTitle}
      >
        <div className="text-center text-lg py-2">{modalMessage}</div>
      </Modal>
      {/* Заголовок */}
      <h1 className="text-[28px] font-extrabold mb-8 text-light-accent dark:text-dark-accent text-center">Настройки</h1>
      {/* Никнейм и аватар + компактный блок данных */}
      <div className="bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-[#181926] rounded-2xl shadow-2xl card-glow backdrop-blur-md bg-opacity-90 hover:shadow-2xl transition-all p-4 sm:p-6 md:p-8 mb-8 border border-light-border dark:border-dark-border flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 min-h-[220px]">
        {/* Данные профиля */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* --- Контактные данные --- */}
          <div className="w-full max-w-lg mx-auto mb-8">
            <div className="flex items-center justify-between mb-1">
              <div className="text-base font-semibold text-light-accent dark:text-dark-accent">Контактные данные</div>
              {!editingProfileFields && (
                <button
                  className="p-2 rounded-full hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition"
                  onClick={() => setEditingProfileFields(true)}
                  aria-label="Редактировать контактные данные"
                >
                  <svg className="w-5 h-5 text-light-accent dark:text-dark-accent" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z" /></svg>
                </button>
              )}
            </div>
            <div className="bg-white/80 dark:bg-dark-bg/80 rounded-xl shadow-xl p-4 sm:p-6 border border-light-border/40 dark:border-dark-border/40 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6">
                {editingProfileFields ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-light-fg/80">Имя</label>
                      <input
                        className="w-full h-12 text-[16px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-3 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all placeholder:text-light-fg/40 dark:placeholder:text-dark-nav-inactive italic"
                        value={editFirstname}
                        onChange={e => setEditFirstname(e.target.value)}
                        placeholder="Имя"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-light-fg/80">Фамилия</label>
                      <input
                        className="w-full h-12 text-[16px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-3 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all placeholder:text-light-fg/40 dark:placeholder:text-dark-nav-inactive italic"
                        value={editLastname}
                        onChange={e => setEditLastname(e.target.value)}
                        placeholder="Фамилия"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-light-fg/80">Email</label>
                      <input
                        className="w-full h-12 text-[16px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-3 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all placeholder:text-light-fg/40 dark:placeholder:text-dark-nav-inactive italic"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-light-fg/80">Телефон</label>
                      <input
                        className="w-full h-12 text-[16px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-4 py-3 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all placeholder:text-light-fg/40 dark:placeholder:text-dark-nav-inactive italic"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="Телефон"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileFieldBlock label="Имя" value={firstname} editing={false} placeholder="Имя не указано" />
                    <ProfileFieldBlock label="Фамилия" value={lastname} editing={false} placeholder="Фамилия не указана" />
                    <ProfileFieldBlock label="Email" value={email} editing={false} placeholder="Email не указан" />
                    <ProfileFieldBlock label="Телефон" value={phone} editing={false} placeholder="Телефон не указан" />
                  </>
                )}
              </div>
              {editingProfileFields && (
                <div className="flex flex-col md:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-lg px-6 py-2 shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 text-[15px] hover:scale-[1.04] hover:shadow-xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
                    onClick={handleSaveProfileFields}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 text-light-accent dark:text-dark-accent font-semibold rounded-lg px-6 py-2 shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 text-[15px] hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-white hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30"
                    onClick={handleCancelEdit}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* --- Пароль --- */}
          <div className="w-full max-w-lg mx-auto mb-8 border-t border-light-accent/15 dark:border-dark-accent/15 pt-8">
            <div className="flex items-center justify-between mb-1">
              <div className="text-base font-semibold text-light-accent dark:text-dark-accent">Пароль</div>
              {editingField !== 'password' && (
                <button
                  className="p-2 rounded-full hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition"
                  onClick={() => setEditingField('password')}
                  aria-label="Изменить пароль"
                >
                  <svg className="w-5 h-5 text-light-accent dark:text-dark-accent" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z" /></svg>
                </button>
              )}
            </div>
            <div className="bg-white/80 dark:bg-dark-bg/80 rounded-xl shadow-xl p-2 border border-light-border/40 dark:border-dark-border/40 relative min-h-[44px]">
              <div className="relative flex items-center text-[16px] text-light-fg dark:text-dark-fg font-medium min-h-[40px]">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  onFocus={e => e.target.select()}
                  className="w-full h-10 text-[15px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-3 pr-12 py-2 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all select-all cursor-default"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-fg dark:text-dark-fg opacity-60 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.519-3.568M6.343 6.343A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-2.519 3.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Аватар и никнейм справа */}
        <div className="flex flex-col items-center justify-center min-w-[140px] sm:min-w-[180px] md:min-w-[220px] max-w-[260px] w-full gap-4 sm:gap-6 mt-8 md:mt-12">
          <img
            src={avatar}
            alt="avatar"
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-light-accent dark:border-dark-accent object-cover shadow-lg"
          />
          <div className="font-bold text-lg sm:text-xl md:text-2xl text-center mt-2 text-light-fg dark:text-dark-fg break-words">{nickname}</div>
          <button
            className="w-full max-w-[180px] py-2 sm:py-2.5 md:py-3 bg-light-accent dark:bg-dark-accent hover:bg-light-accent/80 dark:hover:bg-dark-accent/80 text-white font-semibold rounded-xl shadow text-base sm:text-lg transition"
            onClick={() => setEditProfileModal(true)}
          >
            Изменить
          </button>
        </div>
      </div>
      {/* Уведомления */}
      <div className="bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-[#181926] rounded-2xl shadow-lg card-glow backdrop-blur-md bg-opacity-90 hover:shadow-2xl transition-all p-4 sm:p-6 md:p-8 mb-8 border border-light-border dark:border-dark-border max-w-full">
        <div className="text-lg md:text-xl font-bold text-light-accent dark:text-dark-accent mb-1">Уведомления</div>
        <div className="text-light-fg/80 dark:text-dark-nav-inactive text-base md:text-[15px] mb-6 max-w-2xl">Управляйте своими уведомлениями — выберите, как мы можем держать вас в курсе самого важного. Мы ценим ваше доверие и никогда не будем злоупотреблять вашим вниманием.</div>
        <div className="space-y-4 md:space-y-6">
          {/* Email уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Получать рассылку на Email</div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">Получайте <span className="text-light-accent dark:text-dark-accent font-semibold">важные новости</span>, обновления и персональные предложения на вашу электронную почту. Мы не рассылаем спам и заботимся о вашей приватности.</div>
            </div>
            <CustomSwitch checked={emailNotif} onChange={setEmailNotif} ariaLabel="Email уведомления" />
          </div>
          {/* SMS уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Получать рассылку на телефон (SMS)</div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">Оперативные уведомления о <span className="text-light-accent dark:text-dark-accent font-semibold">безопасности</span> и важных событиях. Только действительно важная информация — никаких рекламных сообщений.</div>
            </div>
            <CustomSwitch checked={smsNotif} onChange={setSmsNotif} ariaLabel="SMS уведомления" />
          </div>
          {/* Push уведомления */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Push-уведомления в браузере</div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">Будьте в курсе событий в <span className="text-light-accent dark:text-dark-accent font-semibold">реальном времени</span> прямо в браузере. Вы всегда сможете изменить этот выбор в настройках.</div>
            </div>
            <CustomSwitch checked={browserNotif} onChange={setBrowserNotif} ariaLabel="Push уведомления" />
          </div>
        </div>
      </div>
      {/* Предпочитаемые настройки */}
      <div className="bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-[#181926] rounded-2xl shadow-lg card-glow backdrop-blur-md bg-opacity-90 hover:shadow-2xl transition-all p-4 sm:p-6 md:p-8 mb-8 border border-light-border dark:border-dark-border max-w-full">
        <div className="text-lg md:text-xl font-bold text-light-accent dark:text-dark-accent mb-1">Предпочитаемые настройки</div>
        <div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          {/* Цветовая схема */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Настройка цвета</div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">{colorScheme === 'green-red' ? <span className="text-green-400 font-semibold">Зелёный</span> : <span className="text-red-400 font-semibold">Красный</span>} — рост / <span className="text-red-400 font-semibold">красный</span> — падение</div>
            </div>
            <button
              className="bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[130px] text-center hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              onClick={() => setColorModal(true)}
            >Изменить</button>
          </div>
          {/* Стиль графика */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Настройка стиля</div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">{customTheme ? <span className="text-light-accent font-semibold">Пользовательская</span> : 'Стандартная'}</div>
            </div>
            <button
              className="bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[130px] text-center hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              onClick={() => setChartStyleModal(true)}
            >Изменить</button>
          </div>
          {/* Часовой пояс */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Часовой пояс, <span className="font-normal">{timezone}</span></div>
              <div className="text-[14px] text-light-fg/80 dark:text-dark-nav-inactive">Europe/Moscow</div>
            </div>
            <button
              ref={tzBtnRef}
              className="bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[130px] text-center hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
              onClick={() => setTimezoneModal(true)}
            >Изменить</button>
          </div>
          {/* Горячие клавиши */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Горячие клавиши</div>
            </div>
            <button
              className="bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[130px] text-center hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            >Изменить</button>
          </div>
          {/* Тема */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-light-fg dark:text-dark-fg">Тема</div>
            </div>
            <div className="flex items-center gap-2">
              <CustomSwitch
                checked={theme === 'dark'}
                onChange={v => setTheme(v ? 'dark' : 'light')}
                ariaLabel="Переключить тему"
              />
              <span className="text-[15px] text-light-fg/80 dark:text-dark-nav-inactive">Тёмная</span>
              <span className="ml-1 text-[18px]">🌙</span>
            </div>
          </div>
        </div>
      </div>
      {/* Модалка смены пароля */}
      <ModalChangePassword
        open={editingField === 'password'}
        onClose={() => setEditingField(null)}
        oldPassword={oldPassword}
        newPassword={newPassword}
        setOldPassword={setOldPassword}
        setNewPassword={setNewPassword}
        passwordError={passwordError}
        onSave={handlePasswordSave}
      />
    </div>
  );
}

// Вставка компонента модалки смены пароля
function ModalChangePassword({
  open,
  onClose,
  oldPassword,
  newPassword,
  setOldPassword,
  setNewPassword,
  passwordError,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  oldPassword: string;
  newPassword: string;
  setOldPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  passwordError: string;
  onSave: () => void;
}) {
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        {/* Скрытые фейковые поля для борьбы с автозаполнением браузера */}
        <input type="text" name="fakeusernameremembered" style={{display: 'none'}} autoComplete="username" tabIndex={-1} />
        <input type="password" name="fakepasswordremembered" style={{display: 'none'}} autoComplete="new-password" tabIndex={-1} />
        <button
          className="absolute top-4 right-4 text-light-fg/60 dark:text-dark-fg/60 hover:text-light-accent dark:hover:text-dark-accent text-2xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
        <div className="text-xl font-bold mb-4 text-center text-light-accent dark:text-dark-accent">Смена пароля</div>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              placeholder="Старый пароль"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              name="oldPassCustom"
              autoComplete="current-password-fake"
              className="w-full h-10 text-[15px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-3 pr-12 py-2 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all select-all"
            />
            <button
              type="button"
              onClick={() => setShowOld(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-fg dark:text-dark-fg opacity-60 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
              aria-label={showOld ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showOld ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.519-3.568M6.343 6.343A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-2.519 3.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Новый пароль"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              name="newPassCustom"
              autoComplete="new-password"
              className="w-full h-10 text-[15px] font-medium bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-3 pr-12 py-2 outline-none focus:border-light-accent dark:focus:border-dark-accent focus:ring-1 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 transition-all select-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-fg dark:text-dark-fg opacity-60 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
              aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showNew ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.519-3.568M6.343 6.343A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-2.519 3.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && <div className="text-red-500 text-[14px]">{passwordError}</div>}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-lg px-6 py-2 shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 text-[15px] hover:scale-[1.04] hover:shadow-xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            onClick={onSave}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Сохранить
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 text-light-accent dark:text-dark-accent font-semibold rounded-lg px-6 py-2 shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 text-[15px] hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-white hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
} 