//Login
export interface IUserLoginRequest {
  phone: string;
  plainPassword: string;
}

//Register
export interface IUserRegisterRequest {
  phone: string;
  plainPassword: string;
  name: string;
}

//User
export interface IUserUpdateRequest {
  id?: number;
  name?: string;
  avatar?: string;
  phone: string;
  email?: string;
  plainPassword?: string;
  branchName?: string;
  roleId?: number;
  active?: number;
  [key: string]: unknown;
}

export interface IUserListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
