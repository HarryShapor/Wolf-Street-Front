import React from 'react';
import clsx from 'clsx';
import DEFAULT_AVATAR_SVG from '../../../components/ui/defaultAvatar';

interface ProfileHeaderProps {
  avatar: string;
  nickname: string;
  status: 'Обычный' | 'VIP';
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ avatar, nickname, status }) => {
  return (
    <div className="flex items-center gap-7 mb-8 px-2">
      <div className="relative">
        <img
          alt="avatar"
          src={avatar || DEFAULT_AVATAR_SVG}
          className="w-32 h-32 rounded-full border-3 border-light-accent dark:border-dark-accent shadow-lg object-cover transition-transform duration-200 hover:scale-105"
        />
        {status === 'VIP' && (
          <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-light-accent to-light-bg dark:from-dark-accent dark:to-dark-bg flex items-center justify-center text-white text-xs font-bold shadow-lg">VIP</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1 mt-1">
        <span className="text-[26px] font-extrabold text-light-fg dark:text-dark-fg leading-tight break-words">{nickname}</span>
        {status === 'Обычный' ? (
          <span className="mt-1 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-[15px] font-semibold px-4 py-1 rounded-xl border border-light-accent dark:border-dark-accent shadow-sm cursor-pointer hover:bg-light-accent/20 dark:hover:bg-dark-accent/20 transition">
            Повысить свой статус до VIP
          </span>
        ) : (
          <span className="mt-1 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-[15px] font-semibold px-4 py-1 rounded-xl border border-light-accent dark:border-dark-accent shadow-sm">
            VIP
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader; 