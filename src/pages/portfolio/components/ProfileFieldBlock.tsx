import React, { useState } from 'react';
import EditButton from './EditButton';

interface ProfileFieldBlockProps {
  label: string;
  value: string;
  editing?: boolean;
  onEdit?: () => void;
  onSave?: (v: string) => void;
  onCancel?: () => void;
  onChange?: (v: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
}

const ProfileFieldBlock: React.FC<ProfileFieldBlockProps> = ({
  label,
  value,
  editing = false,
  onEdit,
  onSave,
  onCancel,
  onChange,
  type = 'text',
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center gap-4 bg-light-bg/80 dark:bg-dark-bg/80 border border-light-border dark:border-dark-border rounded-lg px-4 py-3 transition hover:bg-light-bg/90 dark:hover:bg-dark-bg/90">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-light-fg/70 mb-1">{label}</div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type={type === 'password' && !showPassword ? 'password' : 'text'}
              value={value}
              onChange={e => onChange && onChange(e.target.value)}
              name={type === 'password' ? 'profilePassCustom' : undefined}
              autoComplete={type === 'password' ? 'current-password-fake' : undefined}
              className="w-full text-[16px] font-semibold bg-light-bg dark:bg-dark-bg border rounded-lg px-3 py-2 outline-none transition-colors duration-200 border-light-accent dark:border-dark-accent text-light-fg dark:text-dark-fg"
            />
            {type === 'password' && (
              <button
                type="button"
                className="ml-[-36px] z-10 text-light-fg/80 dark:text-dark-nav-inactive hover:text-light-accent dark:hover:text-dark-accent transition"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c1.846 0 3.597-.5 5.07-1.277M6.228 6.228A10.45 10.45 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.46 10.46 0 01-4.293 4.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544" />
                  </svg>
                )}
              </button>
            )}
          </div>
        ) : (
          value ? (
            <div className="text-[16px] text-light-fg dark:text-dark-fg truncate">{type === 'password' ? '********' : value}</div>
          ) : (
            <div className="text-[16px] text-light-fg/40 dark:text-dark-nav-inactive italic truncate">{placeholder || ''}</div>
          )
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <button
            className="bg-gradient-to-r from-light-accent/90 to-light-accent/70 dark:from-dark-accent/90 dark:to-dark-accent/70 text-white font-semibold rounded-xl px-7 py-2.5 shadow-xl border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[120px] hover:scale-[1.04] hover:shadow-2xl hover:ring-2 hover:ring-light-accent/30 dark:hover:ring-dark-accent/30 focus:outline-none focus:ring-2 focus:ring-light-accent/40 dark:focus:ring-dark-accent/40"
            onClick={() => onSave && onSave(value)}
          >Сохранить</button>
          <button
            className="bg-gradient-to-r from-white/80 to-light-card/80 dark:from-dark-card/70 dark:to-[#181926]/80 text-light-accent dark:text-dark-accent font-semibold rounded-xl px-7 py-2.5 shadow border border-light-accent/30 dark:border-dark-accent/30 backdrop-blur-sm transition-all duration-200 w-[120px] hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 hover:text-white hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30"
            onClick={onCancel}
          >Отмена</button>
        </div>
      ) : (
        onEdit ? <EditButton onClick={onEdit} /> : null
      )}
    </div>
  );
};

export default ProfileFieldBlock; 