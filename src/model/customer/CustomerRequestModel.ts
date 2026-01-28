export interface ICustomerRequest {
  id?: number;
  name: string;
  avatar?: string;
  gender?: number;
  age?: number;
  address?: string;
  phone?: string;
  email?: string;
  birthday?: string;
  height?: number;
  weight?: number;
  userId?: number;
  creatorId?: number;
  note?: string;
  createdTime?: string;
  updatedTime?: string;
  lastestContact?: string;
  [key: string]: unknown;
}

export interface ICustomerListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
