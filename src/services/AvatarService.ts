import api from './Api';
import DEFAULT_AVATAR_SVG from '../components/ui/defaultAvatar';

/**
 * Получить аватар пользователя как строку для <img src>. Если нет — дефолтный SVG.
 */
export async function getUserAvatarUrl(): Promise<string> {
  try {
    const response = await api.get('/storage/users/avatars', {
      headers: { Accept: '*/*' },
    });
    const data = response.data;
    if (typeof data === 'string' && data.length > 0) {
      if (data.startsWith('data:image/')) {
        return data;
      }
      // Если вдруг приходит просто base64 без префикса:
      return 'data:image/jpeg;base64,' + data;
    }
    return DEFAULT_AVATAR_SVG;
  } catch {
    return DEFAULT_AVATAR_SVG;
  }
}

/**
 * Загрузить новый аватар пользователя (PUT).
 * @param avatarFile - файл-аватар (image/*)
 * @returns true если успешно, иначе false
 */
export async function uploadUserAvatar(avatarFile: File): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    await api.put('/storage/users/avatars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return true;
  } catch (e) {
    return false;
  }
}

export { DEFAULT_AVATAR_SVG }; 