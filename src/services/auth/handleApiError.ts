export function handleApiError(error: any) {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 409:
        throw new Error("Пользователь с таким email или username уже существует!");
      case 401:
        throw new Error("Неверные данные для входа или сессия устарела. Пожалуйста, войдите заново.");
      case 403:
        throw new Error("Неверные имя пользователя или пароль.");
      case 404:
        throw new Error("Пользователь не найден!");
      case 500:
        throw new Error("Сервер в данный момент не доступен!");
      default:
        throw new Error(data?.message || "Неизвестная ошибка");
    }
  }
  throw new Error("Ошибка сети или сервер не отвечает");
} 