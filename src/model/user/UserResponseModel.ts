//Login
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

//User
export interface IUser {
  id: number;
  name: string;
  avatar?: string;
  phone?: number;
  email?: string;
  plainPassword?: string | number;
  branchName?: string;
  roleId: number;
  active: number;
  regisDate: string;
  [key: string]: unknown;
}
