import { urlsApi } from "../configs/urls";

export interface UploadFileResponse {
  code: number;
  message: string;
  result: string;
}

export async function uploadFile(file: File, token?: string): Promise<UploadFileResponse | null> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(urlsApi.upload_image, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    if (data && data.code === 200 && data.result) {
      return { code: data.code, message: data.message, result: data.result };
    }
    return null;
  } catch {
    return null;
  }
}
