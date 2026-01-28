import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Lấy token
 */
export const getToken = async (): Promise<string> => {
  try {
    let token: string | null = null;

    // 1. Xử lý cho Web
    if (Platform.OS === "web") {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      token = match ? decodeURIComponent(match[2]) : null;
    }
    // 2. Xử lý cho Mobile (Android/iOS)
    else {
      token = await SecureStore.getItemAsync("token");
    }

    return token || "";
  } catch (error) {
    console.error("Lỗi lấy token:", error);
    return "";
  }
};

export function getCookie(name: string): string {
  if (Platform.OS !== "web") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
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
