export interface IUserLoginRequest {
  phone: string;
  plainPassword: string;
}

export interface IUserRegisterRequest {
  phone: string;
  plainPassword: string;
  name: string;
}

export interface IUserUpdateRequest {
  id?: number;
  name?: string;
  avatar?: string;
  phone: string;
  email?: string;
  plainPassword?: string;
  role_id?: number;
  active?: number;
  [key: string]: unknown;
}

export interface IUserListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
