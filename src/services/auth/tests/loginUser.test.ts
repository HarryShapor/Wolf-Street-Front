import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, saveTokens, getAccessToken, getRefreshToken, clearTokens } from '../Login';
import api from '../../Api';
import type { LoginRequest, LoginResponse } from '../TypesAuth';

vi.mock('../../Api');

describe('loginUser', () => {
  const credentials: LoginRequest = {
    username: 'testuser',
    password: 'testpass',
  };
  const tokens: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearTokens();
  });

  it('должен возвращать токены при успешном логине', async () => {
    (api.post as any).mockResolvedValueOnce({ data: tokens });
    await expect(loginUser(credentials)).resolves.toEqual(tokens);
    expect(api.post).toHaveBeenCalledWith('/user-service/v1/auth/login', credentials);
  });

  it('должен выбрасывать ошибку при ошибке api', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('Ошибка входа в систему'));
    await expect(loginUser(credentials)).rejects.toThrow('Ошибка входа в систему');
  });
});

describe('saveTokens, getAccessToken, getRefreshToken, clearTokens', () => {
  const tokens: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(() => {
    clearTokens();
  });

  it('сохраняет и возвращает токены', () => {
    saveTokens(tokens);
    expect(getAccessToken()).toBe(tokens.accessToken);
    expect(getRefreshToken()).toBe(tokens.refreshToken);
  });

  it('удаляет токены', () => {
    saveTokens(tokens);
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
}); 