export interface LoginResponseFromApi {
  code: number;
  message?: string;
  result?: {
    token?: string;
    [key: string]: unknown;
  };
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  code?: number;
}

export type RawLoginResponse = LoginResponseFromApi;

export interface IUser {
  id: number;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  password?: string;
  role_id: number;
  active: number;
  regis_date: string;
}
