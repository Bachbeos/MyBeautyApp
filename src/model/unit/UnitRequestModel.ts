export interface IUnitRequest {
  id?: number;
  name?: string;
  position?: number;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
  [key: string]: unknown;
}

export interface IUnitListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
