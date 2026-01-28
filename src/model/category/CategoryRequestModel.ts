export interface ICategoryRequest {
  id?: number;
  name: string;
  avatar?: string;
  type?: number;
  level?: number;
  parentId?: number;
  featured?: string;
  position?: number;
  active?: number;
  [key: string]: unknown;
}

export interface ICategoryListRequest {
  keyword?: string;
  page?: number;
  size?: number;
  limit?: number;
  [key: string]: unknown;
}
