


export const decodeTelegramParams = (encodedParams: string) => {
    try {
      // 1. Заменяем URL-safe символы обратно
      const base64 = encodedParams
        .replace(/-/g, '+')
        .replace(/_/g, '/');
  
      // 2. Декодируем Base64
      const decoded = atob(base64);
  
      // 3. Разбиваем параметры на пары
      const params = new URLSearchParams(decoded);
  
      // 4. Преобразуем в объект
      const result: { [key: string]: string } = {};
      params.forEach((value, key) => {
        result[key] = decodeURIComponent(value);
      });
  
      return result;
    } catch (error) {
      console.error('Decoding error:', error);
      return null;
    }
};

