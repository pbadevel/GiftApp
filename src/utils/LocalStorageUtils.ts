






export function getLocalStorage<T>(
    key: string,
    defaultValue: T | null = null
  ): T | null {
    // Проверяем доступность localStorage (исключаем SSR)
    if (typeof window === 'undefined') return defaultValue;
  
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
  
      // Пытаемся распарсить данные
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage (ключ: "${key}"):`, error);
      return defaultValue;
    }
  }