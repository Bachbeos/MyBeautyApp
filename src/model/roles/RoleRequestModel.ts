export interface IRoleListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface IRoleUpdateRequest {
  id?: number;
  name: string;
  isDefault?: number;
  isOperator?: number;
}
