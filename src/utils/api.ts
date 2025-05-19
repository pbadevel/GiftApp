// utils/api.ts
import axios from 'axios';

// Типы данных
export interface Channel {
  channelId: string;
  image_data?: string;
  channelName: string;
  channelUrl: string;
  isSubscribed: boolean;
}

export interface Winner {
  id: number;
  ticket: string;
  name: string;
  image_url: string;
}


export interface UserData {
  id: string;
  tickets: Ticket[];
  referralLink: string;
}

export interface Ticket {
  id: string;
  number: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  allSubscribed: boolean;
  details: Channel[]
  // Array<{
  //   channelId: string;
  //   channelName: string;
  //   isSubscribed: boolean;
  // }>;
}

export interface EventEndedAt {
  
  days: number,
  hours: number,
  minutes: number,
  seconds: number
  
  
}

export interface GiftEvent {
  eventId: number;
  EndedAt: EventEndedAt[]
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Исправлено для Next.js
  headers: {
    'Content-Type': 'application/json',
  }
});

// API методы
export const apiService = {
  // Получение списка каналов
  getChannels: async (userId: string): Promise<Channel[]> => {
    try {
      const response = await api.get(`/channels/${userId}`);
      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Failed to fetch channels');
    }
  },

  getWinners: async (eventId: string): Promise<Winner[]> => {
    try {
      const response = await api.get(`/getWinners/${eventId}`);
      if (response.data.ok) {
        return response.data.result;
      }

      return response.data.ok

    } catch (_error) {
      console.error(_error)
      throw new Error('Get Winners failed');
    }
  },

  // Получение данных пользователя
  getUserData: async (userId: string, eventId: string): Promise<UserData> => {
    try {
      const response = await api.get(`/users/${userId}-${eventId}`);
      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Failed to fetch user data');
    }
  },

  getUserTickets: async (userId: string, eventId: string): Promise<UserData> => {
    try {
      const response = await api.get(`/tickets/${userId}-${eventId}`);
      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Failed to fetch tickets data');
    }
  },

  // Проверка подписок
  checkSubscriptions: async (userId: string, eventId: string): Promise<SubscriptionStatus> => {
    try {
      const response = await api.post(`/check-subscriptions/${userId}-${eventId}`);
      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Subscription check failed');
    }
  },

  getEvent: async (eventId: string): Promise<EventEndedAt> => {
    try {
      const response = await api.get(`/getEvent/${eventId}`);
      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Get Event failed');
    }
  },

  SendDataToServer: async ( userId: string, fullname: string, username: string): Promise<{ok:boolean}> => {
    try {
      const response = await api.post("/UpdateUser",
            {
                username: username,
                fullname: fullname,
                user_id: userId
            }
        );

      return response.data;
    } catch (_error) {
      console.error(_error)
      throw new Error('Get Event failed');
    }
  },
  // Создание нового билета
  
};

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Обработка HTTP ошибок
      switch (error.response.status) {
        case 401:
          // Перенаправление на страницу авторизации
          break;
        case 500:
          // Обработка серверных ошибок
          break;
        default:
          console.error('API Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);