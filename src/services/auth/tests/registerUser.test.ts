import { describe, it, expect, vi, beforeEach } from 'vitest';
import registerUser from '../Register';
import api from '../../Api';
import type { RegisterRequest } from '../TypesAuth';

vi.mock('../../Api');

const mockUser: RegisterRequest = {
  username: 'testuser',
  password: 'testpass',
  email: 'test@ex',
  firstname: 'Test',
  lastname: 'User',
  phone: '+1234567890',
};

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отправлять правильные данные на сервер', async () => {
    (api.post as any).mockResolvedValueOnce({});
    await expect(registerUser(mockUser)).resolves.toBeUndefined();
    expect(api.post).toHaveBeenCalledWith('/user-service/v1/auth/register', mockUser);
  });

  it('должен выбрасывать ошибку при ошибке api', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('Ошибка регистрации'));
    await expect(registerUser(mockUser)).rejects.toThrow('Ошибка регистрации');
  });
}); 