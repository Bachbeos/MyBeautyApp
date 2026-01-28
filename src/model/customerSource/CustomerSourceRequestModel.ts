export interface ICustomerSourceRequest {
  id?: number;
  name: string;
  status: number;
}

export interface ICustomerSourceListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
