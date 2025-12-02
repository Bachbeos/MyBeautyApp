import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Lấy token (Hỗ trợ cả Mobile & Web)
 */
export const getToken = async (): Promise<string | null> => {
  try {
    // Nếu chạy trên Web
    if (Platform.OS === 'web') {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    // Nếu chạy trên Mobile (Android/iOS)
    const token = await SecureStore.getItemAsync('token');
    return token;
  } catch (error) {
    console.error('Lỗi lấy token:', error);
    return null;
  }
};

/**
 * Giữ lại hàm cũ để tránh lỗi import ở file khác (nếu có dùng)
 */
export function getCookie(name: string): string {
  if (Platform.OS !== 'web') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

/**
 * Delay function
 */
export function runWithDelay<T>(fn: () => Promise<T>, delayMs: number = 1500): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      fn().then(resolve);
    }, delayMs);
  });
}
