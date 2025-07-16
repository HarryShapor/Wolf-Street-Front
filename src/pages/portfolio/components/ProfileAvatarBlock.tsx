import React from 'react';
import EditButton from './EditButton';
import DEFAULT_AVATAR_SVG from '../../../components/ui/defaultAvatar';

interface ProfileAvatarBlockProps {
  avatar: string;
  nickname: string;
  onEdit: () => void;
}

const ProfileAvatarBlock: React.FC<ProfileAvatarBlockProps> = ({ avatar, nickname, onEdit }) => (
  <div className="flex flex-col items-center justify-center h-full min-w-[180px] max-w-[220px]">
    <img alt="avatar" src={avatar || DEFAULT_AVATAR_SVG} className="w-32 h-32 rounded-full border-3 border-light-accent dark:border-dark-accent object-cover shadow-lg transition-transform duration-200 hover:scale-105" />
    <div className="text-[17px] font-bold mt-2 mb-1 text-light-fg dark:text-dark-fg text-center truncate max-w-[180px]">{nickname}</div>
    <EditButton onClick={onEdit} className="mt-2" />
  </div>
);

export default ProfileAvatarBlock; 